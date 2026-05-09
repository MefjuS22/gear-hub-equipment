import { resolveMediaSrc } from "./resolveMediaSrc";

/** Rewrites img[src] values so `/files/…` works when HTML is rendered on the portal host. */
export function resolveMediaInCmsHtml(html: string): string {
  if (!html || typeof document === "undefined") return html;
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  tpl.content.querySelectorAll("img[src]").forEach((img) => {
    const s = img.getAttribute("src");
    if (!s) return;
    const r = resolveMediaSrc(s);
    if (r) img.setAttribute("src", r);
  });
  return tpl.innerHTML;
}
