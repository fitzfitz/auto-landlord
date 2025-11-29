import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getOrCreateUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ticketId, status } = await request.json();

    // Verify the ticket belongs to this landlord
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        property: { landlordId: user.id },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Update the ticket
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating ticket:", error);
    return NextResponse.json(
      { error: "Failed to update ticket" },
      { status: 500 }
    );
  }
}
