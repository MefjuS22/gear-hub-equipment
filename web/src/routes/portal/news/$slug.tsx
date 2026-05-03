import { createFileRoute } from "@tanstack/react-router";
import { PortalNewsPostView } from "../../../ui/portal/PortalNewsPostView";

export const Route = createFileRoute("/portal/news/$slug")({
  component: PortalNewsPostRoute,
});

function PortalNewsPostRoute() {
  const { slug } = Route.useParams();
  return <PortalNewsPostView slug={slug} />;
}
