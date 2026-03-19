import { z } from "zod";
import { InvoiceStatus } from "@prisma/client";

// Schema for creating an invoice
export const createInvoiceZodSchema = z.object({
  workshopId: z.string({
    message: "Workshop ID is required",
  }),
  month: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true; // optional
      // validate format YYYY-MM
      return /^\d{4}-(0[1-9]|1[0-2])$/.test(val);
    }, "Month must be in YYYY-MM format"),
  totalAmount: z.number().min(0).optional(), // allow manual totalAmount if needed
});

// Schema for updating an invoice
export const updateInvoiceZodSchema = z.object({
  billingMonth: z
    .union([z.date(), z.string()])
    .optional()
    .transform((val) => (typeof val === "string" ? new Date(val) : val)),
  totalJobs: z.number().int().min(0).optional(),
  totalAmount: z.number().min(0).optional(),
  status: z
    .enum([
      InvoiceStatus.DRAFT,
      InvoiceStatus.SENT,
      InvoiceStatus.PAID,
      InvoiceStatus.OVERDUE,
      InvoiceStatus.CANCELLED,
    ])
    .optional(),
  dueDate: z
    .union([z.date(), z.string()])
    .optional()
    .transform((val) => (typeof val === "string" ? new Date(val) : val)),
});

export const InvoiceValidation = {
  createInvoiceZodSchema,
  updateInvoiceZodSchema,
};