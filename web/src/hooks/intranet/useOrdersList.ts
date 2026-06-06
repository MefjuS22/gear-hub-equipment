import { useMemo } from "react";

import { gearhubApiClientOptions } from "../../api/clientOptions";
import { useGetApiOrder } from "../../api/generated/react-query";
import {
  orderListSearchToApiParams,
  type OrderListSearch,
} from "../../lib/orderListSearch";
import { getPagedItems } from "../../lib/pagination";
import { useDebouncedValue } from "../useDebouncedValue";

export function useOrdersList(search: OrderListSearch) {
  const debouncedQ = useDebouncedValue(search.q);
  const apiSearch = useMemo(
    (): OrderListSearch => ({
      ...search,
      q: debouncedQ,
    }),
    [search, debouncedQ],
  );

  const params = useMemo(
    () => orderListSearchToApiParams(apiSearch),
    [apiSearch],
  );

  const list = useGetApiOrder(params, {
    client: gearhubApiClientOptions,
    query: {
      placeholderData: (previous) => previous,
    },
  });

  const items = getPagedItems(list.data);
  const totalCount = list.data?.totalCount ?? 0;
  const isFiltering = search.q.trim() !== debouncedQ.trim();

  const page = search.page - 1;
  const pageSize = search.pageSize;

  return {
    list,
    items,
    totalCount,
    isFiltering,
    apiSearch,
    page,
    pageSize,
  };
}
