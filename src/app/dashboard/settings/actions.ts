"use server";

import { getOrCreateUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function updateProfile(formData: FormData) {
  const user = await getOrCreateUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;

  await prisma.user.update({
    where: { id: user.id },
    data: { name },
  });

  revalidatePath("/dashboard/settings");
}
