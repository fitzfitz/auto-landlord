import { PrismaClient } from "@prisma/client";

const createPrismaClient = () => {
  return new PrismaClient();
};

export const prisma = createPrismaClient();
