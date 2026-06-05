import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { PortalStaticTextEditorView } from "../../../../ui/intranet/PortalStaticTextEditorView";

const searchSchema = z.object({
  key: z.string().min(1),
});

export const Route = createFileRoute("/intranet/portal-texts/static/edit")({
  validateSearch: (raw) => searchSchema.parse(raw),
  component: PortalStaticTextEditPage,
});

function PortalStaticTextEditPage() {
  const { key } = Route.useSearch();
  return <PortalStaticTextEditorView textKey={key} />;
}
