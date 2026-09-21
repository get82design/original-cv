import type { TRPCError } from "@trpc/server";
import type { Context } from "../context";
import { adminApiErrorService } from "../../../src/services/admin/adminApiErrorService";

/** Codes à journaliser (pannes / quotas) — pas les erreurs métier « normales ». */
const LOGGED_TRPC_CODES = new Set<TRPCError["code"]>([
	"INTERNAL_SERVER_ERROR",
	"TIMEOUT",
	"TOO_MANY_REQUESTS",
	"PAYLOAD_TOO_LARGE",
	"CLIENT_CLOSED_REQUEST",
]);

export function shouldLogTrpcError(code: TRPCError["code"]): boolean {
	return LOGGED_TRPC_CODES.has(code);
}

export type RecordTrpcApiErrorInput = {
	error: TRPCError;
	path: string | undefined;
	ctx: Context | undefined;
};

/**
 * Persiste une erreur tRPC dans ApiErrorEvent.
 * Ne throw jamais : le logging ne doit pas masquer l’erreur d’origine.
 */
export async function recordTrpcApiError(
	input: RecordTrpcApiErrorInput,
): Promise<{ id: string } | null> {
	try {
		if (!shouldLogTrpcError(input.error.code)) {
			return null;
		}

		const path = input.path?.trim() || "unknown";
		const userId = input.ctx?.session?.user?.id ?? null;

		return await adminApiErrorService.create({
			path,
			code: input.error.code,
			message: input.error.message,
			userId,
		});
	} catch (err) {
		console.error("[apiError] failed to persist ApiErrorEvent", err);
		return null;
	}
}
