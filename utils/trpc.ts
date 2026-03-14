import { createTRPCReact, httpBatchLink } from '@trpc/react-query';
import type { AppRouter } from '../pages/api/trpc/[trpc]';

export const trpc: ReturnType<typeof createTRPCReact<AppRouter>> = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc', // URL de ton endpoint tRPC dans Next.js
    }),
  ],
});
