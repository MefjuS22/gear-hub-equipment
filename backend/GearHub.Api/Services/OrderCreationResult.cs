using GearHub.Api.Models;

namespace GearHub.Api.Services;

public record OrderCreationResult(bool Success, string? Error, RentalOrder? Order)
{
    public static OrderCreationResult Failed(string error) => new(false, error, null);
    public static OrderCreationResult Created(RentalOrder order) => new(true, null, order);
}
