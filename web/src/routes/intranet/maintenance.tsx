import { createFileRoute } from "@tanstack/react-router";
import { MaintenanceAdminView } from "../../ui/intranet/MaintenanceAdminView";

export const Route = createFileRoute("/intranet/maintenance")({
  component: MaintenanceAdminView,
});
