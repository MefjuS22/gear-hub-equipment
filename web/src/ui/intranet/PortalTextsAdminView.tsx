import { Typography } from "@mui/material";

export function PortalTextsAdminView() {
  return (
    <div>
      <Typography
        variant="h5"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 600 }}
      >
        Portal content (CMS)
      </Typography>
      <Typography color="text.secondary">
        No portal content endpoints in the generated client. The portal hero is
        static until the server exposes a suitable API.
      </Typography>
    </div>
  );
}
