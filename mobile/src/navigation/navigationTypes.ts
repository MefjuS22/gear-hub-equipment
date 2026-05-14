export type ShopStackParamList = {
  EquipmentList: undefined;
  CartOrder:
    | {
        initialRentalStartDate?: string;
        initialRentalEndDate?: string;
      }
    | undefined;
  OrderConfirmation: {
    customerName: string;
    rentalStartDate: string;
    rentalEndDate: string;
    itemsCount: number;
    subtotalPerDay: number;
  };
};

export type CatalogStackParamList = {
  CatalogHome: undefined;
  BrandList: undefined;
  BrandForm: { brandId?: number } | undefined;
  CategoryList: undefined;
  CategoryForm: { categoryId?: number } | undefined;
  WarehouseList: undefined;
  WarehouseForm: { warehouseId?: number } | undefined;
  AdminEquipmentList: undefined;
  EquipmentForm: { equipmentId?: number } | undefined;
};

export type NewsStackParamList = {
  NewsList: undefined;
  NewsDetail: { slug: string };
};

export type OrdersStackParamList = {
  OrderList: undefined;
};

export type DrawerParamList = {
  Shop: undefined;
  Catalog: undefined;
  News: undefined;
  Orders: undefined;
};
