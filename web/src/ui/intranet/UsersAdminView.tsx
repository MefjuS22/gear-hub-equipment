import { Typography } from "@mui/material";

export function UsersAdminView() {
  return (
    <div>
      <Typography
        variant="h5"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 600 }}
      >
        Users
      </Typography>
      <Typography color="text.secondary">
        This screen needs user endpoints in the API — they are missing from the
        generated OpenAPI. Extend the backend (e.g. GET/POST /api/User), then
        run <code>npm run api:generate</code> again.
      </Typography>
    </div>
  );
}
