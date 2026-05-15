import { createFileRoute } from "@tanstack/react-router";
import { AppPermissions } from "../../lib/appPermissions";
import { requireStaffPermission } from "../../lib/intranetRouteGuards";
import { UsersAdminView } from "../../ui/intranet/UsersAdminView";

export const Route = createFileRoute("/intranet/users")({
  beforeLoad: async ({ location }) => {
    await requireStaffPermission(
      location.pathname,
      AppPermissions.UsersManage,
    );
  },
  component: UsersAdminView,
});
