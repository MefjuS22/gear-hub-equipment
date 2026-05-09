using GearHub.Api.Models;

namespace GearHub.Api.Services;

public interface ICustomerService
{
    Task<IReadOnlyList<Customer>> GetAllAsync(CancellationToken cancellationToken = default);
}
