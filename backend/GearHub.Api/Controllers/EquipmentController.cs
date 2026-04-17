using GearHub.Api.DTOs;
using GearHub.Api.Models;
using GearHub.Api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace GearHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EquipmentController(IEquipmentRepository equipmentRepository) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EquipmentDto>>> GetAll(CancellationToken cancellationToken)
    {
        var equipment = await equipmentRepository.GetAllAsync(cancellationToken);
        return Ok(equipment.Select(ToDto));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<EquipmentDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var equipment = await equipmentRepository.GetByIdAsync(id, cancellationToken);

        if (equipment is null)
        {
            return NotFound();
        }

        return Ok(ToDto(equipment));
    }

    [HttpPost]
    public async Task<ActionResult<EquipmentDto>> Create(
        [FromBody] EquipmentUpsertDto request,
        CancellationToken cancellationToken)
    {
        var referencesExist = await equipmentRepository.RelatedEntitiesExistAsync(
            request.CategoryId,
            request.BrandId,
            request.WarehouseId,
            cancellationToken);
        if (!referencesExist)
        {
            return ValidationProblem(new ValidationProblemDetails(new Dictionary<string, string[]>
            {
                ["references"] = ["CategoryId, BrandId, or WarehouseId does not exist."]
            }));
        }

        var equipment = ToEntity(request);
        var created = await equipmentRepository.CreateAsync(equipment, cancellationToken);
        var createdWithRelations = await equipmentRepository.GetByIdAsync(created.Id, cancellationToken);
        if (createdWithRelations is null)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, "Created equipment could not be reloaded.");
        }

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, ToDto(createdWithRelations));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] EquipmentUpsertDto request,
        CancellationToken cancellationToken)
    {
        var referencesExist = await equipmentRepository.RelatedEntitiesExistAsync(
            request.CategoryId,
            request.BrandId,
            request.WarehouseId,
            cancellationToken);
        if (!referencesExist)
        {
            return ValidationProblem(new ValidationProblemDetails(new Dictionary<string, string[]>
            {
                ["references"] = ["CategoryId, BrandId, or WarehouseId does not exist."]
            }));
        }

        var updatedEquipment = ToEntity(request);
        updatedEquipment.Id = id;
        var updated = await equipmentRepository.UpdateAsync(updatedEquipment, cancellationToken);
        if (!updated)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await equipmentRepository.DeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    private static Equipment ToEntity(EquipmentUpsertDto request) =>
        new()
        {
            Name = request.Name.Trim(),
            CategoryId = request.CategoryId,
            BrandId = request.BrandId,
            WarehouseId = request.WarehouseId,
            DailyRate = request.DailyRate,
            IsAvailable = request.IsAvailable
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
            IsAvailable = equipment.IsAvailable
        };
}
