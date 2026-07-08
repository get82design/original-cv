import { prisma } from "../lib/prisma";

export const createContext = () => ({ prisma });
export type Context = ReturnType<typeof createContext>;
