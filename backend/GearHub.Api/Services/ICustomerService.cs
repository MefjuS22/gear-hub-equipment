using GearHub.Api.DTOs;
using GearHub.Api.Models;

namespace GearHub.Api.Services;

public interface ICustomerService
{
    Task<PagedResultDto<Customer>> GetAllAsync(
        PaginationQuery pagination,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<CustomerCheckoutOptionDto>> GetCheckoutOptionsForUserAsync(
        int userId,
        CancellationToken cancellationToken = default);
}
