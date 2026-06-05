import { z } from "zod";

const passwordForNewUserSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Z]/, "Password must have at least one uppercase letter.")
  .regex(/[a-z]/, "Password must have at least one lowercase letter.")
  .regex(/[0-9]/, "Password must have at least one digit.");

export const createStaffUserFormSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: passwordForNewUserSchema,
    displayName: z
      .string()
      .min(1, "Display name is required")
      .max(200, "Display name is too long"),
    admin: z.boolean(),
    user: z.boolean(),
  })
  .refine((d) => d.admin || d.user, {
    message: "Select at least one role.",
    path: ["admin"],
  });

export type CreateStaffUserFormValues = z.infer<
  typeof createStaffUserFormSchema
>;

export const setStaffUserRolesFormSchema = z
  .object({
    admin: z.boolean(),
    user: z.boolean(),
  })
  .refine((d) => d.admin || d.user, {
    message: "Select at least one role.",
    path: ["admin"],
  });

export type SetStaffUserRolesFormValues = z.infer<
  typeof setStaffUserRolesFormSchema
>;

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
  imageUrl: z.string().max(2000),
  descriptionHtml: z.string().max(64_000),
});
export type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;

export const maintenanceFormSchema = z.object({
  equipmentId: z.number().int().positive(),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
});
export type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

export const portalTextFormSchema = z.object({
  title: z.string().min(1, "Label is required").max(300),
  bodyHtml: z.string().min(1, "Content is required").max(64_000),
});
export type PortalTextFormValues = z.infer<typeof portalTextFormSchema>;

export const cmsPostFormSchema = z.object({
  slug: z.string().max(200),
  title: z.string().min(1, "Title is required").max(300),
  excerpt: z.string().max(2000),
  coverImageUrl: z.string().max(2000),
  bodyHtml: z.string().max(512_000),
  isPublished: z.boolean(),
});
export type CmsPostFormValues = z.infer<typeof cmsPostFormSchema>;

export const orderCheckoutFormSchema = z
  .object({
    companyName: z.string().min(1, "Company or organization name is required"),
    contactPerson: z.string().min(1, "Contact person is required"),
    rentalStart: z.string().min(1),
    rentalEnd: z.string().min(1),
  })
  .refine((d) => new Date(d.rentalEnd) > new Date(d.rentalStart), {
    message: "End date must be after the start date",
    path: ["rentalEnd"],
  });
export type OrderCheckoutFormValues = z.infer<typeof orderCheckoutFormSchema>;
