export interface Equipment {
  id: number;
  name: string;
  categoryId: number;
  brandId: number;
  dailyRate: number;
  isAvailable: boolean;
}

export interface Category {
  id: number;
  name: string;
}

export interface Brand {
  id: number;
  name: string;
}

export interface Customer {
  id: number;
  companyName: string;
}

export interface CartItem {
  equipmentId: number;
  name: string;
  dailyRate: number;
  quantity: number;
}

export interface OrderPayloadItem {
  equipmentId: number;
  quantity: number;
}

export interface OrderPayload {
  customerId: number;
  userId: number;
  rentalStartDate: string;
  rentalEndDate: string;
  items: OrderPayloadItem[];
}
