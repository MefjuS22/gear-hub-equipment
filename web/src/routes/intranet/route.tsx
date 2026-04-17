import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  Box,
  Link as MuiLink,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  Building2,
  ChevronLeft,
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

const DRAWER_WIDTH = 240;

const NAV: { to: string; label: string; Icon: LucideIcon }[] = [
  { to: "/intranet", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/intranet/orders", label: "Orders", Icon: ClipboardList },
  { to: "/intranet/equipment", label: "Equipment", Icon: Package },
  { to: "/intranet/categories", label: "Categories", Icon: FolderTree },
  { to: "/intranet/brands", label: "Brands", Icon: Tag },
  { to: "/intranet/warehouses", label: "Warehouses", Icon: Warehouse },
  { to: "/intranet/customers", label: "Customers", Icon: Users },
  { to: "/intranet/users", label: "Users", Icon: UserCog },
  { to: "/intranet/maintenance", label: "Maintenance", Icon: Wrench },
  { to: "/intranet/portal-texts", label: "Portal content", Icon: FileText },
];

export const Route = createFileRoute("/intranet")({
  component: IntranetLayout,
});

function normalizePath(path: string) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

function IntranetLayout() {
  const pathname = useRouterState({ select: (s) => normalizePath(s.location.pathname) });

  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        alignSelf: "stretch",
        minWidth: 0,
        minHeight: 0,
        width: "100%",
      }}
    >
      <Box
        component="aside"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          borderRight: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <Toolbar sx={{ px: 2, borderBottom: 1, borderColor: "divider", minHeight: 56, gap: 1 }}>
          <Building2 size={22} strokeWidth={1.75} aria-hidden />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "primary.main" }}>
            Intranet
          </Typography>
        </Toolbar>
        <List dense sx={{ py: 1, overflow: "auto", flex: 1 }}>
          {NAV.map((item) => {
            const isDashboard = item.to === "/intranet";
            const selected = isDashboard
              ? pathname === "/intranet"
              : pathname === item.to || pathname.startsWith(`${item.to}/`);
            const Icon = item.Icon;
            return (
              <ListItemButton
                key={item.to}
                component={Link}
                to={item.to}
                selected={selected}
                sx={{
                  "&.Mui-selected": {
                    bgcolor: "action.selected",
                    borderLeft: 3,
                    borderColor: "primary.main",
                    pl: 1.625,
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Icon size={20} strokeWidth={1.75} aria-hidden />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            );
          })}
        </List>
      </Box>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0, bgcolor: "grey.100" }}>
        <Paper square elevation={0} sx={{ px: 3, py: 2, borderBottom: 1, borderColor: "divider", borderRadius: 0 }}>
          <MuiLink
            component={Link}
            to="/"
            underline="hover"
            color="text.secondary"
            sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
          >
            <ChevronLeft size={18} aria-hidden />
            Home
          </MuiLink>
        </Paper>
        <Box component="main" sx={{ p: 3, flex: 1, overflow: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
