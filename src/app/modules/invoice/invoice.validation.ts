import { z } from "zod";
import { InvoiceStatus } from "@prisma/client";

const createInvoiceZodSchema = z.object({

    workshopId: z.string({
      message: "Workshop ID is required",
    }),
    billingMonth: z.coerce.date({
      message: "Billing month is required",
    }),
    totalJobs: z
      .number({
        message: "Total jobs is required",
      })
      .int()
      .min(0),
    totalAmount: z
      .number({
        message: "Total amount is required",
      })
      .min(0),
    dueDate: z.coerce.date({
      message: "Due date is required",
    }),
 
});

const updateInvoiceZodSchema = z.object({

    billingMonth: z.coerce.date().optional(),
    totalJobs: z.number().int().min(0).optional(),
    totalAmount: z.number().min(0).optional(),
    status: z.enum([
      InvoiceStatus.DRAFT,
      InvoiceStatus.SENT,
      InvoiceStatus.PAID,
      InvoiceStatus.OVERDUE,
      InvoiceStatus.CANCELLED,
    ]).optional(),
    dueDate: z.coerce.date().optional(),
 
});

export const InvoiceValidation = {
  createInvoiceZodSchema,
  updateInvoiceZodSchema,
};
