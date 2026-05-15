import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { gearhubApiClientOptions } from "../../api/clientOptions";
import {
  getApiAuthMeQueryKey,
  getApiUsersQueryKey,
  useDeleteApiUsersId,
  useGetApiUsers,
  usePostApiUsers,
  usePutApiUsersIdRoles,
} from "../../api/generated/react-query";
import { formatApiErrorForDisplay, parseApiError } from "../../lib/apiError";
import { useAuth } from "../../providers/AuthProvider";

export function useUsersAdmin() {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const list = useGetApiUsers({ client: gearhubApiClientOptions });

  const invalidateListAndMaybeMe = (affectedUserId?: number) => {
    void queryClient.invalidateQueries({ queryKey: getApiUsersQueryKey() });
    if (affectedUserId != null && affectedUserId === user?.id) {
      void queryClient.invalidateQueries({ queryKey: getApiAuthMeQueryKey() });
    }
  };

  const create = usePostApiUsers({
    client: gearhubApiClientOptions,
    mutation: {
      onSuccess: () => {
        invalidateListAndMaybeMe();
        enqueueSnackbar("User created.", { variant: "success" });
      },
      onError: (e) => {
        enqueueSnackbar(formatApiErrorForDisplay(parseApiError(e)), {
          variant: "error",
        });
      },
    },
  });

  const setRoles = usePutApiUsersIdRoles({
    client: gearhubApiClientOptions,
    mutation: {
      onSuccess: (_, vars) => {
        invalidateListAndMaybeMe(vars.id);
        enqueueSnackbar("Roles updated.", { variant: "success" });
      },
      onError: (e) => {
        enqueueSnackbar(formatApiErrorForDisplay(parseApiError(e)), {
          variant: "error",
        });
      },
    },
  });

  const remove = useDeleteApiUsersId({
    client: gearhubApiClientOptions,
    mutation: {
      onSuccess: () => {
        invalidateListAndMaybeMe();
        enqueueSnackbar("User removed.", { variant: "info" });
      },
      onError: (e) => {
        enqueueSnackbar(formatApiErrorForDisplay(parseApiError(e)), {
          variant: "error",
        });
      },
    },
  });

  return { list, create, setRoles, remove };
}
