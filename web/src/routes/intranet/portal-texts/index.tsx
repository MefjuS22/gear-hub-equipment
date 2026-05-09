import { createFileRoute } from "@tanstack/react-router";
import { PortalTextsListView } from "../../../ui/intranet/PortalTextsListView";

export const Route = createFileRoute("/intranet/portal-texts/")({
  component: PortalTextsListView,
});
