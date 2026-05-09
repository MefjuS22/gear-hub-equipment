using GearHub.Api.Data;
using GearHub.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GearHub.Api.Repositories;

public class EquipmentRepository(ApplicationDbContext dbContext) : IEquipmentRepository
{
    public async Task<List<Equipment>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Equipment
            .Include(item => item.Category)
            .Include(item => item.Brand)
            .Include(item => item.Warehouse)
            .ToListAsync(cancellationToken);
    }

    public async Task<Equipment?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await dbContext.Equipment
            .Include(item => item.Category)
            .Include(item => item.Brand)
            .Include(item => item.Warehouse)
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
    }

    public async Task<Equipment> CreateAsync(Equipment equipment, CancellationToken cancellationToken = default)
    {
        dbContext.Equipment.Add(equipment);
        await dbContext.SaveChangesAsync(cancellationToken);
        return equipment;
    }

    public async Task<bool> UpdateAsync(Equipment equipment, CancellationToken cancellationToken = default)
    {
        var existing = await dbContext.Equipment.FirstOrDefaultAsync(item => item.Id == equipment.Id, cancellationToken);
        if (existing is null)
        {
            return false;
        }

        existing.Name = equipment.Name;
        existing.CategoryId = equipment.CategoryId;
        existing.BrandId = equipment.BrandId;
        existing.WarehouseId = equipment.WarehouseId;
        existing.DailyRate = equipment.DailyRate;
        existing.IsAvailable = equipment.IsAvailable;
        existing.ImageUrl = equipment.ImageUrl;

        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var equipment = await dbContext.Equipment.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (equipment is null)
        {
            return false;
        }

        dbContext.Equipment.Remove(equipment);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> RelatedEntitiesExistAsync(
        int categoryId,
        int brandId,
        int warehouseId,
        CancellationToken cancellationToken = default)
    {
        var categoryExists = await dbContext.Categories.AnyAsync(
            category => category.Id == categoryId,
            cancellationToken);
        if (!categoryExists)
        {
            return false;
        }

        var brandExists = await dbContext.Brands.AnyAsync(
            brand => brand.Id == brandId,
            cancellationToken);
        if (!brandExists)
        {
            return false;
        }

        return await dbContext.Warehouses.AnyAsync(
            warehouse => warehouse.Id == warehouseId,
            cancellationToken);
    }
}
