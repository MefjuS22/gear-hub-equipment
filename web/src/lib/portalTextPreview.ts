import {
  PORTAL_TEXT_DEFAULTS,
  type PortalTextKey,
  isPortalTextKey,
  normalizePortalTextHtmlForEditor,
  resolvePortalTextBodyHtml,
} from "./portalTextDefaults";
import { portalTextPlain } from "./portalTextHtml";

export type PortalTextPreviewPage = "catalog" | "cart" | "news" | "equipment";

export type PortalTextOverrides = Record<PortalTextKey, string>;

type SavedPortalText = {
  key?: string | null;
  bodyHtml?: string | null;
};

export function getPortalTextPreviewPage(key: string): PortalTextPreviewPage {
  if (key.startsWith("news.")) {
    return "news";
  }
  if (key.startsWith("cart.")) {
    return "cart";
  }
  if (key === "catalog.featured.fallback") {
    return "equipment";
  }
  return "catalog";
}

export function buildPortalTextOverrides(
  editedKey: string,
  editedBodyHtml: string,
  saved?: SavedPortalText[],
): PortalTextOverrides {
  const savedMap = new Map(
    (saved ?? []).filter((t) => t.key).map((t) => [t.key!, t.bodyHtml ?? null]),
  );

  if (isPortalTextKey(editedKey)) {
    savedMap.set(editedKey, normalizePortalTextHtmlForEditor(editedBodyHtml));
  }

  const overrides = {} as PortalTextOverrides;
  for (const key of Object.keys(PORTAL_TEXT_DEFAULTS) as PortalTextKey[]) {
    overrides[key] = resolvePortalTextBodyHtml(key, savedMap.get(key) ?? null);
  }

  return overrides;
}

export function getOverridePlain(
  overrides: PortalTextOverrides,
  key: PortalTextKey,
): string {
  return portalTextPlain(overrides[key]);
}

export function getOverrideHtml(
  overrides: PortalTextOverrides,
  key: PortalTextKey,
): string {
  return overrides[key];
}
