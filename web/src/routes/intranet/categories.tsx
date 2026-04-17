import { createFileRoute } from "@tanstack/react-router";
import { CategoriesAdminView } from "../../ui/intranet/CategoriesAdminView";

export const Route = createFileRoute("/intranet/categories")({
  component: CategoriesAdminView,
});
