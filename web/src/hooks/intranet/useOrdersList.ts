import { gearhubApiClientOptions } from "../../api/clientOptions";
import { useGetApiOrder } from "../../api/generated/react-query";
import { useListPagination, usePagedResult } from "../useListPagination";

export function useOrdersList() {
  const { page, setPage, pageSize, setPageSize, params } = useListPagination();
  const list = useGetApiOrder(params, { client: gearhubApiClientOptions });
  const paged = usePagedResult(list.data);

  return { list, page, setPage, pageSize, setPageSize, ...paged };
}
