import { z } from "zod";

export const createRideSchema = z.object({
  origin: z
    .string()
    .trim()
    .min(2)
    .max(150),

  destination: z
    .string()
    .trim()
    .min(2)
    .max(150),

  departureTime: z
    .string()
    .datetime(),

  availableSeats: z
    .number()
    .int()
    .min(1)
    .max(8),

  price: z
    .number()
    .min(0)
    .max(100000),

  description: z
    .string()
    .max(500)
    .optional(),
});