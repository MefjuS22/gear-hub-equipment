import { createFileRoute } from "@tanstack/react-router";
import { CustomersAdminView } from "../../ui/intranet/CustomersAdminView";

export const Route = createFileRoute("/intranet/customers")({
  component: CustomersAdminView,
});
