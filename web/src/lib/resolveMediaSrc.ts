import { gearhubApiClientOptions } from "../api/clientOptions";

/** Build a browser-usable image URL from a stored value (absolute URL or `/files/...`). */
export function resolveMediaSrc(url: string | null | undefined): string | undefined {
  const u = url?.trim();
  if (!u) return undefined;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  const base = (gearhubApiClientOptions.baseURL ?? "").replace(/\/$/, "");
  return `${base}${u.startsWith("/") ? u : `/${u}`}`;
}
