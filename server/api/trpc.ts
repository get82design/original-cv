import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

import type { Context } from "./context";
import type { AppError } from "../../src/services/errors";

const t = initTRPC.context<Context>().create({
	transformer: superjson,
});

function mapAppError(error: AppError): TRPCError["code"] {
	if (error.code.endsWith("_NOT_FOUND")) return "NOT_FOUND";
	if (error.code === "VALIDATION_ERROR") return "BAD_REQUEST";
	if (error.code === "UNAUTHORIZED") return "UNAUTHORIZED";
	if (error.code === "TOO_MANY_REQUESTS") return "TOO_MANY_REQUESTS";
	if (error.name === "ConflictError") return "CONFLICT";
	if (error.name === "ForbiddenError") return "FORBIDDEN";
	if (error.code === "CV_ALREADY_EXISTS") return "CONFLICT";
	return "INTERNAL_SERVER_ERROR";
}

function isAppError(error: unknown): error is AppError {
	if (error instanceof TRPCError) return false;

	return (
		error instanceof Error &&
		typeof (error as AppError).code === "string" &&
		(error as AppError).code.length > 0
	);
}

export function toTrpcError(error: unknown): TRPCError {
	const original = error instanceof TRPCError && error.cause != null ? error.cause : error;

	if (isAppError(original)) {
		return new TRPCError({
			code: mapAppError(original),
			message: original.message,
			cause: original,
		});
	}

	if (error instanceof TRPCError) return error;

	return new TRPCError({
		code: "INTERNAL_SERVER_ERROR",
		message: error instanceof Error ? error.message : "Unknown error",
		cause: error,
	});
}

const appErrorMiddleware = t.middleware(async ({ next }) => {
	const result = await next();

	if (!result.ok) {
		throw toTrpcError(result.error);
	}

	return result;
});

export const publicProcedure = t.procedure.use(appErrorMiddleware);
export const protectedProcedure = t.procedure.use(appErrorMiddleware).use(
	t.middleware(({ ctx, next }) => {
		if (!ctx.session?.user.id) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}
		return next({ ctx: { ...ctx, session: ctx.session } });
	}),
);

/** Session requise + rôle ADMIN. */
export const adminProcedure = protectedProcedure.use(
	t.middleware(({ ctx, next }) => {
		if (ctx.session?.user.role !== "ADMIN") {
			throw new TRPCError({ code: "FORBIDDEN" });
		}
		return next({ ctx });
	}),
);

export const router = t.router;
