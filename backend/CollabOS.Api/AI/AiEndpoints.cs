namespace CollabOS.Api.AI;

public static class AiEndpoints
{
    public static IEndpointRouteBuilder MapAiEndpoints(this IEndpointRouteBuilder app)
    {
        var ai = app.MapGroup("/api/ai").RequireAuthorization();

        ai.MapGet("/tools", (AiGateway gateway, HttpContext context) =>
        {
            var request = new AiCommandRequest("List available tools.", string.Empty, []);
            return Results.BadRequest(new
            {
                message = "Send a workspaceId to /api/ai/command so CollabOS can return permission-aware tools for that workspace.",
                requestShape = request,
            });
        });

        ai.MapPost("/command", async (AiCommandRequest request, AiGateway gateway, HttpContext context, CancellationToken cancellationToken) =>
        {
            try
            {
                return Results.Ok(await gateway.HandleAsync(request, context.User, cancellationToken));
            }
            catch (UnauthorizedAccessException)
            {
                return Results.Forbid();
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

        return app;
    }
}
