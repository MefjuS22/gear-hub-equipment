import { Typography } from "@mui/material";
import { UserCog } from "lucide-react";
import { EmptyState } from "../common";

export function UsersAdminView() {
  return (
    <div>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Users
      </Typography>
      <EmptyState title="Coming soon" description="Staff accounts and roles will be manageable here." icon={UserCog} />
    </div>
  );
}
