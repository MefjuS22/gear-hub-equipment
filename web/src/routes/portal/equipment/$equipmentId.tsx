import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

import { PortalEquipmentDetailView } from "../../../ui/portal/PortalEquipmentDetailView";

const paramsSchema = z.object({
  equipmentId: z.string().regex(/^\d+$/),
});

export const Route = createFileRoute("/portal/equipment/$equipmentId")({
  params: {
    parse: (raw) => paramsSchema.parse(raw),
  },
  component: PortalEquipmentDetailRoute,
});

function PortalEquipmentDetailRoute() {
  const { equipmentId } = Route.useParams();
  const id = Number(equipmentId);
  if (!Number.isFinite(id) || id < 1) {
    throw notFound();
  }
  return <PortalEquipmentDetailView equipmentId={id} />;
}
