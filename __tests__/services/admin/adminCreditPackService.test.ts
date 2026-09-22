import { describe, expect, it } from "vitest";
import { prismaTest } from "../../../lib/prismaTest";
import { adminCreditPackService } from "../../../src/services/admin/adminCreditPackService";
import { NotFoundError, ValidationError } from "../../../src/services/errors";

describe("adminCreditPackService", () => {
	it("createPack rejects empty name", async () => {
		await expect(
			adminCreditPackService.createPack({
				name: "   ",
				priceCents: 100,
				downloadCredits: 1,
			}),
		).rejects.toBeInstanceOf(ValidationError);
		await expect(
			adminCreditPackService.createPack({
				name: "   ",
				priceCents: 100,
				downloadCredits: 1,
			}),
		).rejects.toMatchObject({ message: "Le nom du pack est requis" });
	});

	it("createPack rejects negative price", async () => {
		await expect(
			adminCreditPackService.createPack({
				name: "Bad price",
				priceCents: -1,
				downloadCredits: 1,
			}),
		).rejects.toMatchObject({ message: "Le prix doit être ≥ 0" });
	});

	it("createPack rejects downloadCredits < 1", async () => {
		await expect(
			adminCreditPackService.createPack({
				name: "No credits",
				priceCents: 100,
				downloadCredits: 0,
			}),
		).rejects.toMatchObject({
			message: "Au moins 1 crédit payant requis",
		});
	});

	it("createPack rejects negative freeDownloads", async () => {
		await expect(
			adminCreditPackService.createPack({
				name: "Bad free",
				priceCents: 100,
				downloadCredits: 1,
				freeDownloads: -1,
			}),
		).rejects.toMatchObject({ message: "freeDownloads doit être ≥ 0" });
	});

	it("updatePack rejects unknown id", async () => {
		await expect(
			adminCreditPackService.updatePack("missing-pack-id", {
				name: "x",
			}),
		).rejects.toBeInstanceOf(NotFoundError);
	});

	it("deletePack rejects unknown id", async () => {
		await expect(
			adminCreditPackService.deletePack("missing-pack-id"),
		).rejects.toBeInstanceOf(NotFoundError);
	});

	it("updatePack re-validates merged fields", async () => {
		const created = await adminCreditPackService.createPack({
			name: "Valid pack",
			priceCents: 199,
			downloadCredits: 2,
		});

		await expect(
			adminCreditPackService.updatePack(created.id, { name: "  " }),
		).rejects.toMatchObject({ message: "Le nom du pack est requis" });

		await prismaTest.creditPack.delete({ where: { id: created.id } });
	});
});
