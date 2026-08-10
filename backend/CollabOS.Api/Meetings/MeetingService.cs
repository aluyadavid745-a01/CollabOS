using System.Collections.Concurrent;
using System.Security.Claims;
using System.Text.Json;
using Livekit.Server.Sdk.Dotnet;

namespace CollabOS.Api.Meetings;

public sealed class MeetingService
{
    private static readonly TimeSpan TokenTtl = TimeSpan.FromHours(2);
    private readonly ConcurrentDictionary<string, RecordingSession> _recordings = new();
    private readonly MeetingStore _store;
    private readonly ILogger<MeetingService> _logger;

    public MeetingService(MeetingStore store, ILogger<MeetingService> logger)
    {
        _store = store;
        _logger = logger;
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

    public async Task<JoinMeetingResponse> JoinMeetingAsync(JoinMeetingRequest request, ClaimsPrincipal user)
    {
        var roomId = NormalizeRoomId(request.RoomId);
        var userIdentity = GetUserIdentity(user);
        var participantIdentity = BuildParticipantIdentity(userIdentity, request.ClientSessionId);
        var participantName = string.IsNullOrWhiteSpace(request.DisplayName)
            ? GetUserDisplayName(user)
            : request.DisplayName.Trim();
        var expiresAt = DateTimeOffset.UtcNow.Add(TokenTtl);
        var liveKit = LiveKitOptions.FromEnvironment();
        await TryPrepareLiveKitRoomAsync(roomId, liveKit);

        var token = new AccessToken(liveKit.ApiKey, liveKit.ApiSecret)
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
                ["userIdentity"] = userIdentity,
            })
            .WithTtl(TokenTtl)
            .ToJwt();

        _logger.LogInformation(
            "LiveKit join token issued for room {RoomId} to participant {ParticipantIdentity} ({ParticipantName}).",
            roomId,
            participantIdentity,
            participantName
        );
        Console.WriteLine($"LiveKit join: room={roomId} identity={participantIdentity} name={participantName}");

