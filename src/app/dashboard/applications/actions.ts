"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateStatus(applicationId: string, status: string) {
  await prisma.application.update({
    where: { id: applicationId },
    data: { status },
  });

  revalidatePath("/dashboard/applications");
}
