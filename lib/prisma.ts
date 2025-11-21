import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;

export async function connectPrisma() {
  try {
    await prisma.$connect();
  } catch (err) {
    console.error("Prisma connect error:", err);
    throw err;
  }
}

export async function disconnectPrisma() {
  try {
    await prisma.$disconnect();
  } catch (err) {
    console.error("Prisma disconnect error:", err);
  }
}
