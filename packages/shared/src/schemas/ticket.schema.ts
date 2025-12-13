import { z } from "zod";

export const ticketSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  propertyId: z.string().uuid("Invalid Property ID"),
});

export type TicketInput = z.infer<typeof ticketSchema>;

export const updateTicketStatusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]),
});

export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
