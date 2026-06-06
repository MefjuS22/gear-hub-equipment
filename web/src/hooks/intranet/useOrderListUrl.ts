import { useMemo } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";

import {
  type OrderListSearch,
  type OrderListSearchInput,
  parseOrderListSearch,
} from "../../lib/orderListSearch";

function normalizePath(path: string) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

export function useOrderListUrl() {
  const navigate = useNavigate();
  const searchRaw = useRouterState({
    select: (state) => {
      if (normalizePath(state.location.pathname) !== "/intranet/orders") {
        return null;
      }
      return state.location.search as OrderListSearchInput;
    },
  });

  const search = useMemo(
    () => parseOrderListSearch(searchRaw ?? {}),
    [searchRaw],
  );

  const setSearch = (patch: Partial<OrderListSearch>) => {
    void navigate({
      to: "/intranet/orders",
      search: (prev) => {
        const current = parseOrderListSearch(prev as OrderListSearchInput);
        const next = { ...current, ...patch };
        if (
          patch.q !== undefined ||
          patch.orderDateFrom !== undefined ||
          patch.orderDateTo !== undefined ||
          patch.customerId !== undefined
        ) {
          next.page = 1;
        }
        if (patch.pageSize !== undefined) {
          next.page = 1;
        }
        return next;
      },
      replace: true,
    });
  };

  const clearFilters = () => {
    setSearch({
      q: "",
      orderDateFrom: "",
      orderDateTo: "",
      customerId: "all",
      page: 1,
    });
  };

  return { search, setSearch, clearFilters };
}
