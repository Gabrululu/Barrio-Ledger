import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {  
  if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL no detectada. Trabajando en modo mock.");
    return null;
  }
  
  try {
    return new PrismaClient();
  } catch (e) {
    console.error("Error al instanciar PrismaClient", e);
    return null;
  }
};

declare global {
  var prisma: ReturnType<typeof prismaClientSingleton> | undefined;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;