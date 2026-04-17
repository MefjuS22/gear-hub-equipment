import { Link } from "@tanstack/react-router";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { Boxes, Building2, Store } from "lucide-react";
import type { ReactNode } from "react";

const shellMaxWidth = 1200;

/**
 * Marketing / landing shell: own top bar and full-height column. Used only under `/`.
 */
export function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, bgcolor: "background.default" }}>
      <AppBar
        position="static"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper", flexShrink: 0 }}
      >
        <Toolbar
          sx={{
            maxWidth: shellMaxWidth,
            width: "100%",
            mx: "auto",
            px: { xs: 2, sm: 3 },
            justifyContent: "space-between",
            gap: 2,
            minHeight: 56,
          }}
        >
          <Typography
            component={Link}
            to="/"
            variant="h6"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.02em",
              textDecoration: "none",
              color: "text.primary",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Boxes size={22} strokeWidth={1.75} aria-hidden />
            GearHub
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "flex-end" }}>
            <Button component={Link} to="/portal" color="primary" variant="contained" size="small" startIcon={<Store size={18} aria-hidden />}>
              Client portal
            </Button>
            <Button component={Link} to="/intranet" variant="outlined" color="inherit" size="small" startIcon={<Building2 size={18} aria-hidden />}>
              Staff
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          width: "100%",
          maxWidth: shellMaxWidth,
          mx: "auto",
          boxSizing: "border-box",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
