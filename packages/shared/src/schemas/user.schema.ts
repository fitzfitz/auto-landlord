import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["LANDLORD", "TENANT", "SUPER_ADMIN"]).default("LANDLORD"),
});

export type UserInput = z.infer<typeof userSchema>;
