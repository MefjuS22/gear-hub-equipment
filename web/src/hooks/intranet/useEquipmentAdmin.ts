import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { gearhubApiClientOptions } from "../../api/clientOptions";
import {
  getApiEquipmentQueryKey,
  useDeleteApiEquipmentId,
  useGetApiEquipment,
} from "../../api/generated/react-query";
import { useListPagination, usePagedResult } from "../useListPagination";

export function useEquipmentAdmin() {
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const { page, setPage, pageSize, setPageSize, params } = useListPagination();

  const equipment = useGetApiEquipment(params, {
    client: gearhubApiClientOptions,
  });
  const paged = usePagedResult(equipment.data);

  const remove = useDeleteApiEquipmentId({
    client: gearhubApiClientOptions,
    mutation: {
      onSuccess: () => {
        void qc.invalidateQueries({ queryKey: getApiEquipmentQueryKey() });
        enqueueSnackbar("Equipment removed.", { variant: "info" });
      },
      onError: (e) => {
        enqueueSnackbar(String((e as Error)?.message ?? e), {
          variant: "error",
        });
      },
    },
  });

  return { equipment, remove, page, setPage, pageSize, setPageSize, ...paged };
}
