import * as trpcNext from '@trpc/server/adapters/next';
import { router } from '../../../server/trpc';
import { exampleRouter } from '../../../server/routers/example';

export const appRouter = router({
  example: exampleRouter,
});

export type AppRouter = typeof appRouter;

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: () => ({}),
});
