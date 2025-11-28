"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function updateStatus(applicationId: string, status: string) {
  await prisma.application.update({
    where: { id: applicationId },
    data: { status },
  });

  revalidatePath("/dashboard/applications");
}
