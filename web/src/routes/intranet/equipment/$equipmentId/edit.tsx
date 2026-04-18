import { createFileRoute } from "@tanstack/react-router";
import { EquipmentEditView } from "../../../../ui/intranet/EquipmentEditView";

export const Route = createFileRoute("/intranet/equipment/$equipmentId/edit")({
  component: EquipmentEditRoute,
});

function EquipmentEditRoute() {
  const { equipmentId } = Route.useParams();
  return <EquipmentEditView equipmentIdParam={equipmentId} />;
}
