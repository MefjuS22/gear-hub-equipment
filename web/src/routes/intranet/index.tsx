import { createFileRoute } from "@tanstack/react-router";
import { DashboardView } from "../../ui/intranet/DashboardView";

export const Route = createFileRoute("/intranet/")({
  component: DashboardView,
});
