using CollabOS.Api.Meetings;
using CollabOS.Api.Team;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

var builder = WebApplication.CreateBuilder(args);
var authAudience = Environment.GetEnvironmentVariable("AUTH_AUDIENCE");
var authAuthority = Environment.GetEnvironmentVariable("AUTH_AUTHORITY")
    ?? (string.IsNullOrWhiteSpace(authAudience) ? null : $"https://securetoken.google.com/{authAudience}");

builder.Services.AddCors(options =>
{
    options.AddPolicy("CollabOSFrontend", policy =>
    {
        var origins = (Environment.GetEnvironmentVariable("COLLABOS_FRONTEND_ORIGINS") ?? "http://localhost:3000")
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        policy.WithOrigins(origins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = authAuthority;
        options.Audience = authAudience;
        if (!string.IsNullOrWhiteSpace(authAuthority))
        {
            options.MetadataAddress = $"{authAuthority.TrimEnd('/')}/.well-known/openid-configuration";
        }
        options.RequireHttpsMetadata = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = authAuthority,
            ValidAudience = authAudience,
            IssuerSigningKeyResolver = (_, _, kid, _) =>
            {
                var keys = FirebaseSigningKeys.GetSigningKeys();
                return string.IsNullOrWhiteSpace(kid) ? keys : keys.Where(key => key.KeyId == kid);
            },
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = builder.Environment.IsDevelopment();
    options.MaximumReceiveMessageSize = 128 * 1024;
    options.StreamBufferCapacity = 20;
});
builder.Services.AddSingleton<TeamStore>();
builder.Services.AddSingleton<MeetingStore>();
builder.Services.AddSingleton<MeetingService>();
builder.Services.AddSingleton<MeetingEmailSender>();
builder.Services.AddHostedService<MeetingReminderService>();
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseCors("CollabOSFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapHub<ChatHub>("/Hub/ChatHub").RequireAuthorization();
app.MapHub<PresenceHub>("/Hub/PresenceHub").RequireAuthorization();
app.MapHub<WorkspaceHub>("/Hub/WorkspaceHub").RequireAuthorization();
app.MapHub<NotificationHub>("/Hub/NotificationHub").RequireAuthorization();
app.MapHub<MeetingHub>("/Hub/MeetingHub").RequireAuthorization();
app.MapHub<ProjectHub>("/Hub/ProjectHub").RequireAuthorization();
app.MapHub<DocumentHub>("/Hub/DocumentHub").RequireAuthorization();
app.MapHub<WhiteboardHub>("/Hub/WhiteboardHub").RequireAuthorization();
app.MapHub<AIHub>("/Hub/AIHub").RequireAuthorization();

app.MapTeamEndpoints();

var meetings = app.MapGroup("/api/meetings").RequireAuthorization();

meetings.MapPost("/create", async (CreateMeetingRequest request, MeetingService service, HttpContext context) =>
{
    var meeting = await service.CreateMeetingAsync(request, context.User);
    return Results.Created($"/api/meetings/{meeting.RoomId}", meeting);
});

meetings.MapPost("/schedule", async (ScheduleMeetingRequest request, MeetingService service, HttpContext context) =>
{
    try
    {
        var meeting = await service.ScheduleMeetingAsync(request, context.User);
        return Results.Created($"/api/meetings/{meeting.RoomId}", meeting);
    }
    catch (ArgumentException error)
    {
        return Results.BadRequest(error.Message);
    }
});

meetings.MapPost("/join", async (JoinMeetingRequest request, MeetingService service, HttpContext context) =>
{
    var join = await service.JoinMeetingAsync(request, context.User);
    return Results.Ok(join);
});

meetings.MapGet("/{roomId}", async (string roomId, MeetingService service) =>
{
    var meeting = await service.GetMeetingAsync(roomId);
    return meeting is null ? Results.NotFound() : Results.Ok(meeting);
});

meetings.MapDelete("/{roomId}", async (string roomId, MeetingService service) =>
{
    await service.DeleteMeetingAsync(roomId);
    return Results.NoContent();
});

app.Run();

internal static class FirebaseSigningKeys
{
    private const string JwkUrl = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";
    private static readonly HttpClient HttpClient = new();
    private static readonly object Lock = new();
    private static IReadOnlyCollection<SecurityKey> _cachedKeys = Array.Empty<SecurityKey>();
    private static DateTimeOffset _expiresAt = DateTimeOffset.MinValue;

    public static IReadOnlyCollection<SecurityKey> GetSigningKeys()
    {
        lock (Lock)
        {
            if (_cachedKeys.Count > 0 && _expiresAt > DateTimeOffset.UtcNow.AddMinutes(5))
            {
                return _cachedKeys;
            }

            using var request = new HttpRequestMessage(HttpMethod.Get, JwkUrl);
            using var response = HttpClient.Send(request);
            response.EnsureSuccessStatusCode();

            var jwks = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
            var keySet = new JsonWebKeySet(jwks);
            _cachedKeys = keySet.Keys.Cast<SecurityKey>().ToArray();

            _expiresAt = response.Headers.CacheControl?.MaxAge is { } maxAge
                ? DateTimeOffset.UtcNow.Add(maxAge)
                : DateTimeOffset.UtcNow.AddHours(1);

            return _cachedKeys;
        }
    }
}
