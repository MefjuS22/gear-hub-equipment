import { createFileRoute } from "@tanstack/react-router";
import { AppPermissions } from "../../lib/appPermissions";
import { requireStaffPermission } from "../../lib/intranetRouteGuards";
import { CategoriesAdminView } from "../../ui/intranet/CategoriesAdminView";

export const Route = createFileRoute("/intranet/categories")({
  beforeLoad: async ({ location }) => {
    await requireStaffPermission(
      location.pathname,
      AppPermissions.CategoriesManage,
    );
  },
  component: CategoriesAdminView,
});
