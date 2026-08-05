using System.Collections.Concurrent;

namespace CollabOS.Api.Meetings;

public sealed class MeetingStore
{
    private readonly ConcurrentDictionary<string, MeetingRecord> _meetings = new();

    public MeetingRecord Save(MeetingRecord meeting)
    {
        _meetings[meeting.RoomId] = meeting;
        return meeting;
    }

    public MeetingRecord? Get(string roomId) =>
        _meetings.TryGetValue(roomId, out var meeting) ? meeting : null;

    public IReadOnlyCollection<MeetingRecord> GetDueReminders(DateTimeOffset now) =>
        _meetings.Values
            .Where(meeting =>
                meeting.StartsAt <= now &&
                meeting.ReminderSentAt is null &&
                !string.IsNullOrWhiteSpace(meeting.ReminderEmail))
            .ToArray();

    public void MarkReminderSent(string roomId, DateTimeOffset sentAt)
    {
        if (!_meetings.TryGetValue(roomId, out var meeting)) return;

        _meetings[roomId] = new MeetingRecord
        {
            RoomId = meeting.RoomId,
            Title = meeting.Title,
            Mode = meeting.Mode,
            CreatedBy = meeting.CreatedBy,
            CreatedAt = meeting.CreatedAt,
            StartsAt = meeting.StartsAt,
            RecordingEnabled = meeting.RecordingEnabled,
            WaitingRoomEnabled = meeting.WaitingRoomEnabled,
            MaxParticipants = meeting.MaxParticipants,
            InviteUrl = meeting.InviteUrl,
            ReminderEmail = meeting.ReminderEmail,
            ReminderSentAt = sentAt,
        };
    }

    public bool Delete(string roomId) => _meetings.TryRemove(roomId, out _);
}
