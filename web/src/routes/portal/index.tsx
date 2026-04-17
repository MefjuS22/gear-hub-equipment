import { createFileRoute } from "@tanstack/react-router";
import { PortalCatalogView } from "../../ui/portal/PortalCatalogView";

export const Route = createFileRoute("/portal/")({
  component: PortalCatalogView,
});
