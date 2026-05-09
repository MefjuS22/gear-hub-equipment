using Microsoft.EntityFrameworkCore;

namespace GearHub.Api.Data;

public static class CmsTableBootstrap
{
    public static void EnsureCmsPostsTable(ApplicationDbContext dbContext)
    {
        dbContext.Database.ExecuteSqlRaw(
            """
            DO $cms_legacy_fix$
            DECLARE
              id_pg_type text;
              tbl name;
            BEGIN
              SELECT format_type(a.atttypid, a.atttypmod), c.relname
                INTO id_pg_type, tbl
              FROM pg_class c
              JOIN pg_namespace n ON n.oid = c.relnamespace
              JOIN pg_attribute a ON a.attrelid = c.oid
              WHERE n.nspname = 'public'
                AND c.relkind = 'r'
                AND (c.relname = 'CmsPosts' OR c.relname = 'cmsposts')
                AND a.attname = 'Id'
                AND a.attnum > 0
                AND NOT a.attisdropped;

              IF id_pg_type IS NOT NULL AND id_pg_type <> 'uuid' AND tbl IS NOT NULL THEN
                EXECUTE format('DROP TABLE IF EXISTS %I.%I CASCADE', 'public', tbl);
              END IF;
            END
            $cms_legacy_fix$ LANGUAGE plpgsql;
            """);

        dbContext.Database.ExecuteSqlRaw(
            """
            CREATE TABLE IF NOT EXISTS "CmsPosts" (
                "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "Slug" character varying(200) NOT NULL,
                "Title" character varying(300) NOT NULL,
                "Excerpt" character varying(2000),
                "CoverImageUrl" character varying(2000) NULL,
                "BodyHtml" text NOT NULL DEFAULT '',
                "IsPublished" boolean NOT NULL DEFAULT FALSE,
                "PublishedAtUtc" timestamp with time zone NULL,
                "CreatedAtUtc" timestamp with time zone NOT NULL,
                "UpdatedAtUtc" timestamp with time zone NOT NULL,
                CONSTRAINT "PK_CmsPosts" PRIMARY KEY ("Id")
            );
            """);
        dbContext.Database.ExecuteSqlRaw(
            """
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_CmsPosts_Slug" ON "CmsPosts" ("Slug");
            """);
    }
}
