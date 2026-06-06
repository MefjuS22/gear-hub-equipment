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

    public async Task<IReadOnlyList<CustomerCheckoutOptionDto>> GetCheckoutOptionsForUserAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        var customerIds = await dbContext.RentalOrders
            .AsNoTracking()
            .Where(order => order.UserId == userId)
            .Select(order => order.CustomerId)
            .Distinct()
            .ToListAsync(cancellationToken);

        if (customerIds.Count == 0)
        {
            return [];
        }

        return await dbContext.Customers
            .AsNoTracking()
            .Where(customer => customerIds.Contains(customer.Id))
            .OrderBy(customer => customer.CompanyName)
            .Select(customer => new CustomerCheckoutOptionDto
            {
                Id = customer.Id,
                CompanyName = customer.CompanyName,
                ContactPerson = customer.ContactPerson,
            })
            .ToListAsync(cancellationToken);
    }
}
