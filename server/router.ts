import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import type { Context } from './context';
import { exampleRouter } from './routers';

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  example: exampleRouter,
  //   getUsers: t.procedure.query(async ({ ctx }) => {
  //     return ctx.prisma.user.findMany(); // lit tous les users
  //   }),
  //   createUser: t.procedure
  //     .input(z.object({ name: z.string(), email: z.string() }))
  //     .mutation(async ({ ctx, input }) => {
  //       return ctx.prisma.user.create({ data: input });
  //     }),
});

export type AppRouter = typeof appRouter;
