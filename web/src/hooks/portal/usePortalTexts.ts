import { useMemo } from "react";

import { gearhubApiClientOptions } from "../../api/clientOptions";
import { useGetApiPortaltextPublic } from "../../api/generated/react-query";
import {
  resolvePortalTextBodyHtml,
  type PortalTextKey,
} from "../../lib/portalTextDefaults";
import { portalTextPlain } from "../../lib/portalTextHtml";
import { buildPageParams, LOOKUP_PAGE_SIZE, getPagedItems } from "../../lib/pagination";

const portalTextParams = buildPageParams(0, LOOKUP_PAGE_SIZE);

export function usePortalTexts() {
  const query = useGetApiPortaltextPublic(portalTextParams, {
    client: gearhubApiClientOptions,
    query: {
      staleTime: 60_000,
    },
  });

  const map = useMemo(() => {
    const entries = new Map<string, string>();
    for (const item of getPagedItems(query.data)) {
      if (item.key) {
        entries.set(item.key, item.bodyHtml ?? "");
      }
    }
    return entries;
  }, [query.data]);

  const getHtml = (key: PortalTextKey): string =>
    resolvePortalTextBodyHtml(key, map.get(key));

  const getPlain = (key: PortalTextKey): string =>
    portalTextPlain(getHtml(key));

  return { query, getHtml, getPlain };
}
