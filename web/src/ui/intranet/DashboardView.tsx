import { Link } from "@tanstack/react-router";
import { Box, Card, CardActionArea, CardContent, Typography } from "@mui/material";
import {
  ClipboardList,
  FileText,
  FolderTree,
  LayoutDashboard,
  Package,
  Tag,
  UserCog,
  Users,
  Warehouse,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "../common";

const TILES: { to: string; label: string; description: string; Icon: LucideIcon }[] = [
  { to: "/intranet/orders", label: "Orders", description: "Order status and history (read-only for now).", Icon: ClipboardList },
  { to: "/intranet/equipment", label: "Equipment", description: "Add, list, and remove rental equipment.", Icon: Package },
  { to: "/intranet/categories", label: "Categories", description: "Reference list from the API.", Icon: FolderTree },
  { to: "/intranet/brands", label: "Brands", description: "Reference list from the API.", Icon: Tag },
  { to: "/intranet/warehouses", label: "Warehouses", description: "Derived from equipment assignments.", Icon: Warehouse },
  { to: "/intranet/customers", label: "Customers", description: "Reference list from the API.", Icon: Users },
  { to: "/intranet/users", label: "Users", description: "Placeholder until user APIs ship.", Icon: UserCog },
  { to: "/intranet/maintenance", label: "Maintenance", description: "Placeholder until maintenance APIs ship.", Icon: Wrench },
  { to: "/intranet/portal-texts", label: "Portal content", description: "Placeholder until CMS APIs ship.", Icon: FileText },
];

export function DashboardView() {
  return (
    <Box>
      <PageHeader
        title="Dashboard"
        subtitle="Shortcuts to the most-used staff areas. Use the sidebar for the full menu."
        actions={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
            <LayoutDashboard size={22} aria-hidden />
          </Box>
        }
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
          gap: 2,
        }}
      >
        {TILES.map(({ to, label, description, Icon }) => (
          <Card key={to} variant="outlined">
            <CardActionArea component={Link} to={to} sx={{ alignItems: "stretch", height: "100%" }}>
              <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, height: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "primary.main" }}>
                  <Icon size={22} strokeWidth={1.75} aria-hidden />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {label}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
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
