import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Box } from "@mui/material";

export const Route = createRootRoute({
  component: RootLayout,
});

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
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          minWidth: 0,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
