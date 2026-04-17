import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { LayoutGrid, ShoppingCart } from "lucide-react";
import { CartProvider } from "../../ui/portal/cartContext";

export const Route = createFileRoute("/portal")({
  component: PortalLayout,
});

function PortalLayout() {
  return (
    <CartProvider>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column" }}>
        <AppBar position="static" elevation={0} sx={{ bgcolor: "primary.main" }}>
          <Toolbar sx={{ justifyContent: "space-between", maxWidth: 1100, width: "100%", mx: "auto", px: 2 }}>
            <Typography
              component={Link}
              to="/portal"
              variant="h6"
              sx={{ color: "primary.contrastText", textDecoration: "none", fontWeight: 700 }}
            >
              GearHub Rentals
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button component={Link} to="/portal" color="inherit" size="small" startIcon={<LayoutGrid size={18} aria-hidden />}>
                Catalog
              </Button>
              <Button component={Link} to="/portal/cart" color="inherit" size="small" startIcon={<ShoppingCart size={18} aria-hidden />}>
                Cart
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ flex: 1, p: 3, maxWidth: 1100, width: "100%", mx: "auto", boxSizing: "border-box" }}>
          <Outlet />
        </Box>
      </Box>
    </CartProvider>
  );
}
