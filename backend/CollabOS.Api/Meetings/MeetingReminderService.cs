using System.Net;
using System.Net.Mail;

namespace CollabOS.Api.Meetings;

public sealed class MeetingReminderService : BackgroundService
{
    private static readonly TimeSpan IdleDelay = TimeSpan.FromSeconds(5);
    private static readonly TimeSpan MaximumDelay = TimeSpan.FromMinutes(5);
    private readonly MeetingStore _store;
    private readonly MeetingEmailSender _emailSender;
    private readonly ILogger<MeetingReminderService> _logger;

    public MeetingReminderService(
        MeetingStore store,
        MeetingEmailSender emailSender,
        ILogger<MeetingReminderService> logger
    )
    {
        _store = store;
        _emailSender = emailSender;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await SendDueRemindersAsync(stoppingToken);
            await DelayUntilNextReminderAsync(stoppingToken);
        }
    }

    private async Task SendDueRemindersAsync(CancellationToken stoppingToken)
    {
        foreach (var meeting in _store.GetDueReminders(DateTimeOffset.UtcNow))
        {
            try
            {
                await _emailSender.SendReminderAsync(meeting, stoppingToken);
                _store.MarkReminderSent(meeting.RoomId, DateTimeOffset.UtcNow);
                _logger.LogInformation("Meeting reminder sent for {RoomId}", meeting.RoomId);
            }
            catch (Exception error)
            {
                _logger.LogWarning(error, "Could not send meeting reminder for {RoomId}", meeting.RoomId);
            }
        }
    }

    private async Task DelayUntilNextReminderAsync(CancellationToken stoppingToken)
    {
        var now = DateTimeOffset.UtcNow;
        var nextReminderAt = _store.GetNextPendingReminderAt(now);
        var delay = nextReminderAt is null
            ? IdleDelay
            : nextReminderAt.Value - now;

        if (delay <= TimeSpan.Zero) return;
        if (delay > MaximumDelay) delay = MaximumDelay;

        await Task.Delay(delay, stoppingToken);
    }
}

public sealed class MeetingEmailSender
{
    private readonly ILogger<MeetingEmailSender> _logger;

    public MeetingEmailSender(ILogger<MeetingEmailSender> logger)
    {
        _logger = logger;
    }

    public async Task SendReminderAsync(MeetingRecord meeting, CancellationToken cancellationToken)
    {
        var smtpHost = Environment.GetEnvironmentVariable("SMTP_HOST");
        var smtpPort = int.TryParse(Environment.GetEnvironmentVariable("SMTP_PORT"), out var port) ? port : 587;
        var smtpUser = Environment.GetEnvironmentVariable("SMTP_USER");
        var smtpPass = Environment.GetEnvironmentVariable("SMTP_PASS");
        var smtpFrom = Environment.GetEnvironmentVariable("SMTP_FROM") ?? smtpUser;

        if (string.IsNullOrWhiteSpace(smtpHost) || string.IsNullOrWhiteSpace(smtpFrom))
        {
            throw new InvalidOperationException("SMTP_HOST and SMTP_FROM or SMTP_USER must be configured to send meeting reminders.");
        }

        if (string.IsNullOrWhiteSpace(meeting.ReminderEmail))
        {
            throw new InvalidOperationException("Meeting reminder email is missing.");
        }

        using var message = new MailMessage
        {
            From = new MailAddress(smtpFrom, "CollabOS Meetings"),
            Subject = $"Meeting reminder: {meeting.Title}",
            Body = $"""
            Your CollabOS meeting is starting now.

            Meeting: {meeting.Title}
            Time: {meeting.StartsAt:yyyy-MM-dd HH:mm zzz}
            Join link: {meeting.InviteUrl}

            Open the link to join the LiveKit meeting room.
            """,
        };
        message.To.Add(meeting.ReminderEmail);

        using var client = new SmtpClient(smtpHost, smtpPort)
        {
            EnableSsl = true,
        };

        if (!string.IsNullOrWhiteSpace(smtpUser) && !string.IsNullOrWhiteSpace(smtpPass))
        {
            client.Credentials = new NetworkCredential(smtpUser, smtpPass);
        }

        _logger.LogInformation("Sending meeting reminder to {Email}", meeting.ReminderEmail);
        await client.SendMailAsync(message, cancellationToken);
    }
}
