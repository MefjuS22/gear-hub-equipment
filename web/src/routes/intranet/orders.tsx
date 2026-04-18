import { createFileRoute } from "@tanstack/react-router";
import { OrdersListView } from "../../ui/intranet/OrdersListView";

export const Route = createFileRoute("/intranet/orders")({
  component: OrdersListView,
});
