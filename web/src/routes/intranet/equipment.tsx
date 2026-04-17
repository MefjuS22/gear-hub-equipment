import { createFileRoute } from "@tanstack/react-router";
import { EquipmentAdminView } from "../../ui/intranet/EquipmentAdminView";

export const Route = createFileRoute("/intranet/equipment")({
  component: EquipmentAdminView,
});
