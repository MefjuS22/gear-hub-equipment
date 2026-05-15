import { CssBaseline, ThemeProvider } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { setupGearHubApiClient } from "./api/setupGearHubClient";
import { gearhubQueryClient } from "./lib/gearhubQueryClient";
import { routeTree } from "./routeTree.gen";
import { AppNotistackProvider } from "./providers/AppNotistack";
import { AuthProvider } from "./providers/AuthProvider";
import { appTheme } from "./theme/appTheme";
import "./index.css";

setupGearHubApiClient();

const router = createRouter({
  routeTree,
  context: { queryClient: gearhubQueryClient },
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={appTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <CssBaseline />
        <AppNotistackProvider>
          <QueryClientProvider client={gearhubQueryClient}>
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </QueryClientProvider>
        </AppNotistackProvider>
      </LocalizationProvider>
    </ThemeProvider>
  </StrictMode>,
);
