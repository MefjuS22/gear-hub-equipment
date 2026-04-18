import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import {
  Avatar,
  Badge,
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { Bell, Search, Settings, ShoppingCart } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { CartProvider, useCart } from "../../ui/portal/cartContext";
import {
  PortalCatalogSearchProvider,
  usePortalCatalogSearch,
} from "../../ui/portal/PortalCatalogSearchContext";

export const Route = createFileRoute("/portal")({
  component: PortalLayout,
});

function normalizePath(path: string) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

function NavTab({ to, children }: { to: string; children: ReactNode }) {
  const pathname = useRouterState({
    select: (s) => normalizePath(s.location.pathname),
  });
  const active = pathname === normalizePath(to);
  return (
    <Button
      component={Link}
      to={to}
      color="inherit"
      sx={{
        fontWeight: 700,
        textTransform: "none",
        borderRadius: 0,
        px: 1.5,
        py: 0.75,
        borderBottom: 2,
        borderColor: active ? "primary.main" : "transparent",
        color: active ? "primary.main" : "text.secondary",
        "&:hover": {
          bgcolor: "action.hover",
          borderColor: active ? "primary.main" : "transparent",
        },
      }}
    >
      {children}
    </Button>
  );
}

function PortalTopBar() {
  const pathname = useRouterState({
    select: (s) => normalizePath(s.location.pathname),
  });
  const { lines } = useCart();
  const { search, setSearch } = usePortalCatalogSearch();

  const cartCount = useMemo(
    () => lines.reduce((n, l) => n + l.quantity, 0),
    [lines],
  );
  const isCatalog = pathname === "/portal";

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <Toolbar
        sx={{
          maxWidth: 1200,
          width: "100%",
          mx: "auto",
          gap: 1,
          flexWrap: "nowrap",
          py: 1.5,
          minHeight: 64,
          alignItems: "center",
        }}
      >
        <Typography
          component={Link}
          to="/"
          variant="h6"
          sx={{
            fontWeight: 800,
            letterSpacing: "-0.02em",
            mr: 1,
            flexShrink: 0,
            textDecoration: "none",
            color: "text.primary",
            "&:hover": { color: "primary.main" },
          }}
        >
          GearHub
        </Typography>

        <Box sx={{ display: "flex", alignItems: "stretch", flexShrink: 0 }}>
          <NavTab to="/portal">Catalog</NavTab>
          <NavTab to="/portal/cart">Cart</NavTab>
        </Box>

        {/* Reserve the same center slot on catalog + cart (sm+) so the right cluster does not jump */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            maxWidth: 420,
            mx: { xs: 0, sm: 2 },
            display: { xs: "none", sm: "flex" },
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {isCatalog ? (
            <TextField
              placeholder="Search catalog…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} aria-hidden />
                    </InputAdornment>
                  ),
                },
              }}
            />
          ) : (
            <Box sx={{ width: "100%", height: 40 }} aria-hidden />
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            flexShrink: 0,
            ml: { xs: "auto", sm: 0 },
          }}
        >
          <Tooltip title="Notifications (coming soon)">
            <span>
              <IconButton
                size="small"
                color="inherit"
                disabled
                aria-label="Notifications"
              >
                <Bell size={20} aria-hidden />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Settings (coming soon)">
            <span>
              <IconButton
                size="small"
                color="inherit"
                disabled
                aria-label="Settings"
              >
                <Settings size={20} aria-hidden />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Account">
            <IconButton size="small" color="inherit" aria-label="Account menu">
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: "0.85rem",
                  bgcolor: "grey.300",
                  color: "text.primary",
                }}
              >
                GH
              </Avatar>
            </IconButton>
          </Tooltip>
          <Badge
            badgeContent={cartCount}
            color="primary"
            invisible={cartCount === 0}
          >
            <Button
              component={Link}
              to="/portal/cart"
              variant="contained"
              color="primary"
              size="small"
              startIcon={<ShoppingCart size={18} aria-hidden />}
              sx={{ fontWeight: 600 }}
            >
              Cart
            </Button>
          </Badge>
        </Box>
      </Toolbar>
      {/* Same vertical space on xs whether on catalog or cart — avoids header height jump */}
      <Box
        sx={{
          display: { xs: "block", sm: "none" },
          px: 2,
          pb: 2,
          minHeight: 56,
        }}
      >
        {isCatalog ? (
          <TextField
            placeholder="Search catalog…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} aria-hidden />
                  </InputAdornment>
                ),
              },
            }}
          />
        ) : (
          <Box sx={{ height: 40 }} aria-hidden />
        )}
      </Box>
    </Box>
  );
}

function PortalLayoutInner() {
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
      <PortalTopBar />
      <Box
        component="main"
        sx={{
          flex: 1,
          p: { xs: 2, sm: 3 },
          maxWidth: 1200,
          width: "100%",
          mx: "auto",
          boxSizing: "border-box",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

function PortalLayout() {
  return (
    <CartProvider>
      <PortalCatalogSearchProvider>
        <PortalLayoutInner />
      </PortalCatalogSearchProvider>
    </CartProvider>
  );
}
