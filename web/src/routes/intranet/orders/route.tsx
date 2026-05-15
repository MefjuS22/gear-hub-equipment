import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppPermissions } from "../../../lib/appPermissions";
import { requireStaffPermission } from "../../../lib/intranetRouteGuards";

export const Route = createFileRoute("/intranet/orders")({
  beforeLoad: async ({ location }) => {
    await requireStaffPermission(location.pathname, AppPermissions.OrdersRead);
  },
  component: OrdersSectionLayout,
});

function OrdersSectionLayout() {
  return <Outlet />;
}
