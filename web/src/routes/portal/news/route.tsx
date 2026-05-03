import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/portal/news")({
  component: PortalNewsLayout,
});

function PortalNewsLayout() {
  return <Outlet />;
}
