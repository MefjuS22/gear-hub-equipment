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
import { INTRANET_NAV } from "../../lib/intranetNav";
import { PageHeader } from "../common";

export function DashboardView() {
  const permissions = usePermissionSet();
  const tiles = INTRANET_NAV.filter(
    (item) =>
      item.to !== "/intranet" &&
      (!item.permission || permissions.has(item.permission)),
  );

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        subtitle="Shortcuts to the staff areas you can access. Use the sidebar for the full menu."
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
