import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getOrCreateUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const email = clerkUser.emailAddresses[0].emailAddress;

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    // If user exists (e.g., invited tenant), update their info from Clerk
    // This ensures their name matches their Clerk profile
    if (user.name !== `${clerkUser.firstName} ${clerkUser.lastName}`) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: `${clerkUser.firstName} ${clerkUser.lastName}`,
        },
      });
    }
    return user;
  }

  // If user doesn't exist, create them as a LANDLORD
  user = await prisma.user.create({
    data: {
      id: clerkUser.id, // Use Clerk ID as our DB ID for new landlords
      email,
      name: `${clerkUser.firstName} ${clerkUser.lastName}`,
      role: "LANDLORD",
      // Assign free plan by default
      subscription: {
        create: {
          plan: {
            connect: { slug: "starter" },
          },
          status: "active",
        },
      },
    },
  });

  return user;
}
