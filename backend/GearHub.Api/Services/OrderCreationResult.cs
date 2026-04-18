using GearHub.Api.Models;
using GearHub.Api.Responses;

namespace GearHub.Api.Services;

public record OrderCreationResult(bool Success, ApiErrorCode? ErrorCode, string? ErrorMessage, RentalOrder? Order)
{
    public static OrderCreationResult Failed(ApiErrorCode code, string message) =>
        new(false, code, message, null);

    public static OrderCreationResult Created(RentalOrder order) =>
        new(true, null, null, order);
}
