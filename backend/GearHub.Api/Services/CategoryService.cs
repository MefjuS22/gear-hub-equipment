using GearHub.Api.Data;
using GearHub.Api.DTOs;
using GearHub.Api.Models;
using GearHub.Api.Responses;
using Microsoft.EntityFrameworkCore;

namespace GearHub.Api.Services;

public class CategoryService(ApplicationDbContext dbContext) : ICategoryService
{
    public async Task<IReadOnlyList<CategoryLookupDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var categories = await dbContext.Categories
            .AsNoTracking()
            .OrderBy(category => category.Name)
            .ToListAsync(cancellationToken);

        return categories.Select(ToLookupDto).ToList();
    }

    public async Task<ServiceResult<CategoryLookupDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var category = await dbContext.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (category is null)
        {
            return ServiceResult<CategoryLookupDto>.Fail(
                ApiErrorCode.CategoryNotFound,
                $"Category with id {id} was not found.");
        }

        return ServiceResult<CategoryLookupDto>.Ok(ToLookupDto(category));
    }

    public async Task<CategoryLookupDto> CreateAsync(CategoryUpsertDto request, CancellationToken cancellationToken = default)
    {
        var entity = new Category
        {
            Name = request.Name.Trim(),
            Description = (request.Description ?? string.Empty).Trim(),
        };
        dbContext.Categories.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ToLookupDto(entity);
    }

    public async Task<ServiceResult> UpdateAsync(int id, CategoryUpsertDto request, CancellationToken cancellationToken = default)
    {
        var category = await dbContext.Categories.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        if (category is null)
        {
            return ServiceResult.Fail(
                ApiErrorCode.CategoryNotFound,
                $"Category with id {id} was not found.");
        }

        category.Name = request.Name.Trim();
        category.Description = (request.Description ?? string.Empty).Trim();
        await dbContext.SaveChangesAsync(cancellationToken);
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var category = await dbContext.Categories.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        if (category is null)
        {
            return ServiceResult.Fail(
                ApiErrorCode.CategoryNotFound,
                $"Category with id {id} was not found.");
        }

        var inUse = await dbContext.Equipment.AnyAsync(e => e.CategoryId == id, cancellationToken);
        if (inUse)
        {
            return ServiceResult.Fail(
                ApiErrorCode.CategoryInUse,
                "This category is still assigned to one or more equipment items.");
        }

        dbContext.Categories.Remove(category);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ServiceResult.Ok();
    }

    private static CategoryLookupDto ToLookupDto(Category category) =>
        new()
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
        };
}
