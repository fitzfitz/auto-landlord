import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const plans = [
  {
    name: "Starter",
    slug: "starter",
    price: 0,
    maxProperties: 2,
    features: {
      marketing_kit: false,
      rent_collection: false,
      tenant_portal: false,
      custom_branding: false,
      team_members: false,
      support_level: "basic",
    },
  },
  {
    name: "Pro",
    slug: "pro",
    price: 2900,
    maxProperties: 20,
    features: {
      marketing_kit: true,
      rent_collection: true,
      tenant_portal: true,
      custom_branding: false,
      team_members: false,
      support_level: "priority",
    },
  },
  {
    name: "Business",
    slug: "business",
    price: 9900,
    maxProperties: 9999,
    features: {
      marketing_kit: true,
      rent_collection: true,
      tenant_portal: true,
      custom_branding: true,
      team_members: true,
      support_level: "dedicated",
    },
  },
];

async function main() {
  console.log("🌱 Seeding database...\n");

  // Seed Plans
  console.log("📋 Seeding subscription plans...");
  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: { ...plan, features: JSON.stringify(plan.features) },
      create: { ...plan, features: JSON.stringify(plan.features) },
    });
  }
  console.log("✅ Plans seeded\n");

  // Seed Super Admin (if configured)

  console.log("✅ Seeding finished successfully!\n");
  console.log("📝 Next steps:");
  console.log("  1. Run 'npm run dev' to start the development server");
  console.log("  2. Visit http://localhost:3000");
  console.log("  3. Sign up via Clerk to create your account");
  console.log("  4. Add properties and tenants through the dashboard\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
