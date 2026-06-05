import { createFileRoute } from "@tanstack/react-router";
import { PortalStaticTextsListView } from "../../../../ui/intranet/PortalStaticTextsListView";

export const Route = createFileRoute("/intranet/portal-texts/static/")({
  component: PortalStaticTextsListView,
});
