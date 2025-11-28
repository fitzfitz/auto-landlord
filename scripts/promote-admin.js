// This uses .js file instead of .ts file because it's a script that runs in the terminal

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("❌ Error: Please provide an email address");
    console.log("\nUsage:");
    console.log("  npm run promote-admin <email>");
    console.log("\nExample:");
    console.log("  npm run promote-admin admin@example.com\n");
    process.exit(1);
  }

  console.log(`🔍 Looking for user: ${email}...`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`❌ User not found: ${email}`);
    console.log(
      "\n💡 Tip: Make sure the user has signed up via Clerk first!\n"
    );
    process.exit(1);
  }

  if (user.role === "SUPER_ADMIN") {
    console.log(`ℹ️  User ${email} is already a SUPER_ADMIN\n`);
    process.exit(0);
  }

  await prisma.user.update({
    where: { email },
    data: { role: "SUPER_ADMIN" },
  });

  console.log(`✅ Successfully promoted ${email} to SUPER_ADMIN!\n`);
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
