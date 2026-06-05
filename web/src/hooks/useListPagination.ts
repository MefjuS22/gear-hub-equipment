import { useMemo, useState } from "react";

import {
  buildPageParams,
  DEFAULT_PAGE_SIZE,
  getPagedItems,
  type PagedSlice,
} from "../lib/pagination";

export function useListPagination(initialPageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const params = useMemo(
    () => buildPageParams(page, pageSize),
    [page, pageSize],
  );

  const setPageSize = (nextPageSize: number) => {
    setPageSizeState(nextPageSize);
    setPage(0);
  };

  return { page, setPage, pageSize, setPageSize, params };
}

export function usePagedResult<T>(data: PagedSlice<T> | undefined) {
  return useMemo(
    () => ({
      items: getPagedItems(data),
      totalCount: data?.totalCount ?? 0,
      totalPages: data?.totalPages ?? 0,
    }),
    [data],
  );
}
