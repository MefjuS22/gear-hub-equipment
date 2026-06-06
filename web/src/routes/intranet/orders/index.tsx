import {
  createFileRoute,
  type SearchSchemaInput,
} from "@tanstack/react-router";

import {
  type OrderListSearchInput,
  parseOrderListSearch,
} from "../../../lib/orderListSearch";
import { OrdersListView } from "../../../ui/intranet/OrdersListView";

export const Route = createFileRoute("/intranet/orders/")({
  validateSearch: (raw: OrderListSearchInput & SearchSchemaInput) =>
    parseOrderListSearch(raw),
  component: OrdersListView,
});
