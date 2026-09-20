using System.Security.Claims;
using System.Text;
using System.Text.Json;
using CollabOS.Api.Team;

namespace CollabOS.Api.AI;

public sealed class AiGateway
{
    private static readonly AiToolDefinition[] ToolCatalog =
    [
        new("create_project", "Prepare a project plan for user approval.", ["Manage Projects"], true),
        new("update_project", "Prepare project changes for user approval.", ["Manage Projects"], true),
        new("create_task", "Prepare a task for user approval.", ["Manage Projects"], true),
        new("update_task", "Prepare task changes for user approval.", ["Manage Projects"], true),
        new("assign_task", "Prepare task assignment changes for user approval.", ["Manage Projects"], true),
        new("create_milestone", "Prepare a project milestone for user approval.", ["Manage Projects"], true),
        new("get_project_status", "Read authorized project status.", ["Manage Projects"], false),
        new("get_team_workload", "Read authorized team workload.", ["View Analytics"], false),
        new("create_meeting", "Prepare a meeting for user approval.", ["Manage Meetings"], true),
        new("search_workspace", "Search authorized workspace records.", ["Manage Workspace"], false),
        new("search_files", "Search authorized workspace files.", ["Manage Files"], false),
    ];

    private readonly TeamStore _teamStore;
    private readonly ILogger<AiGateway> _logger;
    private readonly HttpClient _httpClient;
    private readonly string? _apiKey;
    private readonly string _model;

    public AiGateway(TeamStore teamStore, ILogger<AiGateway> logger, HttpClient httpClient)
    {
        _teamStore = teamStore;
        _logger = logger;
        _httpClient = httpClient;
        _apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
        _model = Environment.GetEnvironmentVariable("OPENAI_MODEL") ?? "gpt-5";
    }

