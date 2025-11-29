"use server";

import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
