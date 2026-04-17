import { createFileRoute } from "@tanstack/react-router";
import { PortalTextsAdminView } from "../../ui/intranet/PortalTextsAdminView";

export const Route = createFileRoute("/intranet/portal-texts")({
  component: PortalTextsAdminView,
});
