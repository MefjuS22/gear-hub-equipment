import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Box } from "@mui/material";

export const Route = createRootRoute({
  component: RootLayout,
});

/**
 * Global shell only: no app bars here. Each area (`/`, `/portal`, `/intranet`) owns its full layout.
 */
function RootLayout() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      {/* Flex child so portal/intranet shells can use flex:1 + minHeight:0 for scroll */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, minWidth: 0 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
