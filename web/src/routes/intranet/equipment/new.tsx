import { createFileRoute } from "@tanstack/react-router";
import { AppPermissions } from "../../../lib/appPermissions";
import { requireStaffPermission } from "../../../lib/intranetRouteGuards";
import { EquipmentCreateView } from "../../../ui/intranet/EquipmentCreateView";

export const Route = createFileRoute("/intranet/equipment/new")({
  beforeLoad: async ({ location }) => {
    await requireStaffPermission(
      location.pathname,
      AppPermissions.EquipmentManage,
    );
  },
  component: EquipmentCreateView,
});
