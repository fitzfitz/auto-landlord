import { z } from "zod";

export const tenantSchema = z.object({
  email: z.string().email(),
  propertyId: z.string().uuid(),
  leaseStart: z.coerce.date(),
  leaseEnd: z.coerce.date(),
});

export type TenantInput = z.infer<typeof tenantSchema>;
