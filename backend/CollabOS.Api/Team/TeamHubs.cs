using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace CollabOS.Api.Team;

[Authorize]
public abstract class WorkspaceHubBase : Hub
{
    protected static string WorkspaceGroup(string workspaceId) => $"workspace:{workspaceId}";
    protected static string ChannelGroup(string workspaceId, string channelId) => $"workspace:{workspaceId}:channel:{channelId}";

    public Task JoinWorkspace(string workspaceId) => Groups.AddToGroupAsync(Context.ConnectionId, WorkspaceGroup(workspaceId));

    public Task LeaveWorkspace(string workspaceId) => Groups.RemoveFromGroupAsync(Context.ConnectionId, WorkspaceGroup(workspaceId));
}

public sealed class ChatHub(TeamStore store) : WorkspaceHubBase
{
    public Task JoinChannel(string workspaceId, string channelId) =>
        Groups.AddToGroupAsync(Context.ConnectionId, ChannelGroup(workspaceId, channelId));

    public async Task SendMessage(CreateMessageRequest request)
    {
        var message = store.CreateMessage(request, Context.User!);
        await Clients.Group(ChannelGroup(request.WorkspaceId, request.ChannelId)).SendAsync("message.created", message);
        await Clients.Group(WorkspaceGroup(request.WorkspaceId)).SendAsync("notification.created", new
        {
            type = "message",
            workspaceId = request.WorkspaceId,
            channelId = request.ChannelId,
            messageId = message.Id
        });
    }

    public Task Typing(string workspaceId, string channelId, bool typing) =>
        Clients.OthersInGroup(ChannelGroup(workspaceId, channelId)).SendAsync("typing.changed", new
        {
            workspaceId,
            channelId,
            userId = Context.User!.UserId(),
            displayName = Context.User!.DisplayName(),
            typing
        });

    public Task ReadReceipt(string workspaceId, string channelId, string messageId) =>
        Clients.Group(ChannelGroup(workspaceId, channelId)).SendAsync("message.read", new
        {
            workspaceId,
            channelId,
            messageId,
            userId = Context.User!.UserId(),
            readAt = DateTimeOffset.UtcNow
        });

    public Task React(string workspaceId, string channelId, string messageId, string emoji) =>
        Clients.Group(ChannelGroup(workspaceId, channelId)).SendAsync("message.reaction", new
        {
            workspaceId,
            channelId,
            messageId,
            emoji,
            userId = Context.User!.UserId()
        });
}

public sealed class PresenceHub(TeamStore store) : WorkspaceHubBase
{
    public async Task SetPresence(string workspaceId, PresenceState presence)
    {
        store.UpdatePresence(workspaceId, Context.User!.UserId(), presence);
        await Clients.Group(WorkspaceGroup(workspaceId)).SendAsync("presence.changed", new
        {
            workspaceId,
            userId = Context.User!.UserId(),
            displayName = Context.User!.DisplayName(),
            presence,
            updatedAt = DateTimeOffset.UtcNow
        });
    }
}

public sealed class WorkspaceHub : WorkspaceHubBase
{
    public Task BroadcastWorkspaceUpdate(string workspaceId, string type, object payload) =>
        Clients.Group(WorkspaceGroup(workspaceId)).SendAsync("workspace.updated", new { workspaceId, type, payload });

    public Task PermissionsChanged(string workspaceId, string userId, string role, string[] permissions) =>
        Clients.Group(WorkspaceGroup(workspaceId)).SendAsync("permissions.changed", new { workspaceId, userId, role, permissions });
}

public sealed class NotificationHub : WorkspaceHubBase
{
    public Task Push(string workspaceId, string userId, string type, string title, string body) =>
        Clients.User(userId).SendAsync("notification.created", new { workspaceId, type, title, body, createdAt = DateTimeOffset.UtcNow });
}

public sealed class MeetingHub : WorkspaceHubBase
{
    public Task MeetingEvent(string workspaceId, string meetingId, string type, object payload) =>
        Clients.Group(WorkspaceGroup(workspaceId)).SendAsync("meeting.event", new { workspaceId, meetingId, type, payload });
}

public sealed class ProjectHub : WorkspaceHubBase
{
    public Task ProjectEvent(string workspaceId, string projectId, string type, object payload) =>
        Clients.Group(WorkspaceGroup(workspaceId)).SendAsync("project.event", new { workspaceId, projectId, type, payload });
}

public sealed class DocumentHub : WorkspaceHubBase
{
    public Task CursorMoved(string workspaceId, string documentId, double x, double y) =>
        Clients.OthersInGroup(WorkspaceGroup(workspaceId)).SendAsync("document.cursor", new
        {
            workspaceId,
            documentId,
            userId = Context.User!.UserId(),
            x,
            y
        });

    public Task DocumentPatch(string workspaceId, string documentId, object patch) =>
        Clients.OthersInGroup(WorkspaceGroup(workspaceId)).SendAsync("document.patch", new { workspaceId, documentId, patch });
}

public sealed class WhiteboardHub : WorkspaceHubBase
{
    public Task WhiteboardEvent(string workspaceId, string boardId, string type, object payload) =>
        Clients.OthersInGroup(WorkspaceGroup(workspaceId)).SendAsync("whiteboard.event", new { workspaceId, boardId, type, payload });
}

public sealed class AIHub : WorkspaceHubBase
{
    public async Task StreamAssistantResponse(string workspaceId, string conversationId, string prompt)
    {
        var chunks = new[] { "Analyzing workspace context", "Finding blockers", "Drafting action plan", "Ready" };

        foreach (var chunk in chunks)
        {
            await Clients.Caller.SendAsync("ai.chunk", new { workspaceId, conversationId, chunk, prompt });
            await Task.Delay(180);
        }

        await Clients.Caller.SendAsync("ai.completed", new { workspaceId, conversationId, completedAt = DateTimeOffset.UtcNow });
    }
}
