using GearHub.Api.DTOs;
using GearHub.Api.Models;
using GearHub.Api.Repositories;
using GearHub.Api.Responses;

namespace GearHub.Api.Services;

public class EquipmentService(IEquipmentRepository equipmentRepository) : IEquipmentService
{
    public async Task<IReadOnlyList<EquipmentDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var equipment = await equipmentRepository.GetAllAsync(cancellationToken);
        return equipment.Select(ToDto).ToList();
    }

    public async Task<ServiceResult<EquipmentDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var equipment = await equipmentRepository.GetByIdAsync(id, cancellationToken);
        if (equipment is null)
        {
            return ServiceResult<EquipmentDto>.Fail(
                ApiErrorCode.EquipmentNotFound,
                $"Equipment with id {id} was not found.");
        }

        return ServiceResult<EquipmentDto>.Ok(ToDto(equipment));
    }

    public async Task<ServiceResult<EquipmentDto>> CreateAsync(EquipmentUpsertDto request, CancellationToken cancellationToken = default)
    {
        var referencesExist = await equipmentRepository.RelatedEntitiesExistAsync(
            request.CategoryId,
            request.BrandId,
            request.WarehouseId,
            cancellationToken);
        if (!referencesExist)
        {
            return ServiceResult<EquipmentDto>.Fail(
                ApiErrorCode.EquipmentReferenceInvalid,
                "CategoryId, BrandId, or WarehouseId does not exist.");
        }

        var equipment = ToEntity(request);
        var created = await equipmentRepository.CreateAsync(equipment, cancellationToken);
        var createdWithRelations = await equipmentRepository.GetByIdAsync(created.Id, cancellationToken);
        if (createdWithRelations is null)
        {
            return ServiceResult<EquipmentDto>.Fail(
                ApiErrorCode.EquipmentReloadFailed,
                "Created equipment could not be reloaded.");
        }

        return ServiceResult<EquipmentDto>.Ok(ToDto(createdWithRelations));
    }

    public async Task<ServiceResult> UpdateAsync(int id, EquipmentUpsertDto request, CancellationToken cancellationToken = default)
    {
        var referencesExist = await equipmentRepository.RelatedEntitiesExistAsync(
            request.CategoryId,
            request.BrandId,
            request.WarehouseId,
            cancellationToken);
        if (!referencesExist)
        {
            return ServiceResult.Fail(
                ApiErrorCode.EquipmentReferenceInvalid,
                "CategoryId, BrandId, or WarehouseId does not exist.");
        }

        var updatedEquipment = ToEntity(request);
        updatedEquipment.Id = id;
        var updated = await equipmentRepository.UpdateAsync(updatedEquipment, cancellationToken);
        if (!updated)
        {
            return ServiceResult.Fail(
                ApiErrorCode.EquipmentNotFound,
                $"Equipment with id {id} was not found.");
        }

        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var deleted = await equipmentRepository.DeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return ServiceResult.Fail(
                ApiErrorCode.EquipmentNotFound,
                $"Equipment with id {id} was not found.");
        }

        return ServiceResult.Ok();
    }

    private static Equipment ToEntity(EquipmentUpsertDto request) =>
        new()
        {
            Name = request.Name.Trim(),
            CategoryId = request.CategoryId,
            BrandId = request.BrandId,
            WarehouseId = request.WarehouseId,
            DailyRate = request.DailyRate,
            IsAvailable = request.IsAvailable,
            ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl)
                ? null
                : request.ImageUrl.Trim(),
        };

    private static EquipmentDto ToDto(Equipment equipment) =>
        new()
        {
            Id = equipment.Id,
            Name = equipment.Name,
            CategoryId = equipment.CategoryId,
            CategoryName = equipment.Category?.Name,
            BrandId = equipment.BrandId,
            BrandName = equipment.Brand?.Name,
            WarehouseId = equipment.WarehouseId,
            WarehouseName = equipment.Warehouse?.Name,
            DailyRate = equipment.DailyRate,
            IsAvailable = equipment.IsAvailable,
            ImageUrl = equipment.ImageUrl,
        };
}
