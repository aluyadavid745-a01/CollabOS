namespace CollabOS.Api.Meetings;

public sealed record CreateMeetingRequest(
    string? Title,
    string? Mode,
    DateTimeOffset? StartsAt,
    bool RecordingEnabled = true,
    bool WaitingRoomEnabled = true,
    int MaxParticipants = 100
);

public sealed record ScheduleMeetingRequest(
    string? Title,
    string RecipientEmail,
    DateTimeOffset StartsAt,
    string? Mode = "scheduled",
    bool RecordingEnabled = true,
    bool WaitingRoomEnabled = true,
    int MaxParticipants = 100
);

public sealed record JoinMeetingRequest(
    string RoomId,
    string? DisplayName,
    bool CanPublish = true,
    bool CanSubscribe = true
);

public sealed record MeetingResponse(
    string RoomId,
    string Title,
    string Mode,
    DateTimeOffset CreatedAt,
    DateTimeOffset? StartsAt,
    bool RecordingEnabled,
    bool WaitingRoomEnabled,
    int MaxParticipants,
    string? InviteUrl,
    string? ReminderEmail,
    DateTimeOffset? ReminderSentAt
);

public sealed record JoinMeetingResponse(
    string RoomId,
    string ParticipantIdentity,
    string ParticipantName,
    string Token,
    string ServerUrl,
    DateTimeOffset ExpiresAt
);

public sealed class MeetingRecord
{
    public required string RoomId { get; init; }
    public required string Title { get; init; }
    public required string Mode { get; init; }
    public required string CreatedBy { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset? StartsAt { get; init; }
    public bool RecordingEnabled { get; init; }
    public bool WaitingRoomEnabled { get; init; }
    public int MaxParticipants { get; init; }
    public string? InviteUrl { get; init; }
    public string? ReminderEmail { get; init; }
    public DateTimeOffset? ReminderSentAt { get; init; }

    public MeetingResponse ToResponse() => new(
        RoomId,
        Title,
        Mode,
        CreatedAt,
        StartsAt,
        RecordingEnabled,
        WaitingRoomEnabled,
        MaxParticipants,
        InviteUrl,
        ReminderEmail,
        ReminderSentAt
    );
}
