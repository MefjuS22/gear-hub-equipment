import type { CmsPostDetailDto } from "../api/generated/types";
import type { CmsPostFormValues } from "./formSchemas";

export const CMS_POST_FORM_DEFAULTS: CmsPostFormValues = {
  slug: "",
  title: "",
  excerpt: "",
  coverImageUrl: "",
  bodyHtml: "<p></p>",
  isPublished: false,
};

export function cmsPostDetailToFormValues(d: CmsPostDetailDto): CmsPostFormValues {
  return {
    slug: d.slug ?? "",
    title: d.title ?? "",
    excerpt: d.excerpt ?? "",
    coverImageUrl: d.coverImageUrl ?? "",
    bodyHtml:
      d.bodyHtml && d.bodyHtml.trim().length > 0 ? d.bodyHtml : "<p></p>",
    isPublished: d.isPublished ?? false,
  };
}
