import { Link } from "@tanstack/react-router";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { Boxes, Building2, LogIn, Store } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "../../providers/AuthProvider";

const shellMaxWidth = 1200;

export function HomeLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        bgcolor: "background.default",
      }}
    >
      <AppBar
        position="static"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          flexShrink: 0,
        }}
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
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              justifyContent: "flex-end",
            }}
          >
            {!isAuthenticated ? (
              <Button
                component={Link}
                to="/login"
                variant="outlined"
                color="inherit"
                size="small"
                startIcon={<LogIn size={18} aria-hidden />}
              >
                Sign in
              </Button>
            ) : null}
            <Button
              component={Link}
              to="/portal"
              color="primary"
              variant="contained"
              size="small"
              startIcon={<Store size={18} aria-hidden />}
            >
              Client portal
            </Button>
            <Button
              component={Link}
              to="/intranet"
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<Building2 size={18} aria-hidden />}
            >
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
