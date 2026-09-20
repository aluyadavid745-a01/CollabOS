namespace CollabOS.Api.AI;

public sealed record AiCommandRequest(
    string Prompt,
    string WorkspaceId,
    string[]? RequestedTools,
    string? WorkspaceContext = null
);

public sealed record AiToolDefinition(
    string Name,
    string Description,
    string[] RequiredPermissions,
    bool RequiresApproval
);

public sealed record AiCommandResponse(
    string Status,
    string Message,
    IReadOnlyCollection<AiToolDefinition> AvailableTools,
    AiProposedAction? ProposedAction,
    string? Model = null
);

public sealed record AiProposedAction(
    string ToolName,
    string Summary,
    bool RequiresApproval,
    IReadOnlyDictionary<string, object> Arguments
);
