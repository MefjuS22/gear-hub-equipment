import { env } from "../config/env";

/** Join API base URL with a path such as `/files/equipment/….png`. */
export function resolvePublicFileUrl(publicPath: string, baseUrl: string = env.apiUrl): string {
  if (!publicPath?.trim()) {
    return "";
  }
  if (publicPath.startsWith("http://") || publicPath.startsWith("https://")) {
    return publicPath;
  }
  const base = baseUrl.replace(/\/$/, "");
  const path = publicPath.startsWith("/") ? publicPath : `/${publicPath}`;
  return `${base}${path}`;
}
