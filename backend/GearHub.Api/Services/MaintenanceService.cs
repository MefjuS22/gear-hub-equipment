using GearHub.Api.Data;
using GearHub.Api.DTOs;
using GearHub.Api.Models;
using GearHub.Api.Responses;
using Microsoft.EntityFrameworkCore;

namespace GearHub.Api.Services;

public class MaintenanceService(ApplicationDbContext dbContext) : IMaintenanceService
{
    public async Task<PagedResultDto<MaintenanceDto>> GetAllAsync(
        PaginationQuery pagination,
        CancellationToken cancellationToken = default)
    {
        var (page, pageSize, skip) = Pagination.Normalize(pagination);
        var query = dbContext.Maintenances
            .AsNoTracking()
            .Include(m => m.Equipment)
            .OrderByDescending(m => m.Date)
            .ThenByDescending(m => m.Id);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.Skip(skip).Take(pageSize).ToListAsync(cancellationToken);
        return Pagination.Create(items.Select(ToDto).ToList(), page, pageSize, totalCount);
    }

    public async Task<MaintenanceDto> CreateAsync(
        MaintenanceUpsertDto request,
        CancellationToken cancellationToken = default)
    {
        var equipmentExists = await dbContext.Equipment.AnyAsync(e => e.Id == request.EquipmentId, cancellationToken);
        if (!equipmentExists)
        {
            throw new InvalidOperationException($"Equipment with id {request.EquipmentId} was not found.");
        }

        var entity = new Maintenance
        {
            EquipmentId = request.EquipmentId,
            Description = request.Description.Trim(),
            Date = DateTime.SpecifyKind(request.Date.Date, DateTimeKind.Utc),
        };

        dbContext.Maintenances.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        var created = await dbContext.Maintenances
            .AsNoTracking()
            .Include(m => m.Equipment)
            .FirstAsync(m => m.Id == entity.Id, cancellationToken);

        return ToDto(created);
    }

    public async Task<ServiceResult> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.Maintenances.FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
        if (entity is null)
        {
            return ServiceResult.Fail(ApiErrorCode.MaintenanceNotFound, $"Maintenance with id {id} was not found.");
        }

        dbContext.Maintenances.Remove(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ServiceResult.Ok();
    }

    private static MaintenanceDto ToDto(Maintenance maintenance) =>
        new()
        {
            Id = maintenance.Id,
            EquipmentId = maintenance.EquipmentId,
            EquipmentName = maintenance.Equipment?.Name ?? string.Empty,
            Description = maintenance.Description,
            Date = maintenance.Date,
        };
}
