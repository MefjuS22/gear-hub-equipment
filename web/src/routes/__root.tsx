import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { Boxes, Building2, Home, Store } from "lucide-react";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <AppBar
        position="static"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.default" }}
      >
        <Toolbar variant="dense" sx={{ gap: 0.5, minHeight: 48 }}>
          <Typography component="span" variant="subtitle1" sx={{ fontWeight: 700, mr: 1, display: "flex", alignItems: "center", gap: 0.75 }}>
            <Boxes size={20} strokeWidth={1.75} aria-hidden />
            GearHub
          </Typography>
          <Button component={Link} to="/" color="inherit" size="small" startIcon={<Home size={18} aria-hidden />}>
            Home
          </Button>
          <Button component={Link} to="/portal" color="inherit" size="small" startIcon={<Store size={18} aria-hidden />}>
            Portal
          </Button>
          <Button component={Link} to="/intranet" color="inherit" size="small" startIcon={<Building2 size={18} aria-hidden />}>
            Intranet
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}
      >
        <Outlet />
      </Box>
    </>
  );
}
