import { createFileRoute } from "@tanstack/react-router";
import { AppPermissions } from "../../lib/appPermissions";
import { requireStaffPermission } from "../../lib/intranetRouteGuards";
import { OrdersListView } from "../../ui/intranet/OrdersListView";

export const Route = createFileRoute("/intranet/orders")({
  beforeLoad: async ({ location }) => {
    await requireStaffPermission(location.pathname, AppPermissions.OrdersRead);
  },
  component: OrdersListView,
});
