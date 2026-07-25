import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import type { PlanRole } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";

export type AppSession = {
	user: {
		id: string;
		email: string;
		name?: string | null;
		plan?: PlanRole;
	};
};

type CreateContextOptions = {
	session?: AppSession | null;
} & Partial<CreateNextContextOptions>;

export async function createTRPCContext(opts?: CreateContextOptions) {
	if (opts && "session" in opts && opts.session !== undefined) {
		return { prisma, session: opts.session };
	}
	// Runtime Next : lire le cookie / JWT
	const session =
		opts?.req && opts?.res
			? await getServerSession(opts.req, opts.res, authOptions)
			: null;
	return { prisma, session };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
