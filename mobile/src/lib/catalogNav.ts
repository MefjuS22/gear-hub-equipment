import type { CatalogStackParamList } from "../navigation/navigationTypes";
import { AppPermissions } from "./appPermissions";

type CatalogHomeLinkTarget = Exclude<
  keyof CatalogStackParamList,
  "CatalogHome" | "EquipmentDetail" | "EquipmentForm"
>;

export type CatalogNavItem = {
  title: string;
  subtitle: string;
  target: CatalogHomeLinkTarget;
  permission: string;
};

export const CATALOG_NAV: CatalogNavItem[] = [
  {
    title: "Brands",
    subtitle: "Create, edit, or remove equipment brands.",
    target: "BrandList",
    permission: AppPermissions.BrandsManage,
  },
  {
    title: "Categories",
    subtitle: "Organize catalog items by category.",
    target: "CategoryList",
    permission: AppPermissions.CategoriesManage,
  },
  {
    title: "Warehouses",
    subtitle: "Storage locations for inventory.",
    target: "WarehouseList",
    permission: AppPermissions.WarehousesManage,
  },
  {
    title: "Equipment",
    subtitle: "Full equipment records with references.",
    target: "AdminEquipmentList",
    permission: AppPermissions.EquipmentRead,
  },
];
