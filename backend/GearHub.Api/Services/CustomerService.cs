using GearHub.Api.Data;
using GearHub.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GearHub.Api.Services;

public class CustomerService(ApplicationDbContext dbContext) : ICustomerService
{
    public async Task<IReadOnlyList<Customer>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await dbContext.Customers
            .OrderBy(customer => customer.CompanyName)
            .ToListAsync(cancellationToken);
}
