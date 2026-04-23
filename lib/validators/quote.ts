import { z } from "zod";

export const quoteRequestSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  productSummary: z.string().min(4).max(400),
  estQuantity: z.coerce.number().int().positive().max(10_000_000),
  inHandsDate: z.string().optional(),
  decoration: z.string().optional(),
  message: z.string().max(2000).optional(),
  files: z.array(z.string().url()).default([]),
  hp: z.string().optional(), // honeypot
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;
