import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";
import { prismaTest } from "../../lib/prismaTest";
import {
	recordTrpcApiError,
	shouldLogTrpcError,
} from "../../server/api/helpers/recordTrpcApiError";
import { createTestUser } from "../utils/create-test-user";

describe("shouldLogTrpcError", () => {
	it("logs server / quota codes", () => {
		expect(shouldLogTrpcError("INTERNAL_SERVER_ERROR")).toBe(true);
		expect(shouldLogTrpcError("TIMEOUT")).toBe(true);
		expect(shouldLogTrpcError("TOO_MANY_REQUESTS")).toBe(true);
		expect(shouldLogTrpcError("PAYLOAD_TOO_LARGE")).toBe(true);
	});

	it("skips normal client / auth codes", () => {
		expect(shouldLogTrpcError("BAD_REQUEST")).toBe(false);
		expect(shouldLogTrpcError("UNAUTHORIZED")).toBe(false);
		expect(shouldLogTrpcError("FORBIDDEN")).toBe(false);
		expect(shouldLogTrpcError("NOT_FOUND")).toBe(false);
		expect(shouldLogTrpcError("CONFLICT")).toBe(false);
	});
});

describe("recordTrpcApiError", () => {
	it("persists INTERNAL_SERVER_ERROR with userId from ctx", async () => {
		const user = await createTestUser();
		const created = await recordTrpcApiError({
			error: new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "hook-persist-test",
			}),
			path: "cv.save",
			ctx: {
				prisma: prismaTest,
				session: {
					user: { id: user.id, email: user.email },
				},
			},
		});

		expect(created?.id).toBeTruthy();
		const row = await prismaTest.apiErrorEvent.findUniqueOrThrow({
			where: { id: created!.id },
		});
		expect(row.path).toBe("cv.save");
		expect(row.code).toBe("INTERNAL_SERVER_ERROR");
		expect(row.message).toBe("hook-persist-test");
		expect(row.userId).toBe(user.id);
	});

	it("skips BAD_REQUEST without writing", async () => {
		const before = await prismaTest.apiErrorEvent.count();
		const created = await recordTrpcApiError({
			error: new TRPCError({
				code: "BAD_REQUEST",
				message: "should-not-log",
			}),
			path: "cv.save",
			ctx: undefined,
		});
		expect(created).toBeNull();
		const after = await prismaTest.apiErrorEvent.count();
		expect(after).toBe(before);
	});

	it("persists anonymous errors when no session", async () => {
		const created = await recordTrpcApiError({
			error: new TRPCError({
				code: "TOO_MANY_REQUESTS",
				message: "gemini 429",
			}),
			path: "ai.reviewCv",
			ctx: { prisma: prismaTest, session: null },
		});

		expect(created?.id).toBeTruthy();
		const row = await prismaTest.apiErrorEvent.findUniqueOrThrow({
			where: { id: created!.id },
		});
		expect(row.userId).toBeNull();
		expect(row.code).toBe("TOO_MANY_REQUESTS");
	});
});
