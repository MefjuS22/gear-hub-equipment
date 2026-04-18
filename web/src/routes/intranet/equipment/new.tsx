import { createFileRoute } from "@tanstack/react-router";
import { EquipmentCreateView } from "../../../ui/intranet/EquipmentCreateView";

export const Route = createFileRoute("/intranet/equipment/new")({
  component: EquipmentCreateView,
});
