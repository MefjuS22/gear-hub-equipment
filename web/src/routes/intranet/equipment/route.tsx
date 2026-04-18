import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/intranet/equipment")({
  component: EquipmentSectionLayout,
});

function EquipmentSectionLayout() {
  return <Outlet />;
}
