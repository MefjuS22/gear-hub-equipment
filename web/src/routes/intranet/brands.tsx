import { createFileRoute } from "@tanstack/react-router";
import { BrandsAdminView } from "../../ui/intranet/BrandsAdminView";

export const Route = createFileRoute("/intranet/brands")({
  component: BrandsAdminView,
});
