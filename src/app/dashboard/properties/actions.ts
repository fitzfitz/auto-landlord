"use server";

import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProperty(formData: FormData) {
  const user = await getOrCreateUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const zip = formData.get("zip") as string;
  const rentAmount = parseInt(formData.get("rentAmount") as string);

  await prisma.property.create({
    data: {
      landlordId: user.id,
      address,
      city,
      state,
      zip,
      rentAmount,
      status: "VACANT",
    },
  });

  revalidatePath("/dashboard/properties");
  redirect("/dashboard/properties");
}
