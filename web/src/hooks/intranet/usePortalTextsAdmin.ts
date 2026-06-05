import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";

import { gearhubApiClientOptions } from "../../api/clientOptions";
import {
  getApiPortaltextKeyQueryKey,
  getApiPortaltextQueryKey,
  useGetApiPortaltext,
  useGetApiPortaltextKey,
  usePutApiPortaltextKey,
} from "../../api/generated/react-query";
import { formatApiErrorForDisplay, parseApiError } from "../../lib/apiError";
import { useListPagination, usePagedResult } from "../useListPagination";

function invalidatePortalTextQueries(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({
    predicate: (q) => {
      const k = q.queryKey[0];
      if (k == null || typeof k !== "object" || !("url" in k)) return false;
      const url = (k as { url: string }).url;
      return url === "/api/PortalText" || url.startsWith("/api/PortalText/");
    },
  });
}

export function usePortalTextsAdmin() {
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();

  const { page, setPage, pageSize, setPageSize, params } = useListPagination();
  const list = useGetApiPortaltext(params, { client: gearhubApiClientOptions });
  const paged = usePagedResult(list.data);

  const update = usePutApiPortaltextKey({
    client: gearhubApiClientOptions,
    mutation: {
      onSuccess: () => {
        invalidatePortalTextQueries(qc);
        enqueueSnackbar("Portal text updated.", { variant: "success" });
      },
      onError: (e) => {
        enqueueSnackbar(formatApiErrorForDisplay(parseApiError(e)), {
          variant: "error",
        });
      },
    },
  });

  return { list, update, page, setPage, pageSize, setPageSize, ...paged };
}

export function usePortalTextDetail(key: string) {
  return useGetApiPortaltextKey(key, {
    client: gearhubApiClientOptions,
    query: { enabled: Boolean(key) },
  });
}

export function invalidatePortalTextDetail(
  qc: ReturnType<typeof useQueryClient>,
  key: string,
) {
  void qc.invalidateQueries({ queryKey: getApiPortaltextQueryKey() });
  void qc.invalidateQueries({ queryKey: getApiPortaltextKeyQueryKey(key) });
}
