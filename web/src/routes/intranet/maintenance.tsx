import { createFileRoute } from "@tanstack/react-router";
import { AppPermissions } from "../../lib/appPermissions";
import { requireStaffPermission } from "../../lib/intranetRouteGuards";
import { MaintenanceAdminView } from "../../ui/intranet/MaintenanceAdminView";

export const Route = createFileRoute("/intranet/maintenance")({
  beforeLoad: async ({ location }) => {
    await requireStaffPermission(
      location.pathname,
      AppPermissions.EquipmentRead,
    );
  },
  component: MaintenanceAdminView,
});
