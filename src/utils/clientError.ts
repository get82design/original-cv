import { TRPCClientError } from "@trpc/client";

/** Message utilisateur depuis une erreur tRPC / Error. */
export function getClientErrorMessage(
	err: unknown,
	fallback = "Une erreur est survenue.",
): string {
	if (err instanceof TRPCClientError) {
		const msg = err.message?.trim();
		if (msg) return msg;
	}
	if (err instanceof Error) {
		const msg = err.message?.trim();
		if (msg) return msg;
	}
	return fallback;
}

export function isTrpcCode(err: unknown, code: string): boolean {
	return (
		err instanceof TRPCClientError &&
		(err.data as { code?: string } | null | undefined)?.code === code
	);
}

export function isTooManyRequestsError(err: unknown): boolean {
	return isTrpcCode(err, "TOO_MANY_REQUESTS");
}
