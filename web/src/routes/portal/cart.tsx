import { createFileRoute } from "@tanstack/react-router";
import { CartCheckoutView } from "../../ui/portal/CartCheckoutView";

export const Route = createFileRoute("/portal/cart")({
  component: CartCheckoutView,
});
