using System.Collections.Concurrent;
using System.Security.Claims;

namespace CollabOS.Api.Team;

public sealed class TeamStore
{
    private readonly ConcurrentDictionary<string, WorkspaceRecord> _workspaces = new();
    private readonly ConcurrentDictionary<string, InvitationRecord> _invitations = new();
    private readonly ConcurrentDictionary<string, ConcurrentQueue<MessageRecord>> _messagesByChannel = new();
    private readonly ConcurrentDictionary<string, ConcurrentQueue<NotificationResponse>> _notificationsByUser = new();

    public WorkspaceResponse CreateWorkspace(CreateWorkspaceRequest request, ClaimsPrincipal user)
    {
        var now = DateTimeOffset.UtcNow;
        var workspaceId = $"ws_{Guid.NewGuid():N}";
        var inviteCode = GenerateInviteCode();
        var owner = new MemberRecord(user.UserId(), user.DisplayName(), user.Email(), "Owner", PresenceState.Online);

        var channels = new[]
        {
            new ChannelRecord($"ch_{Guid.NewGuid():N}", workspaceId, "general", ChannelType.Text, "Team-wide collaboration", now),
            new ChannelRecord($"ch_{Guid.NewGuid():N}", workspaceId, "announcements", ChannelType.Announcements, "Company updates and launch notes", now),
            new ChannelRecord($"ch_{Guid.NewGuid():N}", workspaceId, "random", ChannelType.Text, "Culture, wins, and async conversation", now),
        };

        var workspace = new WorkspaceRecord(
            workspaceId,
            inviteCode,
            request.Name.Trim(),
            request.Description.Trim(),
            request.Category.Trim(),
            request.Privacy,
            request.Theme.Trim(),
            request.DefaultLanguage.Trim(),
            request.LogoUrl,
            request.BannerUrl,
            now,
            new ConcurrentDictionary<string, ChannelRecord>(channels.ToDictionary(channel => channel.Id)),
            new ConcurrentDictionary<string, MemberRecord>(new[] { new KeyValuePair<string, MemberRecord>(owner.UserId, owner) })
        );

        _workspaces[workspace.Id] = workspace;
        return workspace.ToResponse();
    }

    public WorkspaceResponse? GetWorkspace(string workspaceId) =>
        _workspaces.TryGetValue(workspaceId, out var workspace) ? workspace.ToResponse() : null;

    public IReadOnlyCollection<WorkspaceResponse> GetWorkspaces(ClaimsPrincipal user)
    {
        var userId = user.UserId();
        return _workspaces.Values
            .Where(workspace => workspace.Privacy == WorkspacePrivacy.Public || workspace.Members.ContainsKey(userId))
            .OrderByDescending(workspace => workspace.CreatedAt)
            .Select(workspace => workspace.ToResponse())
            .ToArray();
    }

    public ChannelResponse CreateChannel(CreateChannelRequest request, ClaimsPrincipal user)
    {
        var workspace = RequireWorkspace(request.WorkspaceId);
        RequirePermission(workspace, user.UserId(), "Create Channels");

        var channel = new ChannelRecord(
            $"ch_{Guid.NewGuid():N}",
            workspace.Id,
            request.Name.Trim().TrimStart('#').Replace(' ', '-').ToLowerInvariant(),
            request.Type,
            request.Description?.Trim() ?? string.Empty,
            DateTimeOffset.UtcNow
        );

        workspace.Channels[channel.Id] = channel;
        return channel.ToResponse();
    }

    public IReadOnlyCollection<ChannelResponse> GetChannels(string workspaceId, ClaimsPrincipal user)
    {
        var workspace = RequireWorkspace(workspaceId);
        RequireMember(workspace, user.UserId());
        return workspace.Channels.Values.OrderBy(channel => channel.CreatedAt).Select(channel => channel.ToResponse()).ToArray();
    }

    public MessageResponse CreateMessage(CreateMessageRequest request, ClaimsPrincipal user)
    {
        var workspace = RequireWorkspace(request.WorkspaceId);
        RequireMember(workspace, user.UserId());

        if (!workspace.Channels.ContainsKey(request.ChannelId))
        {
            throw new ArgumentException("Channel does not exist.");
        }

        var record = new MessageRecord(
            $"msg_{Guid.NewGuid():N}",
            workspace.Id,
            request.ChannelId,
            user.UserId(),
            user.DisplayName(),
            request.CipherText,
            request.Nonce,
            request.KeyVersion,
            request.ParentMessageId,
            request.Mentions,
            [],
            "delivered",
            DateTimeOffset.UtcNow,
            null,
            request.ScheduledFor,
            false,
            false
        );

        var queue = _messagesByChannel.GetOrAdd(request.ChannelId, _ => new ConcurrentQueue<MessageRecord>());
        queue.Enqueue(record);

        foreach (var mentionedUser in request.Mentions)
        {
            PushNotification(new NotificationResponse($"nt_{Guid.NewGuid():N}", workspace.Id, mentionedUser, "mention", "New mention", "You were mentioned in an encrypted message.", DateTimeOffset.UtcNow, false));
        }

        return record.ToResponse();
    }

