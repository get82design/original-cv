import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextApiRequest, NextApiResponse } from "next";

const getServerSessionMock = vi.fn();

vi.mock("next-auth", () => ({
	getServerSession: (...args: unknown[]) => getServerSessionMock(...args),
}));

// mock léger : évite de charger toute la config auth réelle
vi.mock("../../server/auth", () => ({
	authOptions: { providers: [] },
}));

import { createTRPCContext } from "../../server/api/context";
// import { authOptions } from "../../server/auth";

describe("createTRPCContext", () => {
	beforeEach(() => {
		getServerSessionMock.mockReset();
	});

	it("uses injected session when provided (tests path)", async () => {
		const session = {
			user: { id: "u1", email: "a@b.c", name: null },
		};

		const ctx = await createTRPCContext({ session });

		expect(ctx.session).toEqual(session);
		expect(getServerSessionMock).not.toHaveBeenCalled();
	});

	it("reads session via getServerSession when req/res are provided", async () => {
		const fakeSession = {
			user: { id: "u2", email: "x@y.z", name: "X" },
		};
		getServerSessionMock.mockResolvedValue(fakeSession);

		const req = {} as NextApiRequest;
		const res = {} as NextApiResponse;

		vi.resetModules();
		// remocker après reset (sinon le mock est perdu)
		vi.doMock("next-auth", () => ({
			getServerSession: (...args: unknown[]) => getServerSessionMock(...args),
		}));
		vi.doMock("../../server/auth", () => ({
			authOptions: { providers: [] },
		}));

		const { createTRPCContext } = await import("../../server/api/context");
		const { authOptions } = await import("../../server/auth");

		const ctx = await createTRPCContext({ req, res });

		expect(getServerSessionMock).toHaveBeenCalledTimes(1);
		expect(getServerSessionMock).toHaveBeenCalledWith(req, res, authOptions);
		expect(ctx.session).toEqual(fakeSession);
	});

	it("returns null session when neither session nor req/res are provided", async () => {
		const ctx = await createTRPCContext();

		expect(ctx.session).toBeNull();
		expect(getServerSessionMock).not.toHaveBeenCalled();
	});
});
