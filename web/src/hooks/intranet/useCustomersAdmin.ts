import { gearhubApiClientOptions } from "../../api/clientOptions";
import { useGetApiCustomer } from "../../api/generated/react-query";
import { useListPagination, usePagedResult } from "../useListPagination";

export function useCustomersAdmin() {
  const { page, setPage, pageSize, setPageSize, params } = useListPagination();
  const list = useGetApiCustomer(params, { client: gearhubApiClientOptions });
  const paged = usePagedResult(list.data);

  return { list, page, setPage, pageSize, setPageSize, ...paged };
}