    public IReadOnlyCollection<MessageResponse> GetMessages(string workspaceId, string channelId, ClaimsPrincipal user)
    {
        var workspace = RequireWorkspace(workspaceId);
        RequireMember(workspace, user.UserId());

        return _messagesByChannel.TryGetValue(channelId, out var queue)
            ? queue.Reverse().Take(80).Reverse().Select(message => message.ToResponse()).ToArray()
            : [];
    }

    public MessageResponse CreateDirectMessage(CreateDirectMessageRequest request, ClaimsPrincipal user)
    {
        var workspace = RequireWorkspace(request.WorkspaceId);
        RequireMember(workspace, user.UserId());
        RequireMember(workspace, request.RecipientUserId);

        var channelId = DirectChannelId(workspace.Id, user.UserId(), request.RecipientUserId);
        var messageRequest = new CreateMessageRequest(workspace.Id, channelId, request.CipherText, request.Nonce, request.KeyVersion, null, [request.RecipientUserId], null);
        return CreateMessage(messageRequest, user);
    }

    public InvitationResponse CreateInvite(InviteWorkspaceRequest request, ClaimsPrincipal user)
    {
        var workspace = RequireWorkspace(request.WorkspaceId);
        RequirePermission(workspace, user.UserId(), "Invite Users");

        var invite = new InvitationRecord(
            $"inv_{Guid.NewGuid():N}",
            workspace.Id,
            workspace.InviteCode,
            $"invite_{Guid.NewGuid():N}",
            request.Emails.Where(email => !string.IsNullOrWhiteSpace(email)).Select(email => email.Trim().ToLowerInvariant()).Distinct().ToArray(),
            request.ExpiresAt ?? DateTimeOffset.UtcNow.AddDays(7),
            Math.Max(1, request.MaxUses ?? 25),
            0,
            false
        );

        _invitations[invite.Token] = invite;
        return invite.ToResponse();
    }

    public WorkspaceResponse JoinWorkspace(JoinWorkspaceRequest request, ClaimsPrincipal user)
    {
        var invite = _invitations.Values.FirstOrDefault(item =>
            !item.Revoked &&
            item.Uses < item.MaxUses &&
            item.ExpiresAt > DateTimeOffset.UtcNow &&
            (item.Token == request.InvitationToken || item.InviteCode.Equals(request.InviteCode, StringComparison.OrdinalIgnoreCase)));

        var workspace = invite is not null
            ? RequireWorkspace(invite.WorkspaceId)
            : _workspaces.Values.FirstOrDefault(item => item.InviteCode.Equals(request.InviteCode, StringComparison.OrdinalIgnoreCase))
                ?? throw new ArgumentException("Invitation is invalid or expired.");

        var member = new MemberRecord(user.UserId(), user.DisplayName(), user.Email(), "Guest", PresenceState.Online);
        workspace.Members[user.UserId()] = member;

        if (invite is not null)
        {
            _invitations[invite.Token] = invite with { Uses = invite.Uses + 1 };
        }

        return workspace.ToResponse();
    }

    public IReadOnlyCollection<MemberResponse> GetMembers(string workspaceId, ClaimsPrincipal user)
    {
        var workspace = RequireWorkspace(workspaceId);
        RequireMember(workspace, user.UserId());
        return workspace.Members.Values.Select(member => member.ToResponse()).ToArray();
    }

    public MemberResponse PatchRole(PatchRoleRequest request, ClaimsPrincipal user)
    {
        var workspace = RequireWorkspace(request.WorkspaceId);
        RequirePermission(workspace, user.UserId(), "Manage Roles");
        var member = RequireMember(workspace, request.MemberUserId) with { Role = request.Role };
        workspace.Members[request.MemberUserId] = member;
        return member.ToResponse();
    }

    public IReadOnlyCollection<NotificationResponse> GetNotifications(ClaimsPrincipal user) =>
        _notificationsByUser.TryGetValue(user.UserId(), out var queue)
            ? queue.Reverse().Take(60).ToArray()
            : [];

