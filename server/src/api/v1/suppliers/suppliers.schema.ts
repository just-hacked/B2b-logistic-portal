import { z } from "zod";

export const createSupplierSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(200),
  country: z.string().max(100).default("China"),
  city: z.string().max(100).optional().nullable(),
  contactName: z.string().max(100).optional().nullable(),
  contactEmail: z.string().email("Invalid email address").optional().nullable().or(z.literal("")),
  contactPhone: z.string().max(50).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  isVerified: z.boolean().default(false),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
