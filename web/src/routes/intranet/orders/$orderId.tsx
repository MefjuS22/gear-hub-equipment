import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { OrderDetailView } from "../../../ui/intranet/OrderDetailView";

const paramsSchema = z.object({
  orderId: z.string().regex(/^\d+$/),
});

export const Route = createFileRoute("/intranet/orders/$orderId")({
  params: {
    parse: (raw) => paramsSchema.parse(raw),
  },
  component: IntranetOrderDetailRoute,
});

function IntranetOrderDetailRoute() {
  const { orderId } = Route.useParams();
  const id = Number(orderId);
  if (id < 1) {
    throw notFound();
  }
  return <OrderDetailView orderId={id} />;
}
