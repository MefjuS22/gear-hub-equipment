import type {
  Customer as GeneratedCustomer,
  EquipmentDto as GeneratedEquipment,
} from "./generated/types";
import type { Customer, Equipment } from "../types";

export const mapApiEquipment = (equipment: GeneratedEquipment): Equipment => ({
  id: equipment.id ?? 0,
  name: equipment.name ?? "Unknown equipment",
  categoryId: equipment.categoryId ?? 0,
  brandId: equipment.brandId ?? 0,
  warehouseId: equipment.warehouseId ?? 0,
  dailyRate: equipment.dailyRate ?? 0,
  isAvailable: equipment.isAvailable ?? false,
  imageUrl: equipment.imageUrl,
  categoryName: equipment.categoryName,
  brandName: equipment.brandName,
  warehouseName: equipment.warehouseName,
});

export const mapApiCustomer = (customer: GeneratedCustomer): Customer => ({
  id: customer.id ?? 0,
  companyName: customer.companyName ?? "Unknown company",
});
