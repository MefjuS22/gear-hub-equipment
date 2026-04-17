using GearHub.Api.Models;
using GearHub.Api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace GearHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EquipmentController(IEquipmentRepository equipmentRepository) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Equipment>>> GetAll(CancellationToken cancellationToken)
    {
        var equipment = await equipmentRepository.GetAllAsync(cancellationToken);
        return Ok(equipment);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Equipment>> GetById(int id, CancellationToken cancellationToken)
    {
        var equipment = await equipmentRepository.GetByIdAsync(id, cancellationToken);

        if (equipment is null)
        {
            return NotFound();
        }

        return Ok(equipment);
    }

    [HttpPost]
    public async Task<ActionResult<Equipment>> Create([FromBody] Equipment equipment, CancellationToken cancellationToken)
    {
        var created = await equipmentRepository.CreateAsync(equipment, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] Equipment updatedEquipment, CancellationToken cancellationToken)
    {
        if (id != updatedEquipment.Id)
        {
            return BadRequest("Route id must match payload id.");
        }

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
}
