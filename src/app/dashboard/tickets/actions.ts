"use server";

import { getOrCreateUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function updateTicketStatus(ticketId: string, newStatus: string) {
  const user = await getOrCreateUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Verify the ticket belongs to this landlord's properties
  const ticket = await prisma.ticket.findFirst({
    where: {
      id: ticketId,
      property: { landlordId: user.id },
    },
  });

  if (!ticket) {
    throw new Error("Ticket not found or unauthorized");
  }

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: newStatus },
  });

  revalidatePath("/dashboard/tickets");
}

export async function createTicket(formData: FormData) {
  const user = await getOrCreateUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const priority = formData.get("priority") as string;

  if (!title || !description) {
    throw new Error("Missing required fields");
  }

  // Find tenant record to get property ID
  const tenant = await prisma.tenant.findUnique({
    where: { userId: user.id },
  });

  if (!tenant) {
    throw new Error("Tenant record not found");
  }

  await prisma.ticket.create({
    data: {
      title,
      description,
      priority,
      status: "OPEN",
      propertyId: tenant.propertyId,
      creatorId: user.id,
    },
  });

  revalidatePath("/dashboard/tickets");
}
