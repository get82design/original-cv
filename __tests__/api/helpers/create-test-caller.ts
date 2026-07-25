import type { AppSession } from "../../../server/api/context";
import { appRouter } from "../../../server/api/root";
import { createTRPCContext } from "../../../server/api/context";

export async function createTestCaller(session?: AppSession | null) {
	const ctx = await createTRPCContext({ session: session ?? null });
	return appRouter.createCaller(ctx);
}

export function createTestSession(user: {
	id: string;
	email: string;
	name?: string | null;
}): AppSession {
	return {
		user: {
			id: user.id,
			email: user.email,
			name: user.name ?? null,
		},
	};
}
