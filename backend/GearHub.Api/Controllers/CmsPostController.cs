using GearHub.Api.Data;
using GearHub.Api.DTOs;
using GearHub.Api.Models;
using GearHub.Api.Responses;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Text.RegularExpressions;

namespace GearHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CmsPostController(
    ApplicationDbContext dbContext,
    ILogger<CmsPostController> logger) : ControllerBase
{
    private const string PostgresUniqueViolation = "23505";

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<CmsPostListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<CmsPostListDto>>> GetAll(CancellationToken cancellationToken)
    {
        var rows = await dbContext.CmsPosts
            .AsNoTracking()
            .OrderByDescending(p => p.UpdatedAtUtc)
            .Select(p => ToListDto(p))
            .ToListAsync(cancellationToken);
        return Ok(rows);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(CmsPostDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CmsPostDetailDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var post = await dbContext.CmsPosts.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (post is null)
        {
            return ApiResponses.Error(
                StatusCodes.Status404NotFound,
                ApiErrorCode.CmsPostNotFound,
                $"CMS post with id {id} was not found.");
        }

        return Ok(ToDetailDto(post));
    }

    [HttpGet("Published")]
    [ProducesResponseType(typeof(IReadOnlyList<CmsPostPublicSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<CmsPostPublicSummaryDto>>> GetPublished(
        CancellationToken cancellationToken)
    {
        var rows = await dbContext.CmsPosts
            .AsNoTracking()
            .Where(p => p.IsPublished && p.PublishedAtUtc != null)
            .OrderByDescending(p => p.PublishedAtUtc)
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
        return Ok(rows);
    }

    [HttpGet("Published/{slug}")]
    [ProducesResponseType(typeof(CmsPostPublicDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CmsPostPublicDetailDto>> GetPublishedBySlug(
        string slug,
        CancellationToken cancellationToken)
    {
        var post = await dbContext.CmsPosts
            .AsNoTracking()
            .FirstOrDefaultAsync(
                p => p.Slug == slug && p.IsPublished && p.PublishedAtUtc != null,
                cancellationToken);
        if (post is null)
        {
            return ApiResponses.Error(
                StatusCodes.Status404NotFound,
                ApiErrorCode.CmsPostNotFound,
                "Post was not found or is not published.");
        }

        return Ok(ToPublicDetailDto(post));
    }

    [HttpPost]
    [ProducesResponseType(typeof(CmsPostDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CmsPostDetailDto>> Create(
        [FromBody] CmsPostUpsertDto request,
        CancellationToken cancellationToken)
    {
        var title = request.Title.Trim();
        var userChoseSlug = !string.IsNullOrWhiteSpace(request.Slug);
        var baseSlug = ResolveSlug(userChoseSlug ? request.Slug : null, title);

        string slug;
        if (userChoseSlug)
        {
            if (await dbContext.CmsPosts.AnyAsync(p => p.Slug == baseSlug, cancellationToken))
            {
                return ApiResponses.Error(
                    StatusCodes.Status400BadRequest,
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
            return ApiResponses.Error(
                StatusCodes.Status400BadRequest,
                ApiErrorCode.CmsPostSlugTaken,
                "Another post already uses this URL slug. Change the slug or title.");
        }
        catch (DbUpdateException ex)
        {
            logger.LogError(ex, "Database error while creating CMS post.");
            return ApiResponses.Error(
                StatusCodes.Status400BadRequest,
                ApiErrorCode.ValidationFailed,
                "Could not save the post. If you recently changed the database schema, ensure the CmsPosts table matches the API (UUID primary key).");
        }

        var created = await dbContext.CmsPosts.AsNoTracking().FirstAsync(p => p.Id == entity.Id, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, ToDetailDto(created));
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(CmsPostDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CmsPostDetailDto>> Update(
        Guid id,
        [FromBody] CmsPostUpsertDto request,
        CancellationToken cancellationToken)
    {
        var entity = await dbContext.CmsPosts.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (entity is null)
        {
            return ApiResponses.Error(
                StatusCodes.Status404NotFound,
                ApiErrorCode.CmsPostNotFound,
                $"CMS post with id {id} was not found.");
        }

        var title = request.Title.Trim();
        var slug = ResolveSlug(request.Slug, title);
        var slugTaken = await dbContext.CmsPosts.AnyAsync(p => p.Slug == slug && p.Id != id, cancellationToken);
        if (slugTaken)
        {
            return ApiResponses.Error(
                StatusCodes.Status400BadRequest,
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
            return ApiResponses.Error(
                StatusCodes.Status400BadRequest,
                ApiErrorCode.CmsPostSlugTaken,
                "Another post already uses this URL slug.");
        }
        catch (DbUpdateException ex)
        {
            logger.LogError(ex, "Database error while updating CMS post {Id}.", id);
            return ApiResponses.Error(
                StatusCodes.Status400BadRequest,
                ApiErrorCode.ValidationFailed,
                "Could not save the post. Check database schema and constraints.");
        }

        var updated = await dbContext.CmsPosts.AsNoTracking().FirstAsync(p => p.Id == id, cancellationToken);
        return Ok(ToDetailDto(updated));
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var entity = await dbContext.CmsPosts.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (entity is null)
        {
            return ApiResponses.Error(
                StatusCodes.Status404NotFound,
                ApiErrorCode.CmsPostNotFound,
                $"CMS post with id {id} was not found.");
        }

        dbContext.CmsPosts.Remove(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
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
