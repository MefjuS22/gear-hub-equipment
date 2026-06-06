import { Link } from "@tanstack/react-router";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from "@mui/material";
import { LayoutDashboard } from "lucide-react";

import { usePermissionSet } from "../../hooks/usePermissionSet";
import { AppPermissions } from "../../lib/appPermissions";
import { INTRANET_NAV } from "../../lib/intranetNav";
import { PageHeader } from "../common";
import { DashboardStatsPanel } from "./DashboardStatsPanel";

export function DashboardView() {
  const permissions = usePermissionSet();
  const canViewStats = permissions.has(AppPermissions.DashboardRead);
  const tiles = INTRANET_NAV.filter(
    (item) =>
      item.to !== "/intranet" &&
      (!item.permission || permissions.has(item.permission)),
  );

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        subtitle="Operational overview, statistics, and shortcuts to staff areas."
        actions={
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "text.secondary",
            }}
          >
            <LayoutDashboard size={22} aria-hidden />
          </Box>
        }
      />

      {canViewStats ? <DashboardStatsPanel /> : null}

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Quick links
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 2,
        }}
      >
        {tiles.map(({ to, label, description, Icon }) => (
          <Card key={to} variant="outlined">
            <CardActionArea
              component={Link}
              to={to}
              sx={{ alignItems: "stretch", height: "100%" }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "primary.main",
                  }}
                >
                  <Icon size={22} strokeWidth={1.75} aria-hidden />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {label}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ flex: 1 }}
                >
                  {description}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
