using Microsoft.EntityFrameworkCore;

namespace GearHub.Api.Data;

public static class MediaColumnsBootstrap
{
    public static void EnsureMediaColumns(ApplicationDbContext dbContext)
    {
        dbContext.Database.ExecuteSqlRaw(
            """
            ALTER TABLE "Equipment" ADD COLUMN IF NOT EXISTS "ImageUrl" character varying(2000) NULL;
            """);
        dbContext.Database.ExecuteSqlRaw(
            """
            ALTER TABLE "Equipment" ADD COLUMN IF NOT EXISTS "DescriptionHtml" text NULL;
            """);
        dbContext.Database.ExecuteSqlRaw(
            """
            ALTER TABLE "CmsPosts" ADD COLUMN IF NOT EXISTS "CoverImageUrl" character varying(2000) NULL;
            """);
    }
}
