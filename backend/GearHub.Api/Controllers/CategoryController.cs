using GearHub.Api.Authorization;
using GearHub.Api.DTOs;
using GearHub.Api.Responses;
using GearHub.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GearHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[HasPermission(AppPermissions.CategoriesManage)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
public class CategoryController(ICategoryService categoryService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(PagedResultDto<CategoryLookupDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResultDto<CategoryLookupDto>>> GetAll(
        [FromQuery] PaginationQuery pagination,
        CancellationToken cancellationToken) =>
        Ok(await categoryService.GetAllAsync(pagination, cancellationToken));

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(CategoryLookupDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CategoryLookupDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await categoryService.GetByIdAsync(id, cancellationToken);
        if (!result.Success)
        {
            return ApiResponses.Error(
                StatusCodes.Status404NotFound,
                result.Error!.Code,
                result.Error.Message);
        }

        return Ok(result.Value);
    }

    [HttpPost]
    [ProducesResponseType(typeof(CategoryLookupDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CategoryLookupDto>> Create(
        [FromBody] CategoryUpsertDto request,
        CancellationToken cancellationToken)
    {
        var created = await categoryService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] CategoryUpsertDto request,
        CancellationToken cancellationToken)
    {
        var result = await categoryService.UpdateAsync(id, request, cancellationToken);
        if (!result.Success)
        {
            return ApiResponses.Error(
                StatusCodes.Status404NotFound,
                result.Error!.Code,
                result.Error.Message);
        }
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var result = await categoryService.DeleteAsync(id, cancellationToken);
        if (!result.Success)
        {
            var statusCode = result.Error!.Code == ApiErrorCode.CategoryInUse
                ? StatusCodes.Status400BadRequest
                : StatusCodes.Status404NotFound;
            return ApiResponses.Error(
                statusCode,
                result.Error.Code,
                result.Error.Message);
        }
        return NoContent();
    }
}
