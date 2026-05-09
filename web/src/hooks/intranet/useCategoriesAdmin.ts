import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { gearhubApiClientOptions } from "../../api/clientOptions";
import {
  getApiCategoryQueryKey,
  getApiEquipmentQueryKey,
  useDeleteApiCategoryId,
  useGetApiCategory,
  usePostApiCategory,
  usePutApiCategoryId,
} from "../../api/generated/react-query";
import { formatApiErrorForDisplay, parseApiError } from "../../lib/apiError";

export function useCategoriesAdmin() {
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();

  const list = useGetApiCategory({ client: gearhubApiClientOptions });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: getApiCategoryQueryKey() });
    void qc.invalidateQueries({ queryKey: getApiEquipmentQueryKey() });
  };

  const create = usePostApiCategory({
    client: gearhubApiClientOptions,
    mutation: {
      onSuccess: () => {
        invalidate();
        enqueueSnackbar("Category created.", { variant: "success" });
      },
      onError: (e) => {
        enqueueSnackbar(formatApiErrorForDisplay(parseApiError(e)), {
          variant: "error",
        });
      },
    },
  });

  const update = usePutApiCategoryId({
    client: gearhubApiClientOptions,
    mutation: {
      onSuccess: () => {
        invalidate();
        enqueueSnackbar("Category updated.", { variant: "success" });
      },
      onError: (e) => {
        enqueueSnackbar(formatApiErrorForDisplay(parseApiError(e)), {
          variant: "error",
        });
      },
    },
  });

  const remove = useDeleteApiCategoryId({
    client: gearhubApiClientOptions,
    mutation: {
      onSuccess: () => {
        invalidate();
        enqueueSnackbar("Category removed.", { variant: "info" });
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
