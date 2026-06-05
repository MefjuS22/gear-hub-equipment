import type { LucideIcon } from "lucide-react";
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

import { AppPermissions } from "./appPermissions";

export type IntranetNavItem = {
  to: string;
  label: string;
  Icon: LucideIcon;
  /** Shown on dashboard tiles and optional tooltips. */
  description?: string;
  /** When set, the item is shown only if the signed-in user has this permission. */
  permission?: string;
};

export const INTRANET_NAV: IntranetNavItem[] = [
  {
    to: "/intranet",
    label: "Dashboard",
    description: "Overview and shortcuts.",
    Icon: LayoutDashboard,
  },
  {
    to: "/intranet/orders",
    label: "Orders",
    description: "Order status and history.",
    Icon: ClipboardList,
    permission: AppPermissions.OrdersRead,
  },
  {
    to: "/intranet/equipment",
    label: "Equipment",
    description: "Rental fleet records and availability.",
    Icon: Package,
    permission: AppPermissions.EquipmentRead,
  },
  {
    to: "/intranet/categories",
    label: "Categories",
    description: "Reference list from the API.",
    Icon: FolderTree,
    permission: AppPermissions.CategoriesManage,
  },
  {
    to: "/intranet/brands",
    label: "Brands",
    description: "Reference list from the API.",
    Icon: Tag,
    permission: AppPermissions.BrandsManage,
  },
  {
    to: "/intranet/warehouses",
    label: "Warehouses",
    description: "Stock locations for equipment.",
    Icon: Warehouse,
    permission: AppPermissions.WarehousesManage,
  },
  {
    to: "/intranet/customers",
    label: "Customers",
    description: "Customer accounts.",
    Icon: Users,
    permission: AppPermissions.CustomersRead,
  },
  {
    to: "/intranet/users",
    label: "Users",
    description: "Staff accounts and roles.",
    Icon: UserCog,
    permission: AppPermissions.UsersManage,
  },
  {
    to: "/intranet/maintenance",
    label: "Maintenance",
    description: "Scheduling (coming soon).",
    Icon: Wrench,
    permission: AppPermissions.EquipmentRead,
  },
  {
    to: "/intranet/portal-texts",
    label: "Portal content",
    description: "News, portal copy, and CMS posts.",
    Icon: FileText,
    permission: AppPermissions.CmsManage,
  },
];
