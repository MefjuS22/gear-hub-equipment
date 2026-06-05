using GearHub.Api.Data;
using GearHub.Api.DTOs;
using GearHub.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GearHub.Api.Services;

public class CustomerService(ApplicationDbContext dbContext) : ICustomerService
{
    public async Task<PagedResultDto<Customer>> GetAllAsync(
        PaginationQuery pagination,
        CancellationToken cancellationToken = default)
    {
        var (page, pageSize, skip) = Pagination.Normalize(pagination);
        var query = dbContext.Customers.AsNoTracking().OrderBy(customer => customer.CompanyName);
        var totalCount = await query.CountAsync(cancellationToken);
        var customers = await query.Skip(skip).Take(pageSize).ToListAsync(cancellationToken);
        return Pagination.Create(customers, page, pageSize, totalCount);
    }
}
