import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(6).max(20).optional(),
  role: z.enum(["WORKSHOP", "CUSTOMER"]),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(6).max(20).optional(),
  password: z.string().min(6).optional(),
});
