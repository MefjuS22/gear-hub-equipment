import { createFileRoute } from "@tanstack/react-router";
import { AppPermissions } from "../../../lib/appPermissions";
import { requireStaffPermission } from "../../../lib/intranetRouteGuards";
import { EquipmentAdminView } from "../../../ui/intranet/EquipmentAdminView";

export const Route = createFileRoute("/intranet/equipment/")({
  beforeLoad: async ({ location }) => {
    await requireStaffPermission(
      location.pathname,
      AppPermissions.EquipmentRead,
    );
  },
  component: EquipmentAdminView,
});
