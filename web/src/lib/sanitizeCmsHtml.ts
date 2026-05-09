import DOMPurify, { type Config } from "dompurify";

const config: Config = {
  ALLOWED_TAGS: [
    "a",
    "b",
    "blockquote",
    "br",
    "code",
    "div",
    "em",
    "h1",
    "h2",
    "h3",
    "h4",
    "hr",
    "i",
    "img",
    "li",
    "ol",
    "p",
    "pre",
    "s",
    "span",
    "strong",
    "sub",
    "sup",
    "u",
    "ul",
  ],
  ALLOWED_ATTR: [
    "href",
    "target",
    "rel",
    "class",
    "src",
    "alt",
    "title",
    "width",
    "height",
    "loading",
    "decoding",
  ],
  ALLOW_DATA_ATTR: false,
};

export function sanitizeCmsHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty ?? "", config) as unknown as string;
}
