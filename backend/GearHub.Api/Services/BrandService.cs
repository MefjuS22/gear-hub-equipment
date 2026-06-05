using GearHub.Api.Data;
using GearHub.Api.DTOs;
using GearHub.Api.Models;
using GearHub.Api.Responses;
using Microsoft.EntityFrameworkCore;

namespace GearHub.Api.Services;

public class BrandService(ApplicationDbContext dbContext) : IBrandService
{
    public async Task<PagedResultDto<BrandLookupDto>> GetAllAsync(
        PaginationQuery pagination,
        CancellationToken cancellationToken = default)
    {
        var (page, pageSize, skip) = Pagination.Normalize(pagination);
        var query = dbContext.Brands.AsNoTracking().OrderBy(brand => brand.Name);
        var totalCount = await query.CountAsync(cancellationToken);
        var brands = await query.Skip(skip).Take(pageSize).ToListAsync(cancellationToken);
        return Pagination.Create(brands.Select(ToLookupDto).ToList(), page, pageSize, totalCount);
    }

    public async Task<ServiceResult<BrandLookupDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var brand = await dbContext.Brands
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);

        if (brand is null)
        {
            return ServiceResult<BrandLookupDto>.Fail(
                ApiErrorCode.BrandNotFound,
                $"Brand with id {id} was not found.");
        }

        return ServiceResult<BrandLookupDto>.Ok(ToLookupDto(brand));
    }

    public async Task<BrandLookupDto> CreateAsync(BrandUpsertDto request, CancellationToken cancellationToken = default)
    {
        var entity = new Brand { Name = request.Name.Trim() };
        dbContext.Brands.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ToLookupDto(entity);
    }

    public async Task<ServiceResult> UpdateAsync(int id, BrandUpsertDto request, CancellationToken cancellationToken = default)
    {
        var brand = await dbContext.Brands.FirstOrDefaultAsync(b => b.Id == id, cancellationToken);
        if (brand is null)
        {
            return ServiceResult.Fail(
                ApiErrorCode.BrandNotFound,
                $"Brand with id {id} was not found.");
        }

        brand.Name = request.Name.Trim();
        await dbContext.SaveChangesAsync(cancellationToken);
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var brand = await dbContext.Brands.FirstOrDefaultAsync(b => b.Id == id, cancellationToken);
        if (brand is null)
        {
            return ServiceResult.Fail(
                ApiErrorCode.BrandNotFound,
                $"Brand with id {id} was not found.");
        }

        var inUse = await dbContext.Equipment.AnyAsync(e => e.BrandId == id, cancellationToken);
        if (inUse)
        {
            return ServiceResult.Fail(
                ApiErrorCode.BrandInUse,
                "This brand is still assigned to one or more equipment items.");
        }

        dbContext.Brands.Remove(brand);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ServiceResult.Ok();
    }

    private static BrandLookupDto ToLookupDto(Brand brand) =>
        new() { Id = brand.Id, Name = brand.Name };
}
