import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Link as MuiLink,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useCallback, useState } from "react";
import {
  Building2,
  ChevronLeft,
  ClipboardList,
  FileText,
  FolderTree,
  LayoutDashboard,
  Menu,
  Package,
  Plus,
  Tag,
  UserCog,
  Users,
  Warehouse,
  Wrench,
} from "lucide-react";

const DRAWER_WIDTH = 260;

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

function SidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <Toolbar
        sx={{
          px: 2,
          pt: 2,
          pb: 1.5,
          flexDirection: "column",
          alignItems: "stretch",
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Building2 size={24} strokeWidth={1.75} aria-hidden />
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, lineHeight: 1.2 }}
            >
              GearHub
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block" }}
            >
              Staff workspace
            </Typography>
          </Box>
        </Box>
        <Button
          component={Link}
          to="/intranet/equipment/new"
          variant="containedBlack"
          fullWidth
          startIcon={<Plus size={18} aria-hidden />}
          onClick={onNavigate}
        >
          New equipment
        </Button>
      </Toolbar>
      <List dense sx={{ py: 1, overflow: "auto", flex: 1, px: 0.5 }}>
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
              onClick={onNavigate}
              sx={{
                borderRadius: 1,
                mb: 0.25,
                "&.Mui-selected": {
                  bgcolor: "action.selected",
                  borderLeft: 3,
                  borderColor: "primary.main",
                  pl: 1.625,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Icon size={20} strokeWidth={1.75} aria-hidden />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: { sx: { fontWeight: selected ? 600 : 500 } },
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
      <Box sx={{ p: 1.5, borderTop: 1, borderColor: "divider" }}>
        <Button
          component={MuiLink}
          href="mailto:support@example.com"
          fullWidth
          color="inherit"
          size="small"
          sx={{ justifyContent: "flex-start" }}
        >
          Support
        </Button>
        <Button
          component={Link}
          to="/"
          fullWidth
          color="inherit"
          size="small"
          sx={{ justifyContent: "flex-start" }}
        >
          Sign out
        </Button>
      </Box>
    </>
  );
}

function IntranetLayout() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({
    select: (s) => normalizePath(s.location.pathname),
  });

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const drawer = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "background.paper",
      }}
    >
      <SidebarNav pathname={pathname} onNavigate={closeMobile} />
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        width: "100%",
      }}
    >
      {isMdUp ? (
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
          {drawer}
        </Box>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={closeMobile}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          minHeight: 0,
          bgcolor: "background.default",
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          {!isMdUp ? (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={22} aria-hidden />
            </IconButton>
          ) : null}
          <MuiLink
            component={Link}
            to="/"
            underline="hover"
            color="text.secondary"
            sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
          >
            <ChevronLeft size={18} aria-hidden />
            Site home
          </MuiLink>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 600 }}
          >
            Staff
          </Typography>
        </Box>
        <Box
          component="main"
          sx={{ p: { xs: 2, sm: 3 }, flex: 1, overflow: "auto" }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
