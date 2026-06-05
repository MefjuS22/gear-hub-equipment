import { z } from "zod";

import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "./pagination";

export type CatalogSearchInput = {
  q?: string;
  category?: string;
  page?: unknown;
  pageSize?: unknown;
};

export const catalogSearchSchema = z.object({
  q: z.string().catch(""),
  category: z.string().catch("all"),
  page: z.coerce.number().int().min(1).catch(1),
  pageSize: z.coerce
    .number()
    .int()
    .catch(DEFAULT_PAGE_SIZE)
    .transform((value) =>
      PAGE_SIZE_OPTIONS.includes(value as (typeof PAGE_SIZE_OPTIONS)[number])
        ? value
        : DEFAULT_PAGE_SIZE,
    ),
});

export type CatalogSearch = z.infer<typeof catalogSearchSchema>;

export function parseCatalogSearch(
  raw: CatalogSearchInput = {},
): CatalogSearch {
  return catalogSearchSchema.parse(raw);
}

export function catalogSearchToApiParams(search: CatalogSearch) {
  const trimmed = search.q.trim();
  return {
    Page: search.page,
    PageSize: search.pageSize,
    Search: trimmed || undefined,
    Category: search.category !== "all" ? search.category : undefined,
  };
}

export function catalogCategoriesQueryParams(search: CatalogSearch) {
  const trimmed = search.q.trim();
  return trimmed ? { search: trimmed } : undefined;
}
