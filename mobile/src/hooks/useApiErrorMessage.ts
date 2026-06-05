import { useMemo } from "react";

import { getApiErrorDisplayMessage } from "../lib/apiError";

export function useApiErrorMessage(error: unknown): string | null {
  return useMemo(() => {
    if (!error) {
      return null;
    }
    return getApiErrorDisplayMessage(error);
  }, [error]);
}
