using Microsoft.AspNetCore.SignalR;

namespace CollabOS.Api.Team;

public static class TeamEndpoints
{
    public static IEndpointRouteBuilder MapTeamEndpoints(this IEndpointRouteBuilder app)
    {
        var workspaces = app.MapGroup("/api/workspaces").RequireAuthorization();
        var channels = app.MapGroup("/api/channels").RequireAuthorization();
        var messages = app.MapGroup("/api/messages").RequireAuthorization();
        var directMessages = app.MapGroup("/api/direct-messages").RequireAuthorization();
        var meetings = app.MapGroup("/api/meetings").RequireAuthorization();
        var members = app.MapGroup("/api/members").RequireAuthorization();
        var roles = app.MapGroup("/api/roles").RequireAuthorization();
        var notifications = app.MapGroup("/api/notifications").RequireAuthorization();

        workspaces.MapGet("/", (TeamStore store, HttpContext context) =>
            Results.Ok(store.GetWorkspaces(context.User)));

        workspaces.MapPost("/", async (
            CreateWorkspaceRequest request,
            TeamStore store,
            IHubContext<WorkspaceHub> hub,
            HttpContext context) =>
        {
            var workspace = store.CreateWorkspace(request, context.User);
            await hub.Clients.Group($"workspace:{workspace.Id}").SendAsync("workspace.created", workspace);
            return Results.Created($"/api/workspaces/{workspace.Id}", workspace);
        });

        workspaces.MapPost("/invite", async (
            InviteWorkspaceRequest request,
            TeamStore store,
            IHubContext<NotificationHub> hub,
            HttpContext context) =>
        {
            var invite = store.CreateInvite(request, context.User);
            await hub.Clients.Group($"workspace:{invite.WorkspaceId}").SendAsync("invite.created", invite);
            return Results.Created($"/api/workspaces/invite/{invite.Id}", invite);
        });

        workspaces.MapPost("/join", async (
            JoinWorkspaceRequest request,
            TeamStore store,
            IHubContext<WorkspaceHub> hub,
            HttpContext context) =>
        {
            var workspace = store.JoinWorkspace(request, context.User);
            await hub.Clients.Group($"workspace:{workspace.Id}").SendAsync("member.joined", new
            {
                workspaceId = workspace.Id,
                userId = context.User.UserId(),
                displayName = context.User.DisplayName()
            });
            return Results.Ok(workspace);
        });

        channels.MapGet("/", (string workspaceId, TeamStore store, HttpContext context) =>
            Results.Ok(store.GetChannels(workspaceId, context.User)));

        channels.MapPost("/", async (
            CreateChannelRequest request,
            TeamStore store,
            IHubContext<WorkspaceHub> hub,
            HttpContext context) =>
        {
            var channel = store.CreateChannel(request, context.User);
            await hub.Clients.Group($"workspace:{request.WorkspaceId}").SendAsync("channel.created", channel);
            return Results.Created($"/api/channels/{channel.Id}", channel);
        });

        messages.MapGet("/", (string workspaceId, string channelId, TeamStore store, HttpContext context) =>
            Results.Ok(store.GetMessages(workspaceId, channelId, context.User)));

        messages.MapPost("/", async (
            CreateMessageRequest request,
            TeamStore store,
            IHubContext<ChatHub> hub,
            HttpContext context) =>
        {
            var message = store.CreateMessage(request, context.User);
            await hub.Clients.Group($"workspace:{request.WorkspaceId}:channel:{request.ChannelId}").SendAsync("message.created", message);
            return Results.Created($"/api/messages/{message.Id}", message);
        });

        directMessages.MapPost("/", (CreateDirectMessageRequest request, TeamStore store, HttpContext context) =>
            Results.Created("/api/direct-messages", store.CreateDirectMessage(request, context.User)));

        meetings.MapPost("/", async (
            CreateTeamMeetingRequest request,
            TeamStore store,
            IHubContext<MeetingHub> hub,
            HttpContext context) =>
        {
            var meeting = store.CreateMeeting(request, context.User);
            await hub.Clients.Group($"workspace:{request.WorkspaceId}").SendAsync("meeting.created", meeting);
            return Results.Created("/api/meetings", meeting);
        });

        members.MapGet("/", (string workspaceId, TeamStore store, HttpContext context) =>
            Results.Ok(store.GetMembers(workspaceId, context.User)));

        roles.MapPatch("/", async (
            PatchRoleRequest request,
            TeamStore store,
            IHubContext<WorkspaceHub> hub,
            HttpContext context) =>
        {
            var member = store.PatchRole(request, context.User);
            await hub.Clients.Group($"workspace:{request.WorkspaceId}").SendAsync("permissions.changed", new
            {
                request.WorkspaceId,
                userId = member.UserId,
                member.Role,
                member.Permissions
            });
            return Results.Ok(member);
        });

        notifications.MapGet("/", (TeamStore store, HttpContext context) =>
            Results.Ok(store.GetNotifications(context.User)));

        return app;
    }
}
