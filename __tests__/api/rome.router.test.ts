import { afterEach, describe, expect, it, vi } from "vitest";
import { franceTravailRomeService } from "../../src/services/france-travail/franceTravailRomeService";
import { createTestUser } from "../utils/create-test-user";
import { createTestCaller, createTestSession } from "./helpers/create-test-caller";

describe("rome.router", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("searchAppellations délègue au service", async () => {
		const user = await createTestUser();
		vi.spyOn(franceTravailRomeService, "searchAppellations").mockResolvedValue({
			total: 1,
			hits: [
				{
					appellationCode: "10868",
					appellationLibelle: "Développeur / Développeuse informatique",
					codeRome: "M1805",
					libelleRome: "Études et développement informatique",
				},
			],
		});

		const caller = await createTestCaller(createTestSession(user));
		const result = await caller.rome.searchAppellations({ q: "dev" });

		expect(result.hits[0]?.codeRome).toBe("M1805");
		expect(franceTravailRomeService.searchAppellations).toHaveBeenCalledWith({
			q: "dev",
		});
	});

	it("getFiche délègue au service", async () => {
		const user = await createTestUser();
		vi.spyOn(franceTravailRomeService, "getFicheByCodeRome").mockResolvedValue({
			codeRome: "M1805",
			libelle: "Études et développement informatique",
			definition: "Def",
			competences: [],
			savoirs: [],
		});

		const caller = await createTestCaller(createTestSession(user));
		const result = await caller.rome.getFiche({ codeRome: "M1805" });

		expect(result.codeRome).toBe("M1805");
		expect(franceTravailRomeService.getFicheByCodeRome).toHaveBeenCalledWith("M1805");
	});

	it("refuse searchAppellations sans session", async () => {
		const caller = await createTestCaller(null);
		await expect(caller.rome.searchAppellations({ q: "dev" })).rejects.toThrow();
	});
});