    public object CreateMeeting(CreateTeamMeetingRequest request, ClaimsPrincipal user)
    {
        var workspace = RequireWorkspace(request.WorkspaceId);
        RequirePermission(workspace, user.UserId(), "Manage Meetings");
        return new
        {
            id = $"mtg_{Guid.NewGuid():N}",
            workspaceId = workspace.Id,
            request.Title,
            request.StartsAt,
            request.ParticipantUserIds,
            provider = "LiveKit",
            status = "scheduled"
        };
    }

    public void UpdatePresence(string workspaceId, string userId, PresenceState presence)
    {
        if (_workspaces.TryGetValue(workspaceId, out var workspace) && workspace.Members.TryGetValue(userId, out var member))
        {
            workspace.Members[userId] = member with { Presence = presence };
        }
    }

    private void PushNotification(NotificationResponse notification)
    {
        var queue = _notificationsByUser.GetOrAdd(notification.UserId, _ => new ConcurrentQueue<NotificationResponse>());
        queue.Enqueue(notification);
    }

    private static string GenerateInviteCode() => Guid.NewGuid().ToString("N")[..10];

    private static string DirectChannelId(string workspaceId, string firstUserId, string secondUserId)
    {
        var users = new[] { firstUserId, secondUserId }.Order(StringComparer.Ordinal).ToArray();
        return $"dm_{workspaceId}_{users[0]}_{users[1]}";
    }

    private WorkspaceRecord RequireWorkspace(string workspaceId) =>
        _workspaces.TryGetValue(workspaceId, out var workspace) ? workspace : throw new ArgumentException("Workspace does not exist.");

    private static MemberRecord RequireMember(WorkspaceRecord workspace, string userId) =>
        workspace.Members.TryGetValue(userId, out var member) ? member : throw new UnauthorizedAccessException("You are not a member of this workspace.");

    private static void RequirePermission(WorkspaceRecord workspace, string userId, string permission)
    {
        var member = RequireMember(workspace, userId);
        if (!member.Permissions.Contains(permission, StringComparer.OrdinalIgnoreCase))
        {
            throw new UnauthorizedAccessException($"Missing permission: {permission}");
        }
    }
}

public sealed record WorkspaceRecord(
    string Id,
    string InviteCode,
    string Name,
    string Description,
    string Category,
    WorkspacePrivacy Privacy,
    string Theme,
    string DefaultLanguage,
    string? LogoUrl,
    string? BannerUrl,
    DateTimeOffset CreatedAt,
    ConcurrentDictionary<string, ChannelRecord> Channels,
    ConcurrentDictionary<string, MemberRecord> Members
)
{
    public WorkspaceResponse ToResponse() => new(
        Id,
        InviteCode,
        Name,
        Description,
        Category,
        Privacy,
        Theme,
        DefaultLanguage,
        LogoUrl,
        BannerUrl,
        Channels.Values.OrderBy(channel => channel.CreatedAt).Select(channel => channel.ToResponse()).ToArray(),
        Members.Values.Select(member => member.ToResponse()).ToArray()
    );
}

public sealed record ChannelRecord(string Id, string WorkspaceId, string Name, ChannelType Type, string Description, DateTimeOffset CreatedAt)
{
    public ChannelResponse ToResponse() => new(Id, WorkspaceId, Name, Type, Description, CreatedAt);
}

public sealed record MemberRecord(string UserId, string DisplayName, string Email, string Role, PresenceState Presence)
{
    public string[] Permissions => TeamPermissions.ByRole.TryGetValue(Role, out var permissions) ? permissions : [];
    public MemberResponse ToResponse() => new(UserId, DisplayName, Email, Role, Permissions, Presence);
}

public sealed record MessageRecord(
    string Id,
    string WorkspaceId,
    string ChannelId,
    string SenderUserId,
    string SenderName,
    string CipherText,
    string Nonce,
    string KeyVersion,
    string? ParentMessageId,
    string[] Mentions,
    string[] Reactions,
    string DeliveryStatus,
    DateTimeOffset CreatedAt,
    DateTimeOffset? EditedAt,
    DateTimeOffset? ScheduledFor,
    bool Deleted,
    bool Pinned
)
{
    public MessageResponse ToResponse() => new(Id, WorkspaceId, ChannelId, SenderUserId, SenderName, CipherText, Nonce, KeyVersion, ParentMessageId, Mentions, Reactions, DeliveryStatus, CreatedAt, EditedAt, ScheduledFor, Deleted, Pinned);
}

public sealed record InvitationRecord(
    string Id,
    string WorkspaceId,
    string InviteCode,
    string Token,
    string[] Emails,
    DateTimeOffset ExpiresAt,
    int MaxUses,
    int Uses,
    bool Revoked
)
{
    public InvitationResponse ToResponse() => new(Id, WorkspaceId, InviteCode, Token, Emails, ExpiresAt, MaxUses, Uses, Revoked);
}
