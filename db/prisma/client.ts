import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function createClient() {
  return prisma;
}
