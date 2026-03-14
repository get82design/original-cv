import { router, publicProcedure } from '../trpc';
// import { prisma } from '../../lib/prisma';
import { prisma } from '../db/prismaFactory';

export const exampleRouter = router({
  getUsers: publicProcedure.query(async () => {
    return prisma.user.findMany();
  }),
});
