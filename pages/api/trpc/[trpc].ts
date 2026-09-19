import * as trpcNext from "@trpc/server/adapters/next";
import { createTRPCContext } from "../../../server/api/context";
import { appRouter } from "../../../server/api/root";

/** PDF en base64 dépasse vite 1 Mo (défaut Next) — import CV. */
export const config = {
	api: {
		bodyParser: {
			sizeLimit: "10mb",
		},
	},
};

export default trpcNext.createNextApiHandler({
	router: appRouter,
	createContext: createTRPCContext,
});
