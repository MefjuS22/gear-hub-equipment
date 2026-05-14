import { env } from "../config/env";

/** Join API base URL with a path such as `/files/equipment/….png`. */
export function resolvePublicFileUrl(publicPath: string, baseUrl: string = env.apiUrl): string {
  if (!publicPath?.trim()) {
    return "";
  }
  let path = publicPath.trim();

  if (/^about:/i.test(path)) {
    path = path.replace(/^about:\/+/i, "/");
    if (!path.startsWith("/")) {
      path = `/${path}`;
    }
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("//")) {
    return `https:${path}`;
  }

  const base = baseUrl.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

/**
 * Rewrites `<img src="…">` in CMS HTML so every `src` is an absolute http(s) URL.
 * Required for `react-native-render-html` / `RCTImageLoader`, which do not load `about:` or bare `/files/…` URIs.
 */
export function rewriteCmsBodyHtmlForNative(html: string, baseUrl: string = env.apiUrl): string {
  if (!html?.trim()) {
    return html;
  }

  return html.replace(
    /<img\b([^>]*?)\bsrc\s*=\s*(["'])([^"']*)\2/gi,
    (_full, beforeClose: string, quote: string, rawSrc: string) => {
      const uri = resolvePublicFileUrl(rawSrc.trim(), baseUrl);
      if (!uri) {
        return `<img${beforeClose}src=${quote}${quote}`;
      }
      return `<img${beforeClose}src=${quote}${uri}${quote}`;
    },
  );
}
