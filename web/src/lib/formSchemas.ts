import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
});
export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const brandFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
});
export type BrandFormValues = z.infer<typeof brandFormSchema>;

export const warehouseFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
});
export type WarehouseFormValues = z.infer<typeof warehouseFormSchema>;

export const customerFormSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
});
export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export const userFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  roleId: z.number().int().positive(),
});
export type UserFormValues = z.infer<typeof userFormSchema>;

export const equipmentFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  categoryId: z.number().int().positive(),
  brandId: z.number().int().positive(),
  warehouseId: z.number().int().positive(),
  dailyRate: z.number().nonnegative(),
  isAvailable: z.boolean(),
});
export type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;

export const maintenanceFormSchema = z.object({
  equipmentId: z.number().int().positive(),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
});
export type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

export const portalTextFormSchema = z.object({
  key: z.string().min(1, "Key is required"),
  title: z.string(),
  body: z.string(),
  sortOrder: z.number().int(),
});
export type PortalTextFormValues = z.infer<typeof portalTextFormSchema>;

export const cmsPostFormSchema = z.object({
  slug: z.string().max(200),
  title: z.string().min(1, "Title is required").max(300),
  excerpt: z.string().max(2000),
  bodyHtml: z.string().max(512_000),
  isPublished: z.boolean(),
});
export type CmsPostFormValues = z.infer<typeof cmsPostFormSchema>;

export const orderCheckoutFormSchema = z
  .object({
    customerId: z.number().int().positive(),
    rentalStart: z.string().min(1),
    rentalEnd: z.string().min(1),
  })
  .refine((d) => new Date(d.rentalEnd) > new Date(d.rentalStart), {
    message: "End date must be after the start date",
    path: ["rentalEnd"],
  });
export type OrderCheckoutFormValues = z.infer<typeof orderCheckoutFormSchema>;
