using Microsoft.AspNetCore.Mvc;

namespace GearHub.Api.Responses;

public static class ApiResponses
{
    public static ObjectResult Error(int statusCode, ApiErrorCode code, string message, Dictionary<string, string[]>? errors = null) =>
        new(new ApiErrorResponse(code, message, errors)) { StatusCode = statusCode };
}
