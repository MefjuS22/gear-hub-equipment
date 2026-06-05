import { useMemo } from "react";

import { gearhubApiClientOptions } from "../../api/clientOptions";
import {
  useGetApiEquipment,
  useGetApiEquipmentCategories,
} from "../../api/generated/react-query";
import { getPagedItems } from "../../lib/pagination";
import { useListPagination } from "../useListPagination";

type UsePortalCatalogOptions = {
  search: string;
  categoryKey: string;
};

export function usePortalCatalog({
  search,
  categoryKey,
}: UsePortalCatalogOptions) {
  const { page, setPage, pageSize, setPageSize, params } = useListPagination();

  const queryParams = useMemo(
    () => ({
      ...params,
      Search: search.trim() || undefined,
      Category: categoryKey !== "all" ? categoryKey : undefined,
    }),
    [params, search, categoryKey],
  );

  const equipment = useGetApiEquipment(queryParams, {
    client: gearhubApiClientOptions,
  });

  const categories = useGetApiEquipmentCategories({
    client: gearhubApiClientOptions,
  });

  const items = getPagedItems(equipment.data);
  const totalCount = equipment.data?.totalCount ?? 0;

  return {
    equipment,
    categories,
    items,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalCount,
  };
}
