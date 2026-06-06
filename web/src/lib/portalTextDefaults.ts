import { portalTextPlain } from "./portalTextHtml";

/** Fallback copy when portal texts API is unavailable or a block is empty. */
export const PORTAL_TEXT_DEFAULTS = {
  "catalog.hero.title": "Equipment catalog",
  "catalog.hero.subtitle":
    "Browse rental equipment. Filter by category or search by name or brand.",
  "catalog.featured.fallback":
    "<p>Available for rent at a daily rate. Add to your cart to reserve dates.</p>",
  "cart.empty.title": "Your cart is empty",
  "cart.empty.body":
    "Browse the catalog and add equipment to start a rental order.",
  "news.list.title": "News",
  "news.list.subtitle": "Updates, tips, and announcements from our team.",
} as const;

export type PortalTextKey = keyof typeof PORTAL_TEXT_DEFAULTS;

export function isPortalTextKey(key: string): key is PortalTextKey {
  return key in PORTAL_TEXT_DEFAULTS;
}

export function normalizePortalTextHtmlForEditor(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) {
    return "";
  }
  if (!/<[a-z][\s\S]*>/i.test(trimmed)) {
    return `<p>${trimmed}</p>`;
  }
  return trimmed;
}

export function resolvePortalTextBodyHtml(
  key: string,
  raw?: string | null,
): string {
  const trimmed = raw?.trim() ?? "";
  if (trimmed) {
    return normalizePortalTextHtmlForEditor(trimmed);
  }
  if (isPortalTextKey(key)) {
    return normalizePortalTextHtmlForEditor(PORTAL_TEXT_DEFAULTS[key]);
  }
  return "";
}

export function resolvePortalTextPlainForEditor(
  key: string,
  raw?: string | null,
): string {
  return portalTextPlain(resolvePortalTextBodyHtml(key, raw));
}

export function portalTextPlainToBodyHtml(plain: string): string {
  return normalizePortalTextHtmlForEditor(plain);
}
