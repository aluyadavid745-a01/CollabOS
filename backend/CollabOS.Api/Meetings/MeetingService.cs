using System.Security.Claims;
using System.Text.Json;
using Livekit.Server.Sdk.Dotnet;

namespace CollabOS.Api.Meetings;

public sealed class MeetingService
{
    private static readonly TimeSpan TokenTtl = TimeSpan.FromHours(2);
    private readonly MeetingStore _store;
    private readonly LiveKitOptions _liveKit;

    public MeetingService(MeetingStore store)
    {
        _store = store;
        _liveKit = LiveKitOptions.FromEnvironment();
    }

    public async Task<MeetingResponse> CreateMeetingAsync(CreateMeetingRequest request, ClaimsPrincipal user)
    {
        var meeting = await CreateLiveKitMeetingAsync(
            request.Title,
            request.Mode,
            request.StartsAt,
            request.RecordingEnabled,
            request.WaitingRoomEnabled,
            request.MaxParticipants,
            null,
            user
        );

        return meeting.ToResponse();
    }

    public async Task<MeetingResponse> ScheduleMeetingAsync(ScheduleMeetingRequest request, ClaimsPrincipal user)
    {
        if (string.IsNullOrWhiteSpace(request.RecipientEmail))
        {
            throw new ArgumentException("Reminder email is required.", nameof(request));
        }

        if (request.StartsAt <= DateTimeOffset.UtcNow)
        {
            throw new ArgumentException("Scheduled meeting time must be in the future.", nameof(request));
        }

        var meeting = await CreateLiveKitMeetingAsync(
            request.Title,
            request.Mode,
            request.StartsAt,
            request.RecordingEnabled,
            request.WaitingRoomEnabled,
            request.MaxParticipants,
            request.RecipientEmail.Trim(),
            user
        );

        return meeting.ToResponse();
    }

    public Task<MeetingResponse?> GetMeetingAsync(string roomId)
    {
        return Task.FromResult(_store.Get(roomId)?.ToResponse());
    }

    public Task<JoinMeetingResponse> JoinMeetingAsync(JoinMeetingRequest request, ClaimsPrincipal user)
    {
        var roomId = NormalizeRoomId(request.RoomId);
        var participantIdentity = GetUserIdentity(user);
        var participantName = string.IsNullOrWhiteSpace(request.DisplayName)
            ? GetUserDisplayName(user)
            : request.DisplayName.Trim();
        var expiresAt = DateTimeOffset.UtcNow.Add(TokenTtl);

        var token = new AccessToken(_liveKit.ApiKey, _liveKit.ApiSecret)
            .WithIdentity(participantIdentity)
            .WithName(participantName)
            .WithGrants(new VideoGrants
            {
                RoomJoin = true,
                Room = roomId,
                CanPublish = request.CanPublish,
                CanSubscribe = request.CanSubscribe,
                CanPublishData = true,
            })
            .WithAttributes(new Dictionary<string, string>
            {
                ["product"] = "CollabOS",
                ["feature"] = "meetings",
            })
            .WithTtl(TokenTtl)
            .ToJwt();

        return Task.FromResult(new JoinMeetingResponse(roomId, participantIdentity, participantName, token, _liveKit.Url, expiresAt));
    }

    public async Task DeleteMeetingAsync(string roomId)
    {
        var normalizedRoomId = NormalizeRoomId(roomId);
        var client = new RoomServiceClient(_liveKit.HttpUrl, _liveKit.ApiKey, _liveKit.ApiSecret);
        await client.DeleteRoom(new DeleteRoomRequest { Room = normalizedRoomId });
        _store.Delete(normalizedRoomId);
    }

    private static string CreateRoomId() => $"meeting-{Guid.NewGuid():N}";

    private async Task<MeetingRecord> CreateLiveKitMeetingAsync(
        string? title,
        string? mode,
        DateTimeOffset? startsAt,
        bool recordingEnabled,
        bool waitingRoomEnabled,
        int maxParticipants,
        string? reminderEmail,
        ClaimsPrincipal user
    )
    {
        var roomId = CreateRoomId();
        var meeting = new MeetingRecord
        {
            RoomId = roomId,
            Title = string.IsNullOrWhiteSpace(title) ? "CollabOS Meeting" : title.Trim(),
            Mode = string.IsNullOrWhiteSpace(mode) ? "team" : mode.Trim(),
            CreatedBy = GetUserIdentity(user),
            CreatedAt = DateTimeOffset.UtcNow,
            StartsAt = startsAt,
            RecordingEnabled = recordingEnabled,
            WaitingRoomEnabled = waitingRoomEnabled,
            MaxParticipants = Math.Clamp(maxParticipants, 2, 500),
            InviteUrl = BuildInviteUrl(roomId),
            ReminderEmail = reminderEmail,
        };

        var client = new RoomServiceClient(_liveKit.HttpUrl, _liveKit.ApiKey, _liveKit.ApiSecret);
        await client.CreateRoom(new CreateRoomRequest
        {
            Name = meeting.RoomId,
            EmptyTimeout = 10 * 60,
            DepartureTimeout = 5 * 60,
            MaxParticipants = (uint)meeting.MaxParticipants,
            Metadata = JsonSerializer.Serialize(meeting.ToResponse()),
        });

        return _store.Save(meeting);
    }

    private static string BuildInviteUrl(string roomId)
    {
        var origins = Environment.GetEnvironmentVariable("COLLABOS_FRONTEND_ORIGINS") ?? "http://localhost:3000";
        var firstOrigin = origins.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).FirstOrDefault()
            ?? "http://localhost:3000";
        return $"{firstOrigin.TrimEnd('/')}/meetings/{roomId}";
    }

    private static string NormalizeRoomId(string roomId)
    {
        if (string.IsNullOrWhiteSpace(roomId)) throw new ArgumentException("Room id is required.", nameof(roomId));
        return roomId.Trim();
    }

    private static string GetUserIdentity(ClaimsPrincipal user) =>
        user.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? user.FindFirstValue("sub")
        ?? throw new UnauthorizedAccessException("Authenticated user identity is missing.");

    private static string GetUserDisplayName(ClaimsPrincipal user) =>
        user.FindFirstValue("name")
        ?? user.FindFirstValue(ClaimTypes.Name)
        ?? user.FindFirstValue("email")
        ?? "CollabOS User";
}
