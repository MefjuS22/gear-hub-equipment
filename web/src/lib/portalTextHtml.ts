import { resolveMediaInCmsHtml } from "./resolveMediaInCmsHtml";
import { sanitizeCmsHtml } from "./sanitizeCmsHtml";

export function portalTextPlain(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function portalTextSafeHtml(html: string): string {
  return sanitizeCmsHtml(resolveMediaInCmsHtml(html));
}
