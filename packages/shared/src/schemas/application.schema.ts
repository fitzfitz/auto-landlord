import { z } from "zod";

export const applicationSchema = z.object({
  propertyId: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().optional(),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
