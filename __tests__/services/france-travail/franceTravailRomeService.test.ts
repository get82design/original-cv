import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	clearRomeFicheCache,
	franceTravailRomeService,
} from "../../../src/services/france-travail/franceTravailRomeService";
import * as client from "../../../src/services/france-travail/franceTravailClient";
import { TooManyRequestsError, ValidationError } from "../../../src/services/errors";

describe("franceTravailRomeService", () => {
	beforeEach(() => {
		clearRomeFicheCache();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		clearRomeFicheCache();
	});

	it("searchAppellations mappe les hits", async () => {
		vi.spyOn(client, "franceTravailGetJson").mockResolvedValue({
			totalResultats: 1,
			resultats: [
				{
					code: "10868",
					libelle: "Développeur / Développeuse informatique",
					metier: { code: "M1805", libelle: "Études et développement informatique" },
				},
			],
		});

		const result = await franceTravailRomeService.searchAppellations({ q: "dev" });
		expect(result.hits).toHaveLength(1);
		expect(result.hits[0]?.codeRome).toBe("M1805");
		expect(client.franceTravailGetJson).toHaveBeenCalledWith(
			expect.objectContaining({
				path: "/rome-metiers/v1/metiers/appellation/requete",
				scopeKind: "metiers",
			}),
		);
	});

	it("searchAppellations refuse une query trop courte", async () => {
		await expect(
			franceTravailRomeService.searchAppellations({ q: "a" }),
		).rejects.toBeInstanceOf(ValidationError);
	});

	it("getFicheByCodeRome fusionne métier + fiche et cache", async () => {
		const spy = vi.spyOn(client, "franceTravailGetJson").mockImplementation(async (opts) => {
			if (opts.path.includes("/metiers/metier/")) {
				return {
					code: "M1805",
					libelle: "Études et développement informatique",
					definition: "Def",
					acces: "Bac+5",
				};
			}
			return {
				metier: { code: "M1805", libelle: "Études et développement informatique" },
				groupesCompetencesMobilisees: [
					{ competences: [{ libelle: "Coder" }] },
				],
				groupesSavoirs: [{ savoirs: [{ libelle: "SQL" }] }],
			};
		});

		const first = await franceTravailRomeService.getFicheByCodeRome("m1805");
		expect(first.codeRome).toBe("M1805");
		expect(first.competences[0]?.libelle).toBe("Coder");
		expect(spy).toHaveBeenCalledTimes(2);

		const second = await franceTravailRomeService.getFicheByCodeRome("M1805");
		expect(second.libelle).toBe(first.libelle);
		expect(spy).toHaveBeenCalledTimes(2);
	});

	it("getFicheByCodeRome retry séquentiel après 429 parallèle", async () => {
		let calls = 0;
		vi.spyOn(client, "franceTravailGetJson").mockImplementation(async () => {
			calls += 1;
			if (calls <= 2) {
				throw new TooManyRequestsError();
			}
			if (calls === 3) {
				return { code: "M1805", libelle: "Dev", definition: "D" };
			}
			return {
				metier: { code: "M1805" },
				groupesCompetencesMobilisees: [],
				groupesSavoirs: [],
			};
		});

		const dto = await franceTravailRomeService.getFicheByCodeRome("M1805", {
			bypassCache: true,
		});
		expect(dto.codeRome).toBe("M1805");
		expect(calls).toBeGreaterThanOrEqual(4);
	});
});
