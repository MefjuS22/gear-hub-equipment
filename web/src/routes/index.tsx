import { createFileRoute, Link } from "@tanstack/react-router";
import { Box, Link as MuiLink, Typography } from "@mui/material";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <Box sx={{ p: 4, maxWidth: 720 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: "primary.main" }}>
        GearHub
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Choose an app:
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 3 }}>
        <li>
          <MuiLink component={Link} to="/portal">
            Customer portal
          </MuiLink>
          {" — catalog and rental orders"}
        </li>
        <li>
          <MuiLink component={Link} to="/intranet">
            Intranet
          </MuiLink>
          {" — staff tools"}
        </li>
      </Box>
    </Box>
  );
}
