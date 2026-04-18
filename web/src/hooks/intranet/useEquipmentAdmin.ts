import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { gearhubApiClientOptions } from "../../api/clientOptions";
import {
  getApiEquipmentQueryKey,
  useDeleteApiEquipmentId,
  useGetApiEquipment,
} from "../../api/generated/react-query";

export function useEquipmentAdmin() {
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();

  const equipment = useGetApiEquipment({ client: gearhubApiClientOptions });

  const remove = useDeleteApiEquipmentId({
    client: gearhubApiClientOptions,
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getApiEquipmentQueryKey() });
        enqueueSnackbar("Equipment removed.", { variant: "info" });
      },
      onError: (e) => {
        enqueueSnackbar(String((e as Error)?.message ?? e), {
          variant: "error",
        });
      },
    },
  });

  return { equipment, remove };
}
