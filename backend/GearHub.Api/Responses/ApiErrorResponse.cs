using System.Text.Json.Serialization;

namespace GearHub.Api.Responses;

public sealed class ApiErrorResponse
{
    public ApiErrorCode Code { get; init; }

    public string Message { get; init; } = "";

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public IReadOnlyDictionary<string, string[]>? Errors { get; init; }

    public ApiErrorResponse(ApiErrorCode code, string message, IReadOnlyDictionary<string, string[]>? errors = null)
    {
        Code = code;
        Message = message;
        Errors = errors is { Count: > 0 } ? errors : null;
    }
}
