using GearHub.Api.Data;
using GearHub.Api.DTOs;
using GearHub.Api.Models;
using GearHub.Api.Responses;
using Microsoft.EntityFrameworkCore;

namespace GearHub.Api.Services;

public class PortalTextService(ApplicationDbContext dbContext) : IPortalTextService
{
    public async Task<IReadOnlyList<PortalTextDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.PortalTexts
            .AsNoTracking()
            .OrderBy(text => text.SortOrder)
            .ThenBy(text => text.Key)
            .Select(text => ToDto(text))
            .ToListAsync(cancellationToken);
    }

    public async Task<ServiceResult<PortalTextDto>> GetByKeyAsync(string key, CancellationToken cancellationToken = default)
    {
        var text = await dbContext.PortalTexts.AsNoTracking().FirstOrDefaultAsync(t => t.Key == key, cancellationToken);
        if (text is null)
        {
            return ServiceResult<PortalTextDto>.Fail(
                ApiErrorCode.PortalTextNotFound,
                $"Portal text with key '{key}' was not found.");
        }

        return ServiceResult<PortalTextDto>.Ok(ToDto(text));
    }

    public async Task<IReadOnlyList<PortalTextPublicDto>> GetPublicAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.PortalTexts
            .AsNoTracking()
            .OrderBy(text => text.SortOrder)
            .Select(text => new PortalTextPublicDto
            {
                Key = text.Key,
                BodyHtml = text.BodyHtml,
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<ServiceResult<PortalTextDto>> UpdateAsync(
        string key,
        PortalTextUpsertDto request,
        CancellationToken cancellationToken = default)
    {
        var text = await dbContext.PortalTexts.FirstOrDefaultAsync(t => t.Key == key, cancellationToken);
        if (text is null)
        {
            return ServiceResult<PortalTextDto>.Fail(
                ApiErrorCode.PortalTextNotFound,
                $"Portal text with key '{key}' was not found.");
        }

        text.Title = request.Title.Trim();
        text.BodyHtml = request.BodyHtml;
        text.UpdatedAtUtc = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);

        return ServiceResult<PortalTextDto>.Ok(ToDto(text));
    }

    private static PortalTextDto ToDto(PortalText text) =>
        new()
        {
            Key = text.Key,
            Title = text.Title,
            PlacementHint = text.PlacementHint,
            BodyHtml = text.BodyHtml,
            SortOrder = text.SortOrder,
            UpdatedAtUtc = text.UpdatedAtUtc,
        };
}
