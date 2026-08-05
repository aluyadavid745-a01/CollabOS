using System.Security.Claims;

namespace CollabOS.Api.Team;

public enum WorkspacePrivacy
{
    Public,
    Private,
    InviteOnly
}

public enum PresenceState
{
    Online,
    Away,
    Busy,
    Offline,
    InMeeting,
    DoNotDisturb
}

public enum ChannelType
{
    Text,
    Voice,
    Announcements,
    Project,
    Document
}

public static class TeamPermissions
{
    public static readonly string[] All =
    [
        "Manage Workspace",
        "Manage Members",
        "Invite Users",
        "Delete Messages",
        "Pin Messages",
        "Create Channels",
        "Manage Meetings",
        "Manage Projects",
        "Manage AI",
        "Manage Files",
        "Manage Roles",
        "View Analytics"
    ];

    public static readonly Dictionary<string, string[]> ByRole = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Owner"] = All,
        ["Admin"] = All.Where(permission => permission != "Manage Workspace").ToArray(),
        ["Moderator"] = ["Manage Members", "Invite Users", "Delete Messages", "Pin Messages"],
        ["Team Lead"] = ["Invite Users", "Create Channels", "Manage Projects", "Manage Meetings"],
        ["Product Manager"] = ["Create Channels", "Manage Projects", "Manage AI", "View Analytics"],
        ["Project Manager"] = ["Invite Users", "Manage Projects", "Manage Meetings", "View Analytics"],
        ["Senior Backend Developer"] = ["Create Channels", "Manage Projects", "Manage Files"],
        ["Backend Developer"] = ["Manage Projects", "Manage Files"],
        ["Senior Frontend Developer"] = ["Create Channels", "Manage Projects", "Manage Files"],
        ["Frontend Developer"] = ["Manage Projects", "Manage Files"],
        ["Mobile Developer"] = ["Manage Projects", "Manage Files"],
        ["DevOps Engineer"] = ["Manage Projects", "Manage Files", "View Analytics"],
        ["Security Engineer"] = ["Manage Members", "Manage Files", "View Analytics"],
        ["AI Engineer"] = ["Manage AI", "Manage Projects", "Manage Files"],
        ["QA Engineer"] = ["Manage Projects", "Manage Files"],
        ["UI/UX Designer"] = ["Manage Projects", "Manage Files"],
        ["Guest"] = []
    };
}

public sealed record CreateWorkspaceRequest(
    string Name,
    string Description,
    string Category,
    WorkspacePrivacy Privacy,
    string Theme,
    string DefaultLanguage,
    string? LogoUrl,
    string? BannerUrl
);

public sealed record InviteWorkspaceRequest(
    string WorkspaceId,
    string[] Emails,
    DateTimeOffset? ExpiresAt,
    int? MaxUses
);

public sealed record JoinWorkspaceRequest(string InviteCode, string? InvitationToken);

public sealed record CreateChannelRequest(string WorkspaceId, string Name, ChannelType Type, string? Description);

public sealed record CreateMessageRequest(
    string WorkspaceId,
    string ChannelId,
    string CipherText,
    string Nonce,
    string KeyVersion,
    string? ParentMessageId,
    string[] Mentions,
    DateTimeOffset? ScheduledFor
);

public sealed record CreateDirectMessageRequest(string WorkspaceId, string RecipientUserId, string CipherText, string Nonce, string KeyVersion);

public sealed record CreateTeamMeetingRequest(string WorkspaceId, string Title, DateTimeOffset? StartsAt, string[] ParticipantUserIds);

public sealed record PatchRoleRequest(string WorkspaceId, string MemberUserId, string Role);

public sealed record WorkspaceResponse(
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
    IReadOnlyCollection<ChannelResponse> Channels,
    IReadOnlyCollection<MemberResponse> Members
);

public sealed record ChannelResponse(string Id, string WorkspaceId, string Name, ChannelType Type, string Description, DateTimeOffset CreatedAt);

public sealed record MemberResponse(string UserId, string DisplayName, string Email, string Role, string[] Permissions, PresenceState Presence);

public sealed record MessageResponse(
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
);

public sealed record InvitationResponse(
    string Id,
    string WorkspaceId,
    string InviteCode,
    string Token,
    string[] Emails,
    DateTimeOffset ExpiresAt,
    int MaxUses,
    int Uses,
    bool Revoked
);

public sealed record NotificationResponse(string Id, string WorkspaceId, string UserId, string Type, string Title, string Body, DateTimeOffset CreatedAt, bool Read);

internal static class ClaimsPrincipalExtensions
{
    public static string UserId(this ClaimsPrincipal user) =>
        user.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? user.FindFirstValue("user_id")
        ?? user.FindFirstValue("sub")
        ?? throw new UnauthorizedAccessException("Authenticated user identity is missing.");

    public static string DisplayName(this ClaimsPrincipal user) =>
        user.FindFirstValue("name")
        ?? user.FindFirstValue(ClaimTypes.Name)
        ?? user.FindFirstValue("email")
        ?? "CollabOS User";

    public static string Email(this ClaimsPrincipal user) =>
        user.FindFirstValue(ClaimTypes.Email)
        ?? user.FindFirstValue("email")
        ?? string.Empty;
}
