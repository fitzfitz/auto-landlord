import { z } from "zod";

export const propertySchema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(2, "State must be 2 characters").max(2),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
  rentAmount: z.coerce.number().positive("Rent must be positive"),
  bedrooms: z.coerce.number().int().nonnegative().optional(),
  bathrooms: z.coerce.number().positive().optional(),
  propertyType: z.enum(["HOUSE", "APARTMENT", "CONDO", "TOWNHOUSE"]).optional(),
  description: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  isListed: z.boolean().default(false),
});

export type PropertyInput = z.infer<typeof propertySchema>;
