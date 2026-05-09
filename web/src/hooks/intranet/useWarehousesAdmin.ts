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

export function useWarehousesAdmin() {
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();

  const list = useGetApiWarehouse({ client: gearhubApiClientOptions });

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

  return { list, create, update, remove };
}
