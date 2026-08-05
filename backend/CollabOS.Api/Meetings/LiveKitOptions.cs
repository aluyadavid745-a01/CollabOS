namespace CollabOS.Api.Meetings;

public sealed class LiveKitOptions
{
    public required string Url { get; init; }
    public required string ApiKey { get; init; }
    public required string ApiSecret { get; init; }

    public static LiveKitOptions FromEnvironment()
    {
        var url = Environment.GetEnvironmentVariable("LIVEKIT_URL");
        var apiKey = Environment.GetEnvironmentVariable("LIVEKIT_API_KEY");
        var apiSecret = Environment.GetEnvironmentVariable("LIVEKIT_API_SECRET");

        if (string.IsNullOrWhiteSpace(url) || string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(apiSecret))
        {
            throw new InvalidOperationException("LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET must be configured on the backend.");
        }

        return new LiveKitOptions
        {
            Url = url,
            ApiKey = apiKey,
            ApiSecret = apiSecret,
        };
    }

    public string HttpUrl =>
        Url.StartsWith("wss://", StringComparison.OrdinalIgnoreCase)
            ? $"https://{Url["wss://".Length..]}"
            : Url.StartsWith("ws://", StringComparison.OrdinalIgnoreCase)
                ? $"http://{Url["ws://".Length..]}"
                : Url;
}
