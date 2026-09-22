import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import type { AppRouter } from "../server/api/root";
import superjson from "superjson";

export const trpc: ReturnType<typeof createTRPCReact<AppRouter>> = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
	links: [
		httpBatchLink({
			url: "/api/trpc",
			transformer: superjson,
		}),
	],
});
