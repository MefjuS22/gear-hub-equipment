using GearHub.Api.Data;
using GearHub.Api.DTOs;
using GearHub.Api.Models;
using GearHub.Api.Responses;
using Microsoft.EntityFrameworkCore;

namespace GearHub.Api.Services;

public class WarehouseService(ApplicationDbContext dbContext) : IWarehouseService
{
    public async Task<IReadOnlyList<WarehouseLookupDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var warehouses = await dbContext.Warehouses
            .AsNoTracking()
            .OrderBy(w => w.Name)
            .ToListAsync(cancellationToken);

        return warehouses.Select(ToLookupDto).ToList();
    }

    public async Task<ServiceResult<WarehouseLookupDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var warehouse = await dbContext.Warehouses
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.Id == id, cancellationToken);

        if (warehouse is null)
        {
            return ServiceResult<WarehouseLookupDto>.Fail(
                ApiErrorCode.WarehouseNotFound,
                $"Warehouse with id {id} was not found.");
        }

        return ServiceResult<WarehouseLookupDto>.Ok(ToLookupDto(warehouse));
    }

    public async Task<WarehouseLookupDto> CreateAsync(WarehouseUpsertDto request, CancellationToken cancellationToken = default)
    {
        var entity = new Warehouse
        {
            Name = request.Name.Trim(),
            Location = request.Location.Trim(),
        };
        dbContext.Warehouses.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToLookupDto(entity);
    }

    public async Task<ServiceResult> UpdateAsync(int id, WarehouseUpsertDto request, CancellationToken cancellationToken = default)
    {
        var warehouse = await dbContext.Warehouses.FirstOrDefaultAsync(w => w.Id == id, cancellationToken);
        if (warehouse is null)
        {
            return ServiceResult.Fail(
                ApiErrorCode.WarehouseNotFound,
                $"Warehouse with id {id} was not found.");
        }

        warehouse.Name = request.Name.Trim();
        warehouse.Location = request.Location.Trim();
        await dbContext.SaveChangesAsync(cancellationToken);
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var warehouse = await dbContext.Warehouses.FirstOrDefaultAsync(w => w.Id == id, cancellationToken);
        if (warehouse is null)
        {
            return ServiceResult.Fail(
                ApiErrorCode.WarehouseNotFound,
                $"Warehouse with id {id} was not found.");
        }

        var inUse = await dbContext.Equipment.AnyAsync(e => e.WarehouseId == id, cancellationToken);
        if (inUse)
        {
            return ServiceResult.Fail(
                ApiErrorCode.WarehouseInUse,
                "This warehouse is still assigned to one or more equipment items.");
        }

        dbContext.Warehouses.Remove(warehouse);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ServiceResult.Ok();
    }

    private static WarehouseLookupDto ToLookupDto(Warehouse warehouse) =>
        new()
        {
            Id = warehouse.Id,
            Name = warehouse.Name,
            Location = warehouse.Location,
        };
}
