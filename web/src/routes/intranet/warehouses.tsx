import { createFileRoute } from "@tanstack/react-router";
import { AppPermissions } from "../../lib/appPermissions";
import { requireStaffPermission } from "../../lib/intranetRouteGuards";
import { WarehousesAdminView } from "../../ui/intranet/WarehousesAdminView";

export const Route = createFileRoute("/intranet/warehouses")({
  beforeLoad: async ({ location }) => {
    await requireStaffPermission(
      location.pathname,
      AppPermissions.WarehousesManage,
    );
  },
  component: WarehousesAdminView,
});
