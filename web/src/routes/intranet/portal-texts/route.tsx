import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/intranet/portal-texts")({
  component: PortalTextsSectionLayout,
});

function PortalTextsSectionLayout() {
  return <Outlet />;
}