    public async Task<AiCommandResponse> HandleAsync(AiCommandRequest request, ClaimsPrincipal user, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Prompt))
        {
            throw new ArgumentException("Prompt is required.");
        }

        var allowedTools = GetAllowedTools(request, user);

        var requestedToolNames = request.RequestedTools?.Where(tool => !string.IsNullOrWhiteSpace(tool)).ToHashSet(StringComparer.OrdinalIgnoreCase) ?? [];
        var blockedTools = requestedToolNames.Except(allowedTools.Select(tool => tool.Name), StringComparer.OrdinalIgnoreCase).ToArray();
        if (blockedTools.Length > 0)
        {
            _logger.LogWarning("Blocked AI tools for user {UserId} in workspace {WorkspaceId}: {Tools}", user.UserId(), request.WorkspaceId, string.Join(", ", blockedTools));
        }

        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            var proposedAction = BuildProposal(request.Prompt, allowedTools);
            return new AiCommandResponse(
                "provider_not_configured",
                "Set OPENAI_API_KEY on the CollabOS API server to enable real AI responses. CollabOS still verified the request and returned review-safe tool suggestions.",
                allowedTools,
                proposedAction,
                _model
            );
        }

        var aiText = await CreateOpenAiResponseAsync(request, allowedTools, user, cancellationToken);
        var aiProposal = TryReadProposedAction(aiText, allowedTools) ?? BuildProposal(request.Prompt, allowedTools);

        return new AiCommandResponse(
            "ok",
            string.IsNullOrWhiteSpace(aiText) ? "The AI provider returned an empty response." : aiText,
            allowedTools,
            aiProposal,
            _model
        );
    }

    private IReadOnlyCollection<AiToolDefinition> GetAllowedTools(AiCommandRequest request, ClaimsPrincipal user)
    {
        if (string.IsNullOrWhiteSpace(request.WorkspaceId))
        {
            return ToolCatalog.Where(tool => !tool.RequiresApproval).ToArray();
        }

        var workspace = _teamStore.GetWorkspace(request.WorkspaceId);
        if (workspace is null)
        {
            if (!string.IsNullOrWhiteSpace(request.WorkspaceContext))
            {
                return ToolCatalog.ToArray();
            }

            throw new ArgumentException("Workspace does not exist.");
        }

        var member = workspace.Members.FirstOrDefault(item => item.UserId == user.UserId())
            ?? throw new UnauthorizedAccessException("You are not a member of this workspace.");

        return ToolCatalog
            .Where(tool => tool.RequiredPermissions.All(permission => member.Permissions.Contains(permission, StringComparer.OrdinalIgnoreCase)))
            .ToArray();
    }

    private async Task<string> CreateOpenAiResponseAsync(
        AiCommandRequest request,
        IReadOnlyCollection<AiToolDefinition> allowedTools,
        ClaimsPrincipal user,
        CancellationToken cancellationToken)
    {
        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/responses");
        httpRequest.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _apiKey);

        var payload = new
        {
            model = _model,
            instructions = BuildSystemInstructions(),
            input = BuildModelInput(request, allowedTools, user),
            max_output_tokens = 700,
            store = false,
        };

        httpRequest.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        using var response = await _httpClient.SendAsync(httpRequest, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("OpenAI response failed with status {StatusCode}: {Body}", response.StatusCode, body);
            throw new InvalidOperationException($"AI provider failed with status {(int)response.StatusCode}.");
        }

        return ExtractOutputText(body);
    }

    private static string BuildSystemInstructions() =>
        """
        You are CollabOS AI, a workflow assistant inside a team operating system.
        Use the provided workspace context to answer concretely about projects, tasks, messages, files, calendar items, team ownership, risks, and next steps.
        Do not claim records were created, deleted, assigned, moved, or updated.
        For any write action, say it must be reviewed and approved first.
        Keep answers concise, operational, and grounded in the provided workspace context.
        If context is empty or incomplete, say what is missing.
        When proposing an action, include a final line formatted exactly as:
        PROPOSED_ACTION: {"toolName":"create_task","summary":"...","requiresApproval":true,"arguments":{"title":"..."}}
        Only use toolName values from the allowed tools list.
        """;

    private static string BuildModelInput(AiCommandRequest request, IReadOnlyCollection<AiToolDefinition> allowedTools, ClaimsPrincipal user)
    {
        var tools = allowedTools.Select(tool => new
        {
            tool.Name,
            tool.Description,
            tool.RequiresApproval,
            tool.RequiredPermissions,
        });

        return JsonSerializer.Serialize(new
        {
            user = new { id = user.UserId(), name = user.DisplayName(), email = user.Email() },
            prompt = request.Prompt,
            workspaceId = request.WorkspaceId,
            allowedTools = tools,
            workspaceContext = request.WorkspaceContext,
        });
    }

    private static string ExtractOutputText(string responseBody)
    {
        using var document = JsonDocument.Parse(responseBody);
        if (document.RootElement.TryGetProperty("output_text", out var outputText) && outputText.ValueKind == JsonValueKind.String)
        {
            return outputText.GetString() ?? string.Empty;
        }

        if (!document.RootElement.TryGetProperty("output", out var output) || output.ValueKind != JsonValueKind.Array) return string.Empty;

        var builder = new StringBuilder();
        foreach (var item in output.EnumerateArray())
        {
            if (!item.TryGetProperty("content", out var content) || content.ValueKind != JsonValueKind.Array) continue;

            foreach (var contentItem in content.EnumerateArray())
            {
                if (contentItem.TryGetProperty("text", out var text) && text.ValueKind == JsonValueKind.String)
                {
                    builder.AppendLine(text.GetString());
                }
            }
        }

        return builder.ToString().Trim();
    }

    private static AiProposedAction? TryReadProposedAction(string aiText, IReadOnlyCollection<AiToolDefinition> allowedTools)
    {
        const string marker = "PROPOSED_ACTION:";
        var index = aiText.LastIndexOf(marker, StringComparison.OrdinalIgnoreCase);
        if (index < 0) return null;

        var json = aiText[(index + marker.Length)..].Trim();
        try
        {
            using var document = JsonDocument.Parse(json);
            var root = document.RootElement;
            var toolName = root.TryGetProperty("toolName", out var toolNameElement) ? toolNameElement.GetString() : null;
            if (string.IsNullOrWhiteSpace(toolName) || allowedTools.All(tool => tool.Name != toolName)) return null;

            var tool = allowedTools.First(item => item.Name == toolName);
            var summary = root.TryGetProperty("summary", out var summaryElement) ? summaryElement.GetString() ?? tool.Description : tool.Description;
            var requiresApproval = root.TryGetProperty("requiresApproval", out var approvalElement)
                ? approvalElement.GetBoolean()
                : tool.RequiresApproval;
            var arguments = root.TryGetProperty("arguments", out var argumentsElement) && argumentsElement.ValueKind == JsonValueKind.Object
                ? JsonSerializer.Deserialize<Dictionary<string, object>>(argumentsElement.GetRawText()) ?? []
                : [];

            return new AiProposedAction(toolName, summary, requiresApproval || tool.RequiresApproval, arguments);
        }
        catch
        {
            return null;
        }
    }

    private static AiProposedAction? BuildProposal(string prompt, IReadOnlyCollection<AiToolDefinition> allowedTools)
    {
        var lower = prompt.ToLowerInvariant();
        if (!lower.Contains("create") || !lower.Contains("project")) return null;

        var tool = allowedTools.FirstOrDefault(item => item.Name == "create_project");
        if (tool is null) return null;

        return new AiProposedAction(
            tool.Name,
            "Prepare a new project plan for review. No records are written until the user approves and the backend executes the tool.",
            true,
            new Dictionary<string, object>
            {
                ["sourcePrompt"] = prompt,
                ["requiresBackendProjectApi"] = true,
            }
        );
    }
}
