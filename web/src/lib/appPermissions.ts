/** Mirrors backend <c>GearHub.Api.Authorization.AppPermissions</c>. */
export const AppPermissions = {
  EquipmentRead: "equipment.read",
  EquipmentManage: "equipment.manage",
  BrandsManage: "brands.manage",
  CategoriesManage: "categories.manage",
  WarehousesManage: "warehouses.manage",
  CustomersRead: "customers.read",
  OrdersRead: "orders.read",
  OrdersCreate: "orders.create",
  CmsReadPublished: "cms.read.published",
  CmsManage: "cms.manage",
  FilesUpload: "files.upload",
  UsersManage: "users.manage",
} as const;
