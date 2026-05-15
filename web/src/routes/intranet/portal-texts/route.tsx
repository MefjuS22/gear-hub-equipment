import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppPermissions } from "../../../lib/appPermissions";
import { requireStaffPermission } from "../../../lib/intranetRouteGuards";

export const Route = createFileRoute("/intranet/portal-texts")({
  beforeLoad: async ({ location }) => {
    await requireStaffPermission(location.pathname, AppPermissions.CmsManage);
  },
  component: PortalTextsSectionLayout,
});

function PortalTextsSectionLayout() {
  return <Outlet />;
}
