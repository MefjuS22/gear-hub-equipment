import { createFileRoute } from "@tanstack/react-router";
import { WarehousesAdminView } from "../../ui/intranet/WarehousesAdminView";

export const Route = createFileRoute("/intranet/warehouses")({
  component: WarehousesAdminView,
});
