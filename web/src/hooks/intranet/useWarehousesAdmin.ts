import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { gearhubApiClientOptions } from "../../api/clientOptions";
import {
  getApiEquipmentQueryKey,
  getApiWarehouseQueryKey,
  useDeleteApiWarehouseId,
  useGetApiWarehouse,
  usePostApiWarehouse,
  usePutApiWarehouseId,
} from "../../api/generated/react-query";
import { formatApiErrorForDisplay, parseApiError } from "../../lib/apiError";
import { useListPagination, usePagedResult } from "../useListPagination";

export function useWarehousesAdmin() {
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const { page, setPage, pageSize, setPageSize, params } = useListPagination();

  const list = useGetApiWarehouse(params, { client: gearhubApiClientOptions });
  const paged = usePagedResult(list.data);

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: getApiWarehouseQueryKey() });
    void qc.invalidateQueries({ queryKey: getApiEquipmentQueryKey() });
  };

  const create = usePostApiWarehouse({
    client: gearhubApiClientOptions,
    mutation: {
      onSuccess: () => {
        invalidate();
        enqueueSnackbar("Warehouse created.", { variant: "success" });
      },
      onError: (e) => {
        enqueueSnackbar(formatApiErrorForDisplay(parseApiError(e)), {
          variant: "error",
        });
      },
    },
  });

  const update = usePutApiWarehouseId({
    client: gearhubApiClientOptions,
    mutation: {
      onSuccess: () => {
        invalidate();
        enqueueSnackbar("Warehouse updated.", { variant: "success" });
      },
      onError: (e) => {
        enqueueSnackbar(formatApiErrorForDisplay(parseApiError(e)), {
          variant: "error",
        });
      },
    },
  });

  const remove = useDeleteApiWarehouseId({
    client: gearhubApiClientOptions,
    mutation: {
      onSuccess: () => {
        invalidate();
        enqueueSnackbar("Warehouse removed.", { variant: "info" });
      },
      onError: (e) => {
        enqueueSnackbar(formatApiErrorForDisplay(parseApiError(e)), {
          variant: "error",
        });
      },
    },
  });

  return {
    list,
    create,
    update,
    remove,
    page,
    setPage,
    pageSize,
    setPageSize,
    ...paged,
  };
}
