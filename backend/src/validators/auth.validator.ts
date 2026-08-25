import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  role: z.enum(["PASSENGER", "DRIVER"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});