        return new JoinMeetingResponse(roomId, participantIdentity, participantName, token, liveKit.Url, expiresAt);
    }

    public async Task<IReadOnlyCollection<LiveKitParticipantResponse>> ListLiveKitParticipantsAsync(string roomId)
    {
        var normalizedRoomId = NormalizeRoomId(roomId);
        var liveKit = LiveKitOptions.FromEnvironment();
        var client = new RoomServiceClient(liveKit.HttpUrl, liveKit.ApiKey, liveKit.ApiSecret);
        var response = await client.ListParticipants(new ListParticipantsRequest { Room = normalizedRoomId });

        return response.Participants
            .Select(participant => new LiveKitParticipantResponse(participant.Identity, participant.Name, participant.Sid))
            .ToArray();
    }

    public Task<RecordingResponse> StartRecordingAsync(RecordingRequest request, ClaimsPrincipal user)
    {
        var roomId = NormalizeRoomId(request.RoomId);
        var now = DateTimeOffset.UtcNow;
        var session = _recordings.AddOrUpdate(
            roomId,
            _ => new RecordingSession($"recording-{Guid.NewGuid():N}", now, GetUserIdentity(user)),
            (_, existing) => existing.StoppedAt is null
                ? existing
                : new RecordingSession($"recording-{Guid.NewGuid():N}", now, GetUserIdentity(user))
        );

        _logger.LogInformation(
            "Recording marked as started for room {RoomId} by {UserIdentity}. Recording id: {RecordingId}.",
            roomId,
            GetUserIdentity(user),
            session.RecordingId
        );

        return Task.FromResult(session.ToResponse(roomId, "recording"));
    }

    public Task<RecordingResponse> StopRecordingAsync(RecordingRequest request, ClaimsPrincipal user)
    {
        var roomId = NormalizeRoomId(request.RoomId);
        var now = DateTimeOffset.UtcNow;

        if (!_recordings.TryGetValue(roomId, out var existing))
        {
            var emptySession = new RecordingSession($"recording-{Guid.NewGuid():N}", now, GetUserIdentity(user), now);
            return Task.FromResult(emptySession.ToResponse(roomId, "stopped"));
        }

        var stopped = existing.StoppedAt is null ? existing with { StoppedAt = now } : existing;
        _recordings[roomId] = stopped;

        _logger.LogInformation(
            "Recording marked as stopped for room {RoomId} by {UserIdentity}. Recording id: {RecordingId}.",
            roomId,
            GetUserIdentity(user),
            stopped.RecordingId
        );

        return Task.FromResult(stopped.ToResponse(roomId, "stopped"));
    }

    private async Task TryPrepareLiveKitRoomAsync(string roomId, LiveKitOptions liveKit)
    {
        var client = new RoomServiceClient(liveKit.HttpUrl, liveKit.ApiKey, liveKit.ApiSecret);

        try
        {
            await client.CreateRoom(new CreateRoomRequest
            {
                Name = roomId,
                EmptyTimeout = 10 * 60,
                DepartureTimeout = 5 * 60,
                MaxParticipants = 500,
            }).WaitAsync(TimeSpan.FromSeconds(8));
            Console.WriteLine($"LiveKit room ready: room={roomId}");
        }
        catch (Exception error) when (IsLiveKitRoomAlreadyExistsError(error))
        {
            Console.WriteLine($"LiveKit room exists: room={roomId}");
            return;
        }
        catch (Exception error) when (IsLiveKitAuthenticationError(error))
        {
            _logger.LogError(error, "LiveKit credentials were rejected while preparing {RoomId}.", roomId);
            Console.WriteLine($"LiveKit credentials rejected: room={roomId} error={error.Message}");
            throw new InvalidOperationException("LiveKit credentials are invalid. Check LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET in backend/CollabOS.Api/.env.local.");
        }
        catch (Exception error) when (error is not OperationCanceledException)
        {
            _logger.LogWarning(error, "LiveKit room preparation failed for {RoomId}. The browser will attempt to join with the issued token.", roomId);
            Console.WriteLine($"LiveKit room preparation failed: room={roomId} error={error.Message}");
        }
    }

    public async Task DeleteMeetingAsync(string roomId)
    {
        var normalizedRoomId = NormalizeRoomId(roomId);
        var liveKit = LiveKitOptions.FromEnvironment();
        var client = new RoomServiceClient(liveKit.HttpUrl, liveKit.ApiKey, liveKit.ApiSecret);
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

        try
        {
            var liveKit = LiveKitOptions.FromEnvironment();
            var client = new RoomServiceClient(liveKit.HttpUrl, liveKit.ApiKey, liveKit.ApiSecret);
            await client.CreateRoom(new CreateRoomRequest
            {
                Name = meeting.RoomId,
                EmptyTimeout = 10 * 60,
                DepartureTimeout = 5 * 60,
                MaxParticipants = (uint)meeting.MaxParticipants,
                Metadata = JsonSerializer.Serialize(meeting.ToResponse()),
            });
        }
        catch (Exception error) when (error is not OperationCanceledException)
        {
            _logger.LogWarning(error, "LiveKit room pre-creation failed for {RoomId}. The room will be created when the first participant joins.", meeting.RoomId);
        }

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

    private static bool IsLiveKitRoomAlreadyExistsError(Exception error)
    {
        var message = error.Message;
        return message.Contains("already", StringComparison.OrdinalIgnoreCase)
            || message.Contains("exist", StringComparison.OrdinalIgnoreCase)
            || message.Contains("409", StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsLiveKitAuthenticationError(Exception error)
    {
        var message = error.Message;
        return message.Contains("invalid API key", StringComparison.OrdinalIgnoreCase)
            || message.Contains("unauthorized", StringComparison.OrdinalIgnoreCase)
            || message.Contains("401", StringComparison.OrdinalIgnoreCase)
            || message.Contains("403", StringComparison.OrdinalIgnoreCase);
    }

    private static string BuildParticipantIdentity(string userIdentity, string? clientSessionId)
    {
        var sessionId = string.IsNullOrWhiteSpace(clientSessionId) ? Guid.NewGuid().ToString("N")[..12] : clientSessionId.Trim();
        var safeSessionId = new string(sessionId.Where(char.IsLetterOrDigit).Take(24).ToArray());

        return string.IsNullOrWhiteSpace(safeSessionId)
            ? userIdentity
            : $"{userIdentity}-{safeSessionId}";
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

    private sealed record RecordingSession(
        string RecordingId,
        DateTimeOffset StartedAt,
        string StartedBy,
        DateTimeOffset? StoppedAt = null
    )
    {
        public RecordingResponse ToResponse(string roomId, string status) => new(
            roomId,
            RecordingId,
            status,
            StartedAt,
            StoppedAt,
            "Recording state saved for this meeting. Configure LiveKit Egress storage on the backend to export playable recording files."
        );
    }
}
