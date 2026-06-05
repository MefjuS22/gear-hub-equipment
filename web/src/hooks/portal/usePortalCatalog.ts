import { useMemo } from "react";

import { gearhubApiClientOptions } from "../../api/clientOptions";
import {
  useGetApiEquipment,
  useGetApiEquipmentCategories,
} from "../../api/generated/react-query";
import {
  catalogCategoriesQueryParams,
  catalogSearchToApiParams,
  type CatalogSearch,
} from "../../lib/catalogSearch";
import { getPagedItems } from "../../lib/pagination";
import { useDebouncedValue } from "../useDebouncedValue";

export function usePortalCatalog(search: CatalogSearch) {
  const debouncedQ = useDebouncedValue(search.q);
  const apiSearch = useMemo(
    (): CatalogSearch => ({
      ...search,
      q: debouncedQ,
    }),
    [search, debouncedQ],
  );

  const equipmentParams = useMemo(
    () => catalogSearchToApiParams(apiSearch),
    [apiSearch],
  );

  const categoryParams = useMemo(
    () => catalogCategoriesQueryParams(apiSearch),
    [apiSearch],
  );

  const equipment = useGetApiEquipment(equipmentParams, {
    client: gearhubApiClientOptions,
    query: {
      placeholderData: (previous) => previous,
    },
  });

  const categories = useGetApiEquipmentCategories(categoryParams, {
    client: gearhubApiClientOptions,
    query: {
      placeholderData: (previous) => previous,
    },
  });

  const items = getPagedItems(equipment.data);
  const totalCount = equipment.data?.totalCount ?? 0;
  const isFiltering = search.q.trim() !== debouncedQ.trim();

  return {
    equipment,
    categories,
    items,
    totalCount,
    isFiltering,
  };
}
