import { createFileRoute } from "@tanstack/react-router";
import { UsersAdminView } from "../../ui/intranet/UsersAdminView";

export const Route = createFileRoute("/intranet/users")({
  component: UsersAdminView,
});
