import { createFileRoute } from "@tanstack/react-router";
import { PortalNewsListView } from "../../../ui/portal/PortalNewsListView";

export const Route = createFileRoute("/portal/news/")({
  component: PortalNewsListView,
});
