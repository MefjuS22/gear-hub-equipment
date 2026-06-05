export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export const LOOKUP_PAGE_SIZE = 100;

export type PagedSlice<T> = {
  items?: T[] | null;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
};

export function getPagedItems<T>(
  data: PagedSlice<T> | undefined | null,
): T[] {
  return data?.items ?? [];
}

export function getPagedMeta(data: PagedSlice<unknown> | undefined | null) {
  return {
    page: Math.max(0, (data?.page ?? 1) - 1),
    pageSize: data?.pageSize ?? DEFAULT_PAGE_SIZE,
    totalCount: data?.totalCount ?? 0,
    totalPages: data?.totalPages ?? 0,
  };
}

export function buildPageParams(page: number, pageSize = DEFAULT_PAGE_SIZE) {
  return { Page: page + 1, PageSize: pageSize };
}
