import { createFileRoute } from "@tanstack/react-router";
import { AppPermissions } from "../../lib/appPermissions";
import { requireStaffPermission } from "../../lib/intranetRouteGuards";
import { CustomersAdminView } from "../../ui/intranet/CustomersAdminView";

export const Route = createFileRoute("/intranet/customers")({
  beforeLoad: async ({ location }) => {
    await requireStaffPermission(
      location.pathname,
      AppPermissions.CustomersRead,
    );
  },
  component: CustomersAdminView,
});
