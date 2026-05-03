import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { gearhubApiClientOptions } from "../../api/clientOptions";
import {
  useDeleteApiCmspostId,
  useGetApiCmspost,
  usePostApiCmspost,
  usePutApiCmspostId,
} from "../../api/generated/react-query";
import { formatApiErrorForDisplay, parseApiError } from "../../lib/apiError";

function invalidateAllCmsQueries(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({
    predicate: (q) => {
      const k = q.queryKey[0];
      if (k == null || typeof k !== "object" || !("url" in k)) return false;
      const url = (k as { url: string }).url;
      return url === "/api/CmsPost" || url.startsWith("/api/CmsPost/");
    },
  });
}

export function useCmsPostsAdmin() {
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();

  const list = useGetApiCmspost({ client: gearhubApiClientOptions });

  const create = usePostApiCmspost({
    client: gearhubApiClientOptions,
    mutation: {
      onSuccess: () => {
        invalidateAllCmsQueries(qc);
        enqueueSnackbar("Post created.", { variant: "success" });
      },
      onError: (e) => {
        enqueueSnackbar(formatApiErrorForDisplay(parseApiError(e)), {
          variant: "error",
        });
      },
    },
  });

  const update = usePutApiCmspostId({
    client: gearhubApiClientOptions,
    mutation: {
      onSuccess: () => {
        invalidateAllCmsQueries(qc);
        enqueueSnackbar("Post updated.", { variant: "success" });
      },
      onError: (e) => {
        enqueueSnackbar(formatApiErrorForDisplay(parseApiError(e)), {
          variant: "error",
        });
      },
    },
  });

  const remove = useDeleteApiCmspostId({
    client: gearhubApiClientOptions,
    mutation: {
      onSuccess: () => {
        invalidateAllCmsQueries(qc);
        enqueueSnackbar("Post deleted.", { variant: "info" });
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
