export type ShopStackParamList = {
  EquipmentList: undefined;
  EquipmentDetail: { equipmentId: number };
  CartOrder:
    | {
        initialRentalStartDate?: string;
        initialRentalEndDate?: string;
      }
    | undefined;
  OrderConfirmation: {
    companyName: string;
    contactPerson: string;
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
  EquipmentDetail: { equipmentId: number };
  EquipmentForm: { equipmentId?: number } | undefined;
};

export type NewsStackParamList = {
  NewsList: undefined;
  NewsDetail: { slug: string };
};

export type OrdersStackParamList = {
  OrderList: undefined;
  OrderDetail: { orderId: number };
};

export type DrawerParamList = {
  Shop: undefined;
  Catalog: undefined;
  News: undefined;
  Orders: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  Login: { redirectTo?: string } | undefined;
  Register: { redirectTo?: string } | undefined;
};
