import { describe, it, expect } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import { createModuleWithItem } from "../utils/create-test-module-with-item";
import { createTestCV } from "../utils/create-test-cv";
import { createTestUserWithTemplateAndCV } from "../utils/create-test-user-with-template-and-cv";
import { createCVWithModules } from "../utils/create-test-cv-with-module";

describe("CvModule model", () => {
	//? 12 tests pour le model CVModule => 12 tests ok
	//   model CVModule {
	//     id       String @id @default(cuid())
	//     title    String?          // titre du module, optionnel
	//     type     CVModuleType     // type du module : "skill", "experience", "education"
	//     order    Int @default(0)  // position dans le CV
	//     cvId     String
	//     cv       CV               @relation(fields: [cvId], references: [id], onDelete: Cascade)
	//     items    CVModuleItem[]   // items liés au module
	//     settings Json?            // personnalisations spécifiques : fontSize, color, align, show, etc.

	//     @@unique([cvId, order]) // pas de doublon dans un cv
	//     @@index([cvId])
	//   }

	//! 1- CREATE TESTS
	describe("CREATE", () => {
		// 1-1: créer un module pour un CV
		it("should create a module for a CV", async () => {
			const { user, template } = await createTestUserWithTemplateAndCV();

			const cv = await prismaTest.cV.create({
				data: {
					title: "My CV",
					userId: user.id,
					templateId: template.id,
				},
			});

			const module = await prismaTest.cVModule.create({
				data: {
					type: "skill",
					order: 1,
					cvId: cv.id,
				},
			});

			expect(module.type).toBe("skill");
			expect(module.order).toBe(1);
		});

		// 1-2: créer un module sans title et order (utiliser les valeurs par défaut)
		it("should create module without title and order (use defaults)", async () => {
			const { cv } = await createTestCV();
			const module = await prismaTest.cVModule.create({
				data: { type: "skill", cvId: cv.id },
			});
			expect(module.title).toBeNull();
			expect(module.order).toBe(0);
		});

		// 1-3: créer un module default isActive
		it("should create module with default isActive", async () => {
			const { cv } = await createTestCV();
			const module = await prismaTest.cVModule.create({
				data: { type: "skill", cvId: cv.id },
			});
			expect(module.isActive).toBe(true);
		});
	});

	//! 2- CREATE ERROR TESTS
	describe("CREATE ERRORS", () => {
		// 2-1: ne pas pouvoir créer un module sans CV
		it("should not create module without cv", async () => {
			await expect(
				prismaTest.cVModule.create({
					data: {
						type: "skill",
						order: 1,
						cvId: "non-existing",
					},
				}),
			).rejects.toThrow();
		});

		// 2-2: ne pas pouvoir créer un module avec un order duplicate pour le même CV
		it("should not allow duplicate order for same CV", async () => {
			const { cv } = await createTestCV();

			await prismaTest.cVModule.create({
				data: { type: "skill", order: 1, cvId: cv.id },
			});

			await expect(
				prismaTest.cVModule.create({
					data: { type: "experience", order: 1, cvId: cv.id },
				}),
			).rejects.toThrow();
		});

		// 2-3: ne pas pouvoir créer un module avec un type duplicate pour le même CV
		it("should not allow duplicate type for same CV", async () => {
			const { cv } = await createTestCV();
			await prismaTest.cVModule.create({
				data: { type: "skill", order: 1, cvId: cv.id },
			});
			await expect(
				prismaTest.cVModule.create({ data: { type: "skill", order: 2, cvId: cv.id } }),
			).rejects.toThrow();
		});
	});

	//! 3- UPDATE TESTS
	describe("UPDATE", () => {
		// 3-1: mettre à jour un module avec un order différent
		it("should update module with different order", async () => {
			const { module1 } = await createCVWithModules();
			const updated = await prismaTest.cVModule.update({
				where: { id: module1.id },
				data: { order: 3 },
			});
			expect(updated.order).toBe(3);
		});

		// 3-3: mettre à jour un module avec un settings différent
		it("should update module with different settings", async () => {
			const { module1 } = await createCVWithModules();
			const updated = await prismaTest.cVModule.update({
				where: { id: module1.id },
				data: { settings: { fontSize: 16 } },
			});
			expect(updated.settings).toEqual({ fontSize: 16 });
		});

		// 3-4: mettre à jour uniquement le title sans affecter les autres champs
		it("should update only title without affecting other fields", async () => {
			const { module1 } = await createCVWithModules();
			const updated = await prismaTest.cVModule.update({
				where: { id: module1.id },
				data: { title: "New Title" },
			});
			expect(updated.title).toBe("New Title");
			expect(updated.type).toBe(module1.type);
			expect(updated.order).toBe(module1.order);
		});
	});

	//! 4- UPDATE ERROR TESTS
	describe("UPDATE ERRORS", () => {
		// 4-1: ne pas pouvoir mettre à jour un module avec un order duplicate
		it("should not update to duplicate order", async () => {
			const { cv } = await createTestCV();

			await prismaTest.cVModule.create({
				data: { type: "skill", order: 1, cvId: cv.id },
			});

			const m2 = await prismaTest.cVModule.create({
				data: { type: "experience", order: 2, cvId: cv.id },
			});

			await expect(
				prismaTest.cVModule.update({
					where: { id: m2.id },
					data: { order: 1 },
				}),
			).rejects.toThrow();
		});

		// 3-2: ne pas pouvoir mettre à jour un module avec un type différent
		it("should not update module with different type", async () => {
			const { module1 } = await createCVWithModules();
			await expect(
				prismaTest.cVModule.update({
					where: { id: module1.id },
					data: { type: "experience" },
				}),
			).rejects.toThrow();
		});
	});

	//! 5- DELETE TESTS
	describe("DELETE", () => {
		// 5-1: supprimer les items d'un module
		it("should delete module items when module is deleted", async () => {
			const { module } = await createModuleWithItem();

			await prismaTest.cVModule.delete({
				where: { id: module.id },
			});

			const items = await prismaTest.cVModuleItem.findMany({
				where: { moduleId: module.id },
			});

			expect(items.length).toBe(0);
		});

		// 5-2: supprimer les modules d'un CV
		it("should delete modules when CV is deleted", async () => {
			const { cv } = await createTestCV();

			await prismaTest.cVModule.create({
				data: { type: "skill", order: 1, cvId: cv.id },
			});

			await prismaTest.cV.delete({
				where: { id: cv.id },
			});

			const modules = await prismaTest.cVModule.findMany({
				where: { cvId: cv.id },
			});

			expect(modules.length).toBe(0);
		});
	});

	//! 6- RELATION TESTS
	describe("RELATIONS", () => {
		// 6-1: inclure les items lors de la récupération d'un module
		it("should include items when fetching module", async () => {
			const { module } = await createModuleWithItem();
			const fetched = await prismaTest.cVModule.findUnique({
				where: { id: module.id },
				include: { items: true },
			});
			expect(fetched!.items.length).toBeGreaterThan(0);
		});
	});
});
