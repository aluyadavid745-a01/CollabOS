using System.Security.Claims;
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

    public AiGateway(TeamStore teamStore, ILogger<AiGateway> logger)
    {
        _teamStore = teamStore;
        _logger = logger;
    }

    public AiCommandResponse Handle(AiCommandRequest request, ClaimsPrincipal user)
    {
        if (string.IsNullOrWhiteSpace(request.Prompt))
        {
            throw new ArgumentException("Prompt is required.");
        }

        var workspace = _teamStore.GetWorkspace(request.WorkspaceId)
            ?? throw new ArgumentException("Workspace does not exist.");

        var member = workspace.Members.FirstOrDefault(item => item.UserId == user.UserId())
            ?? throw new UnauthorizedAccessException("You are not a member of this workspace.");

        var allowedTools = ToolCatalog
            .Where(tool => tool.RequiredPermissions.All(permission => member.Permissions.Contains(permission, StringComparer.OrdinalIgnoreCase)))
            .ToArray();

        var requestedToolNames = request.RequestedTools?.Where(tool => !string.IsNullOrWhiteSpace(tool)).ToHashSet(StringComparer.OrdinalIgnoreCase) ?? [];
        var blockedTools = requestedToolNames.Except(allowedTools.Select(tool => tool.Name), StringComparer.OrdinalIgnoreCase).ToArray();
        if (blockedTools.Length > 0)
        {
            _logger.LogWarning("Blocked AI tools for user {UserId} in workspace {WorkspaceId}: {Tools}", user.UserId(), request.WorkspaceId, string.Join(", ", blockedTools));
        }

        var proposedAction = BuildProposal(request.Prompt, allowedTools);
        return new AiCommandResponse(
            "provider_not_configured",
            "AI provider execution is not configured yet. CollabOS verified your workspace membership and returned the tools this user is allowed to use.",
            allowedTools,
            proposedAction
        );
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

