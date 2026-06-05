using GearHub.Api.Data;
using GearHub.Api.DTOs;
using GearHub.Api.Models;
using GearHub.Api.Responses;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Text.RegularExpressions;

namespace GearHub.Api.Services;

public class CmsPostService(
    ApplicationDbContext dbContext,
    ILogger<CmsPostService> logger) : ICmsPostService
{
    private const string PostgresUniqueViolation = "23505";

    public async Task<PagedResultDto<CmsPostListDto>> GetAllAsync(
        PaginationQuery pagination,
        CancellationToken cancellationToken = default)
    {
        var (page, pageSize, skip) = Pagination.Normalize(pagination);
        var query = dbContext.CmsPosts.AsNoTracking().OrderByDescending(p => p.UpdatedAtUtc);
        var totalCount = await query.CountAsync(cancellationToken);
        var posts = await query
            .Skip(skip)
            .Take(pageSize)
            .Select(p => ToListDto(p))
            .ToListAsync(cancellationToken);
        return Pagination.Create(posts, page, pageSize, totalCount);
    }

    public async Task<ServiceResult<CmsPostDetailDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var post = await dbContext.CmsPosts.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (post is null)
        {
            return ServiceResult<CmsPostDetailDto>.Fail(
                ApiErrorCode.CmsPostNotFound,
                $"CMS post with id {id} was not found.");
        }

        return ServiceResult<CmsPostDetailDto>.Ok(ToDetailDto(post));
    }

    public async Task<PagedResultDto<CmsPostPublicSummaryDto>> GetPublishedAsync(
        PaginationQuery pagination,
        CancellationToken cancellationToken = default)
    {
        var (page, pageSize, skip) = Pagination.Normalize(pagination);
        var query = dbContext.CmsPosts
            .AsNoTracking()
            .Where(p => p.IsPublished && p.PublishedAtUtc != null)
            .OrderByDescending(p => p.PublishedAtUtc);
        var totalCount = await query.CountAsync(cancellationToken);
        var posts = await query
            .Skip(skip)
            .Take(pageSize)
            .Select(p => new CmsPostPublicSummaryDto
            {
                Id = p.Id,
                Slug = p.Slug,
                Title = p.Title,
                Excerpt = p.Excerpt,
                CoverImageUrl = p.CoverImageUrl,
                PublishedAtUtc = p.PublishedAtUtc!.Value,
            })
            .ToListAsync(cancellationToken);
        return Pagination.Create(posts, page, pageSize, totalCount);
    }

    public async Task<ServiceResult<CmsPostPublicDetailDto>> GetPublishedBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        var post = await dbContext.CmsPosts
            .AsNoTracking()
            .FirstOrDefaultAsync(
                p => p.Slug == slug && p.IsPublished && p.PublishedAtUtc != null,
                cancellationToken);
        if (post is null)
        {
            return ServiceResult<CmsPostPublicDetailDto>.Fail(
                ApiErrorCode.CmsPostNotFound,
                "Post was not found or is not published.");
        }

        return ServiceResult<CmsPostPublicDetailDto>.Ok(ToPublicDetailDto(post));
    }

    public async Task<ServiceResult<CmsPostDetailDto>> CreateAsync(CmsPostUpsertDto request, CancellationToken cancellationToken = default)
    {
        var title = request.Title.Trim();
        var userChoseSlug = !string.IsNullOrWhiteSpace(request.Slug);
        var baseSlug = ResolveSlug(userChoseSlug ? request.Slug : null, title);

        string slug;
        if (userChoseSlug)
        {
            if (await dbContext.CmsPosts.AnyAsync(p => p.Slug == baseSlug, cancellationToken))
            {
                return ServiceResult<CmsPostDetailDto>.Fail(
                    ApiErrorCode.CmsPostSlugTaken,
                    "Another post already uses this URL slug. Change the slug or title.");
            }

            slug = baseSlug;
        }
        else
        {
            slug = await AllocateUniqueSlugForCreateAsync(baseSlug, cancellationToken);
        }

        var now = DateTime.UtcNow;
        var entity = new CmsPost
        {
            Id = Guid.NewGuid(),
            Slug = slug,
            Title = title,
            Excerpt = string.IsNullOrWhiteSpace(request.Excerpt) ? null : request.Excerpt.Trim(),
            CoverImageUrl = string.IsNullOrWhiteSpace(request.CoverImageUrl)
                ? null
                : request.CoverImageUrl.Trim(),
            BodyHtml = request.BodyHtml ?? string.Empty,
            IsPublished = request.IsPublished,
            PublishedAtUtc = request.IsPublished ? now : null,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        };

        dbContext.CmsPosts.Add(entity);

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (IsUniqueViolation(ex))
        {
            logger.LogWarning(ex, "Unique constraint while creating CMS post (slug {Slug}).", slug);
            return ServiceResult<CmsPostDetailDto>.Fail(
                ApiErrorCode.CmsPostSlugTaken,
                "Another post already uses this URL slug. Change the slug or title.");
        }
        catch (DbUpdateException ex)
        {
            logger.LogError(ex, "Database error while creating CMS post.");
            return ServiceResult<CmsPostDetailDto>.Fail(
                ApiErrorCode.ValidationFailed,
                "Could not save the post. If you recently changed the database schema, ensure the CmsPosts table matches the API (UUID primary key).");
        }

        var created = await dbContext.CmsPosts.AsNoTracking().FirstAsync(p => p.Id == entity.Id, cancellationToken);
        return ServiceResult<CmsPostDetailDto>.Ok(ToDetailDto(created));
    }

    public async Task<ServiceResult<CmsPostDetailDto>> UpdateAsync(Guid id, CmsPostUpsertDto request, CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.CmsPosts.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (entity is null)
        {
            return ServiceResult<CmsPostDetailDto>.Fail(
                ApiErrorCode.CmsPostNotFound,
                $"CMS post with id {id} was not found.");
        }

        var title = request.Title.Trim();
        var slug = ResolveSlug(request.Slug, title);
        var slugTaken = await dbContext.CmsPosts.AnyAsync(p => p.Slug == slug && p.Id != id, cancellationToken);
        if (slugTaken)
        {
            return ServiceResult<CmsPostDetailDto>.Fail(
                ApiErrorCode.CmsPostSlugTaken,
                "Another post already uses this URL slug.");
        }

        var now = DateTime.UtcNow;
        entity.Slug = slug;
        entity.Title = title;
        entity.Excerpt = string.IsNullOrWhiteSpace(request.Excerpt) ? null : request.Excerpt.Trim();
        entity.CoverImageUrl = string.IsNullOrWhiteSpace(request.CoverImageUrl)
            ? null
            : request.CoverImageUrl.Trim();
        entity.BodyHtml = request.BodyHtml ?? string.Empty;

        if (request.IsPublished)
        {
            entity.IsPublished = true;
            entity.PublishedAtUtc ??= now;
        }
        else
        {
            entity.IsPublished = false;
            entity.PublishedAtUtc = null;
        }

        entity.UpdatedAtUtc = now;

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (IsUniqueViolation(ex))
        {
            logger.LogWarning(ex, "Unique constraint while updating CMS post {Id}.", id);
            return ServiceResult<CmsPostDetailDto>.Fail(
                ApiErrorCode.CmsPostSlugTaken,
                "Another post already uses this URL slug.");
        }
        catch (DbUpdateException ex)
        {
            logger.LogError(ex, "Database error while updating CMS post {Id}.", id);
            return ServiceResult<CmsPostDetailDto>.Fail(
                ApiErrorCode.ValidationFailed,
                "Could not save the post. Check database schema and constraints.");
        }

        var updated = await dbContext.CmsPosts.AsNoTracking().FirstAsync(p => p.Id == id, cancellationToken);
        return ServiceResult<CmsPostDetailDto>.Ok(ToDetailDto(updated));
    }

    public async Task<ServiceResult> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.CmsPosts.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (entity is null)
        {
            return ServiceResult.Fail(
                ApiErrorCode.CmsPostNotFound,
                $"CMS post with id {id} was not found.");
        }

        dbContext.CmsPosts.Remove(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ServiceResult.Ok();
    }

    private async Task<string> AllocateUniqueSlugForCreateAsync(
        string baseSlug,
        CancellationToken cancellationToken)
    {
        var slug = baseSlug;
        for (var attempt = 0; attempt < 64; attempt++)
        {
            var exists = await dbContext.CmsPosts.AnyAsync(p => p.Slug == slug, cancellationToken);
            if (!exists)
            {
                return slug;
            }

            slug = $"{baseSlug}-{Guid.NewGuid().ToString("N")[..8]}";
        }

        return $"{baseSlug}-{Guid.NewGuid():N}";
    }

    private static bool IsUniqueViolation(DbUpdateException ex)
    {
        for (Exception? e = ex; e != null; e = e.InnerException)
        {
            if (e is PostgresException pg && pg.SqlState == PostgresUniqueViolation)
            {
                return true;
            }
        }

        return false;
    }

    private static string ResolveSlug(string? slugInput, string title)
    {
        var t = title.Trim();
        var raw = string.IsNullOrWhiteSpace(slugInput) ? t : slugInput.Trim();
        var normalized = NormalizeSlug(raw);
        if (string.IsNullOrEmpty(normalized))
        {
            normalized = "post-" + Guid.NewGuid().ToString("N")[..12];
        }

        return normalized;
    }

    private static string NormalizeSlug(string input)
    {
        var lower = input.Trim().ToLowerInvariant();
        var slugChars = Regex.Replace(lower, @"[^a-z0-9\s-]", "");
        slugChars = Regex.Replace(slugChars, @"[\s_]+", "-");
        slugChars = Regex.Replace(slugChars, "-{2,}", "-");
        return slugChars.Trim('-');
    }

    private static CmsPostListDto ToListDto(CmsPost p) =>
        new()
        {
            Id = p.Id,
            Slug = p.Slug,
            Title = p.Title,
            Excerpt = p.Excerpt,
            CoverImageUrl = p.CoverImageUrl,
            IsPublished = p.IsPublished,
            PublishedAtUtc = p.PublishedAtUtc,
            UpdatedAtUtc = p.UpdatedAtUtc,
        };

    private static CmsPostDetailDto ToDetailDto(CmsPost p) =>
        new()
        {
            Id = p.Id,
            Slug = p.Slug,
            Title = p.Title,
            Excerpt = p.Excerpt,
            CoverImageUrl = p.CoverImageUrl,
            BodyHtml = p.BodyHtml,
            IsPublished = p.IsPublished,
            PublishedAtUtc = p.PublishedAtUtc,
            CreatedAtUtc = p.CreatedAtUtc,
            UpdatedAtUtc = p.UpdatedAtUtc,
        };

    private static CmsPostPublicDetailDto ToPublicDetailDto(CmsPost p) =>
        new()
        {
            Id = p.Id,
            Slug = p.Slug,
            Title = p.Title,
            Excerpt = p.Excerpt,
            CoverImageUrl = p.CoverImageUrl,
            BodyHtml = p.BodyHtml,
            PublishedAtUtc = p.PublishedAtUtc!.Value,
            UpdatedAtUtc = p.UpdatedAtUtc,
        };
}
