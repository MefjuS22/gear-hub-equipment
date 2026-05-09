import { createFileRoute } from "@tanstack/react-router";
import { CmsPostEditorView } from "../../../ui/intranet/CmsPostEditorView";

export const Route = createFileRoute("/intranet/portal-texts/new")({
  component: NewCmsPostPage,
});

function NewCmsPostPage() {
  return <CmsPostEditorView mode="create" />;
}
