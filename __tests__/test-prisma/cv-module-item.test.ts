import { describe, it, expect } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import { createTestModule } from "../utils/create-test-module";

describe("CvModule model", () => {
	//? 10 tests pour le model CVModuleItem => 10 tests ok
	//   model CVModuleItem {
	//     id         String @id @default(cuid())
	//     moduleId   String
	//     module     CVModule @relation(fields: [moduleId], references: [id], onDelete: Cascade)

	//     itemType   CVModuleItemType
	//     itemId     String   // id du cvSkill / Experience / Education

	//     @@index([moduleId])
	//     @@index([itemType, itemId])
	//   }

	//! 1- CREATE TESTS
	describe("CREATE", () => {
		// 1-1: créer un item pour un module
		it("should create a module item", async () => {
			const { module } = await createTestModule();

			const item = await prismaTest.cVModuleItem.create({
				data: {
					moduleId: module.id,
					itemType: "cvSkillGroup",
					itemId: "cvSkillGroup-test-id",
				},
			});

			expect(item.itemType).toBe("cvSkillGroup");
			expect(item.moduleId).toBe(module.id);
			expect(item.itemId).toBe("cvSkillGroup-test-id");
		});

		// 1-2: créer plusieurs items dans un module
		it("should create multiple items in a module", async () => {
			const { module } = await createTestModule();

			const item1 = await prismaTest.cVModuleItem.create({
				data: {
					moduleId: module.id,
					itemType: "cvSkillGroup",
					itemId: "item1",
				},
			});

			const item2 = await prismaTest.cVModuleItem.create({
				data: {
					moduleId: module.id,
					itemType: "cvSkillGroup",
					itemId: "item2",
				},
			});

			const items = await prismaTest.cVModuleItem.findMany({
				where: { moduleId: module.id },
				orderBy: { itemId: "asc" },
			});

			expect(items.length).toBe(2);
			expect(items.map((i) => i.itemId)).toEqual(["item1", "item2"]);
		});
	});

	//! 2- CREATE ERROR TESTS
	describe("CREATE ERRORS", () => {
		// 2-1: ne pas pouvoir créer un item sans module
		it("should not create item without module", async () => {
			await expect(
				prismaTest.cVModuleItem.create({
					data: {
						moduleId: "fake",
						itemType: "cvSkillGroup",
						itemId: "cvSkillGroup-test-id",
					},
				}),
			).rejects.toThrow();
		});

		// 2-2: ne pas pouvoir créer un item sans itemId
		it("should not create item without itemId", async () => {
			const { module } = await createTestModule();
			await expect(
				prismaTest.cVModuleItem.create({
					// @ts-expect-error itemId required
					data: { moduleId: module.id, itemType: "cvSkillGroup" },
				}),
			).rejects.toThrow();
		});

		// 2-3: ne pas pouvoir créer un item avec un itemType invalide
		it("should not create item with invalid itemType", async () => {
			const { module } = await createTestModule();
			await expect(
				prismaTest.cVModuleItem.create({
					data: {
						moduleId: module.id,
						// @ts-expect-error invalid itemType
						itemType: "invalidType",
						itemId: "test-id",
					},
				}),
			).rejects.toThrow();
		});
	});

	//! 3- RELATION TESTS
	describe("RELATIONS", () => {
		it("should find items by itemType and itemId", async () => {
			const { module } = await createTestModule();

			await prismaTest.cVModuleItem.create({
				data: {
					moduleId: module.id,
					itemType: "cvSkillGroup",
					itemId: "cvSkillGroup-test-id",
				},
			});

			const items = await prismaTest.cVModuleItem.findMany({
				where: {
					itemType: "cvSkillGroup",
					itemId: "cvSkillGroup-test-id",
				},
			});

			expect(items.length).toBe(1);
		});

		// 3-2: lier un item à un module
		it("should link module item to the correct module", async () => {
			const { module } = await createTestModule();

			const item = await prismaTest.cVModuleItem.create({
				data: {
					moduleId: module.id,
					itemType: "cvSkillGroup",
					itemId: "item1",
				},
			});

			const fetchedItem = await prismaTest.cVModuleItem.findUnique({
				where: { id: item.id },
				include: { module: true },
			});

			expect(fetchedItem!.module.id).toBe(module.id);
		});

		// 3-3: permettre plusieurs items avec le même itemType dans différents modules
		it("should allow multiple items with same itemType in different modules", async () => {
			const { module: module1 } = await createTestModule();
			const { module: module2 } = await createTestModule();

			await prismaTest.cVModuleItem.create({
				data: {
					moduleId: module1.id,
					itemType: "cvSkillGroup",
					itemId: "item1",
				},
			});

			await prismaTest.cVModuleItem.create({
				data: {
					moduleId: module2.id,
					itemType: "cvSkillGroup",
					itemId: "item1",
				},
			});

			const items = await prismaTest.cVModuleItem.findMany({
				where: { itemType: "cvSkillGroup", itemId: "item1" },
			});

			expect(items.length).toBe(2);
			expect(items.map((i) => i.moduleId)).toEqual([module1.id, module2.id]);
		});
	});

	//! 4- DELETE TESTS
	describe("DELETE", () => {
		// 4-1: supprimer un item
		it("should delete a module item", async () => {
			const { module } = await createTestModule();

			const item = await prismaTest.cVModuleItem.create({
				data: {
					moduleId: module.id,
					itemType: "cvSkillGroup",
					itemId: "item1",
				},
			});

			await prismaTest.cVModuleItem.delete({ where: { id: item.id } });

			const items = await prismaTest.cVModuleItem.findMany({
				where: { moduleId: module.id },
			});
			expect(items.length).toBe(0);
		});

		// 4-2: supprimer les items d'un module
		it("should delete items when module is deleted", async () => {
			const { module } = await createTestModule();

			await prismaTest.cVModuleItem.create({
				data: {
					moduleId: module.id,
					itemType: "cvSkillGroup",
					itemId: "item1",
				},
			});

			await prismaTest.cVModule.delete({ where: { id: module.id } });

			const items = await prismaTest.cVModuleItem.findMany({
				where: { moduleId: module.id },
			});
			expect(items.length).toBe(0);
		});
	});
});
