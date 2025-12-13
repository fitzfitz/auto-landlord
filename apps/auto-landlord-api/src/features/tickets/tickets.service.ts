import {
  tickets,
  TicketInput,
  UpdateTicketStatusInput,
} from "@auto-landlord/shared";
import { createDb } from "../../db";
import { eq } from "drizzle-orm";

export class TicketsService {
  constructor(private db: ReturnType<typeof createDb>) {}

  async findAll(userId: string) {
    // Determine if user is tenant or landlord.
    // For now returning all tickets where user is creator OR property landlord
    // This requires complex query. Simplified: fetch all for now and filter in memory or robust SQL.

    // Better: GET /tickets should probably take role/context.
    // Assuming simple tenant view:
    return this.db.query.tickets.findMany({
      where: eq(tickets.creatorId, userId),
      with: { property: true },
    });
  }

  async create(data: TicketInput, userId: string) {
    const [newTicket] = await this.db
      .insert(tickets)
      .values({ ...data, creatorId: userId, status: "OPEN" })
      .returning();
    return newTicket;
  }

  async updateStatus(id: string, data: UpdateTicketStatusInput) {
    const [updated] = await this.db
      .update(tickets)
      .set({ status: data.status })
      .where(eq(tickets.id, id))
      .returning();
    return updated;
  }
}
