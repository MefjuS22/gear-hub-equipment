import { createFileRoute } from "@tanstack/react-router";
import { AppPermissions } from "../../lib/appPermissions";
import { requireStaffPermission } from "../../lib/intranetRouteGuards";
import { BrandsAdminView } from "../../ui/intranet/BrandsAdminView";

export const Route = createFileRoute("/intranet/brands")({
  beforeLoad: async ({ location }) => {
    await requireStaffPermission(
      location.pathname,
      AppPermissions.BrandsManage,
    );
  },
  component: BrandsAdminView,
});
