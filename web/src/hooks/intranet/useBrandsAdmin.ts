import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { gearhubApiClientOptions } from "../../api/clientOptions";
import {
  getApiBrandQueryKey,
  getApiEquipmentQueryKey,
  useDeleteApiBrandId,
  useGetApiBrand,
  usePostApiBrand,
  usePutApiBrandId,
} from "../../api/generated/react-query";
import { formatApiErrorForDisplay, parseApiError } from "../../lib/apiError";

export function useBrandsAdmin() {
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();

  const list = useGetApiBrand({ client: gearhubApiClientOptions });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: getApiBrandQueryKey() });
    void qc.invalidateQueries({ queryKey: getApiEquipmentQueryKey() });
  };

  const create = usePostApiBrand({
    client: gearhubApiClientOptions,
    mutation: {
      onSuccess: () => {
        invalidate();
        enqueueSnackbar("Brand created.", { variant: "success" });
      },
      onError: (e) => {
        enqueueSnackbar(formatApiErrorForDisplay(parseApiError(e)), {
          variant: "error",
        });
      },
    },
  });

  const update = usePutApiBrandId({
    client: gearhubApiClientOptions,
    mutation: {
      onSuccess: () => {
        invalidate();
        enqueueSnackbar("Brand updated.", { variant: "success" });
      },
      onError: (e) => {
        enqueueSnackbar(formatApiErrorForDisplay(parseApiError(e)), {
          variant: "error",
        });
      },
    },
  });

  const remove = useDeleteApiBrandId({
    client: gearhubApiClientOptions,
    mutation: {
      onSuccess: () => {
        invalidate();
        enqueueSnackbar("Brand removed.", { variant: "info" });
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
