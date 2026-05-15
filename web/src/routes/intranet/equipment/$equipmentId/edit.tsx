import { createFileRoute } from "@tanstack/react-router";
import { AppPermissions } from "../../../../lib/appPermissions";
import { requireStaffPermission } from "../../../../lib/intranetRouteGuards";
import { EquipmentEditView } from "../../../../ui/intranet/EquipmentEditView";

export const Route = createFileRoute("/intranet/equipment/$equipmentId/edit")({
  beforeLoad: async ({ location }) => {
    await requireStaffPermission(
      location.pathname,
      AppPermissions.EquipmentManage,
    );
  },
  component: EquipmentEditRoute,
});

function EquipmentEditRoute() {
  const { equipmentId } = Route.useParams();
  return <EquipmentEditView equipmentIdParam={equipmentId} />;
}
