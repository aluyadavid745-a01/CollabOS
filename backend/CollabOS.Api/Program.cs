using CollabOS.Api.Meetings;
using CollabOS.Api.Team;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

DotEnv.Load();

var builder = WebApplication.CreateEmptyBuilder(new WebApplicationOptions { Args = args });
builder.WebHost.UseKestrel();
var port = Environment.GetEnvironmentVariable("PORT");
var urls = Environment.GetEnvironmentVariable("ASPNETCORE_URLS")
    ?? (!string.IsNullOrWhiteSpace(port) ? $"http://0.0.0.0:{port}" : "http://127.0.0.1:7040");
builder.WebHost.UseUrls(urls);
var authAudience = Environment.GetEnvironmentVariable("AUTH_AUDIENCE")
    ?? Environment.GetEnvironmentVariable("VITE_FIREBASE_PROJECT_ID");
var authAuthority = AuthConfig.NormalizeFirebaseAuthority(Environment.GetEnvironmentVariable("AUTH_AUTHORITY"), authAudience);

builder.Services.AddRouting();
builder.Services.AddLogging();
builder.Services.AddCors(options =>
{
    options.AddPolicy("CollabOSFrontend", policy =>
    {
        var origins = (Environment.GetEnvironmentVariable("COLLABOS_FRONTEND_ORIGINS") ?? "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173")
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

if (!app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}
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
    try
    {
        var meeting = await service.CreateMeetingAsync(request, context.User);
        return Results.Created($"/api/meetings/{meeting.RoomId}", meeting);
    }
    catch (InvalidOperationException error)
    {
        return Results.BadRequest(error.Message);
    }
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
    catch (InvalidOperationException error)
    {
        return Results.BadRequest(error.Message);
    }
});

meetings.MapPost("/join", async (JoinMeetingRequest request, MeetingService service, HttpContext context) =>
{
    try
    {
        var join = await service.JoinMeetingAsync(request, context.User);
        return Results.Ok(join);
    }
    catch (InvalidOperationException error)
    {
        return Results.BadRequest(error.Message);
    }
});

meetings.MapPost("/recording/start", async (RecordingRequest request, MeetingService service, HttpContext context) =>
{
    try
    {
        return Results.Ok(await service.StartRecordingAsync(request, context.User));
    }
    catch (ArgumentException error)
    {
        return Results.BadRequest(error.Message);
    }
    catch (InvalidOperationException error)
    {
        return Results.BadRequest(error.Message);
    }
});

meetings.MapPost("/recording/stop", async (RecordingRequest request, MeetingService service, HttpContext context) =>
{
    try
    {
        return Results.Ok(await service.StopRecordingAsync(request, context.User));
    }
    catch (ArgumentException error)
    {
        return Results.BadRequest(error.Message);
    }
    catch (InvalidOperationException error)
    {
        return Results.BadRequest(error.Message);
    }
});

meetings.MapGet("/{roomId}", async (string roomId, MeetingService service) =>
{
    var meeting = await service.GetMeetingAsync(roomId);
    return meeting is null ? Results.NotFound() : Results.Ok(meeting);
});

meetings.MapGet("/{roomId}/participants", async (string roomId, MeetingService service) =>
{
    try
    {
        return Results.Ok(await service.ListLiveKitParticipantsAsync(roomId));
    }
    catch (Exception error) when (error is not OperationCanceledException)
    {
        return Results.BadRequest(error.Message);
    }
});

meetings.MapDelete("/{roomId}", async (string roomId, MeetingService service) =>
{
    try
    {
        await service.DeleteMeetingAsync(roomId);
        return Results.NoContent();
    }
    catch (InvalidOperationException error)
    {
        return Results.BadRequest(error.Message);
    }
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

internal static class AuthConfig
{
    public static string? NormalizeFirebaseAuthority(string? configuredAuthority, string? audience)
    {
        if (!string.IsNullOrWhiteSpace(configuredAuthority) && configuredAuthority.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            return configuredAuthority.TrimEnd('/');
        }

        if (!string.IsNullOrWhiteSpace(audience))
        {
            return $"https://securetoken.google.com/{audience}";
        }

        return null;
    }
}

internal static class DotEnv
{
    private static readonly string[] CandidateFiles = [".env", ".env.local"];

    public static void Load()
    {
        foreach (var directory in GetCandidateDirectories())
        {
            foreach (var fileName in CandidateFiles)
            {
                var path = Path.Combine(directory, fileName);
                if (File.Exists(path))
                {
                    LoadFile(path);
                }
            }
        }
    }

    private static IEnumerable<string> GetCandidateDirectories()
    {
        var current = new DirectoryInfo(AppContext.BaseDirectory);
        while (current is not null)
        {
            yield return current.FullName;
            current = current.Parent;
        }

        current = new DirectoryInfo(Directory.GetCurrentDirectory());
        while (current is not null)
        {
            yield return current.FullName;
            current = current.Parent;
        }
    }

    private static void LoadFile(string path)
    {
        foreach (var rawLine in File.ReadAllLines(path))
        {
            var line = rawLine.Trim();
            if (line.Length == 0 || line.StartsWith('#')) continue;

            var separatorIndex = line.IndexOf('=');
            if (separatorIndex <= 0) continue;

            var key = line[..separatorIndex].Trim();
            var value = line[(separatorIndex + 1)..].Trim().Trim('"');

            if (string.IsNullOrWhiteSpace(key) || Environment.GetEnvironmentVariable(key) is not null) continue;
            Environment.SetEnvironmentVariable(key, value);
        }
    }
}
