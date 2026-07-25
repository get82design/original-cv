import { describe, expect, it } from "vitest";
import { competenceService } from "../../../src/services/commons/competenceService";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { cvService } from "../../../src/services/cv/cvService";
import { createTestUser } from "../../utils/create-test-user";
import { createTestTemplate } from "../../utils/create-test-template";
import { cvCompetenceService } from "../../../src/services/cv/cvCompetenceService";
import { cvCompetenceGroupService } from "../../../src/services/cv/cvCompetenceGroupService";

describe("CompetenceService.create", () => {
	it("creates a competence", async () => {
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		expect(competence.name).toBe("Competence 1");
	});

	it("returns existing competence if it already exists", async () => {
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		const existingCompetence = await competenceService.create({
			name: "Competence 1",
		});
		expect(existingCompetence.id).toBe(competence.id);
	});

	it("trims and lowercases competence name", async () => {
		const competence = await competenceService.create({
			name: " React ",
		});

		expect(competence.name).toBe("React");
	});
});

describe("CompetenceService.findAll", () => {
	it("returns all skills sorted by name", async () => {
		await competenceService.create({
			name: "Competence 1",
		});
		await competenceService.create({
			name: "Experience 2",
		});
		await competenceService.create({
			name: "Competence 3",
		});
		const competencies = await competenceService.findAll();
		expect(competencies).toHaveLength(3);
		expect(competencies[0]!.name).toBe("Competence 1");
		expect(competencies[1]!.name).toBe("Competence 3");
		expect(competencies[2]!.name).toBe("Experience 2");
	});

	it("returns empty array if no competence exists", async () => {
		const result = await competenceService.findAll();

		expect(result).toEqual([]);
	});
});

describe("CompetenceService.update", () => {
	it("updates a competence", async () => {
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		const updatedCompetence = await competenceService.update(competence.id, {
			name: "Competence 2",
		});
		expect(updatedCompetence.name).toBe("Competence 2");
	});

	it("throws if competence does not exist", async () => {
		await expect(
			competenceService.update("unknown-id", {
				name: "React",
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if new name already exists", async () => {
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		await competenceService.create({
			name: "Competence 2",
		});
		await expect(
			competenceService.update(competence.id, {
				name: "Competence 2",
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("CompetenceService.delete", () => {
	it("deletes a competence", async () => {
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		await competenceService.delete(competence.id);
		const competencies = await competenceService.findAll();
		expect(competencies).toHaveLength(0);
	});

	it("throws if competence does not exist", async () => {
		await expect(competenceService.delete("unknown-id")).rejects.toThrow(
			NotFoundError,
		);
	});

	it("throws if competence is used", async () => {
		const competence = await competenceService.create({
			name: "React",
		});

		const user = await createTestUser();
		const template = await createTestTemplate();

		const cv = await cvService.create({
			userId: user.id,
			templateId: template.id,
			title: "Mon CV",
		});

		const group = await cvCompetenceGroupService.create(cv.id, {
			title: "Group 1",
			order: 1,
			competences: [],
		});

		await cvCompetenceService.create(group.id, {
			competenceId: competence.id,
			order: 1,
		});

		await expect(competenceService.delete(competence.id)).rejects.toThrow(
			ConflictError,
		);
	});
});
