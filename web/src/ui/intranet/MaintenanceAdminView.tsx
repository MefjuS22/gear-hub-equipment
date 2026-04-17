import { Typography } from "@mui/material";

export function MaintenanceAdminView() {
  return (
    <div>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Maintenance
      </Typography>
      <Typography color="text.secondary">
        No maintenance endpoints in the current OpenAPI. After adding them on the backend, run{" "}
        <code>npm run api:generate</code>.
      </Typography>
    </div>
  );
}
