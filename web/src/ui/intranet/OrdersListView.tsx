import { Typography } from "@mui/material";
import { ClipboardList } from "lucide-react";
import { EmptyState } from "../common";

export function OrdersListView() {
  return (
    <div>
      <Typography
        variant="h5"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 600 }}
      >
        Orders
      </Typography>
      <EmptyState
        title="Coming soon"
        description="Order history and management will be available here."
        icon={ClipboardList}
      />
    </div>
  );
}
