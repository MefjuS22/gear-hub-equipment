import { useMemo } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";

import {
  type CatalogSearch,
  type CatalogSearchInput,
  parseCatalogSearch,
} from "../../lib/catalogSearch";

function normalizePath(path: string) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

export function usePortalCatalogUrl() {
  const navigate = useNavigate();
  const searchRaw = useRouterState({
    select: (state) => {
      if (normalizePath(state.location.pathname) !== "/portal") {
        return null;
      }
      return state.location.search as CatalogSearchInput;
    },
  });

  const search = useMemo(
    () => parseCatalogSearch(searchRaw ?? {}),
    [searchRaw],
  );

  const setSearch = (patch: Partial<CatalogSearch>) => {
    void navigate({
      to: "/portal",
      search: (prev) => {
        const current = parseCatalogSearch(prev as CatalogSearchInput);
        const next = { ...current, ...patch };
        if (patch.q !== undefined || patch.category !== undefined) {
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

  return { search, setSearch };
}
