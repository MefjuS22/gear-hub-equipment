import { Typography } from "@mui/material";
import { Wrench } from "lucide-react";
import { EmptyState } from "../common";

export function MaintenanceAdminView() {
  return (
    <div>
      <Typography
        variant="h5"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 600 }}
      >
        Maintenance
      </Typography>
      <EmptyState
        title="Coming soon"
        description="Maintenance scheduling will be available here."
        icon={Wrench}
      />
    </div>
  );
}
