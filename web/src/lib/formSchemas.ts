import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().min(1, "Podaj nazwę"),
  description: z.string(),
});
export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const brandFormSchema = z.object({
  name: z.string().min(1, "Podaj nazwę"),
});
export type BrandFormValues = z.infer<typeof brandFormSchema>;

export const warehouseFormSchema = z.object({
  name: z.string().min(1, "Podaj nazwę"),
  location: z.string().min(1, "Podaj lokalizację"),
});
export type WarehouseFormValues = z.infer<typeof warehouseFormSchema>;

export const customerFormSchema = z.object({
  companyName: z.string().min(1, "Podaj firmę"),
  contactPerson: z.string().min(1, "Podaj osobę kontaktową"),
});
export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export const userFormSchema = z.object({
  name: z.string().min(1, "Podaj nazwę"),
  email: z.string().email("Podaj poprawny email"),
  roleId: z.number().int().positive(),
});
export type UserFormValues = z.infer<typeof userFormSchema>;

export const equipmentFormSchema = z.object({
  name: z.string().min(1, "Podaj nazwę"),
  categoryId: z.number().int().positive(),
  brandId: z.number().int().positive(),
  warehouseId: z.number().int().positive(),
  dailyRate: z.number().nonnegative(),
  isAvailable: z.boolean(),
});
export type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;

export const maintenanceFormSchema = z.object({
  equipmentId: z.number().int().positive(),
  description: z.string().min(1, "Podaj opis"),
  /** yyyy-MM-dd */
  date: z.string().min(1, "Podaj datę"),
});
export type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

export const portalTextFormSchema = z.object({
  key: z.string().min(1, "Podaj klucz"),
  title: z.string(),
  body: z.string(),
  sortOrder: z.number().int(),
});
export type PortalTextFormValues = z.infer<typeof portalTextFormSchema>;

export const orderCheckoutFormSchema = z
  .object({
    customerId: z.number().int().positive(),
    rentalStart: z.string().min(1),
    rentalEnd: z.string().min(1),
  })
  .refine((d) => new Date(d.rentalEnd) > new Date(d.rentalStart), {
    message: "Koniec musi być po dacie startu",
    path: ["rentalEnd"],
  });
export type OrderCheckoutFormValues = z.infer<typeof orderCheckoutFormSchema>;
