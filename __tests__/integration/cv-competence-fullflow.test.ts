import { describe, it, expect } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import * as utils from "../utils/create-test-cv-full-flow";

describe("CV Fullflow Integration with competences", () => {
	it("should create a CV with competence group and competences", async () => {
		const { user, template } = await utils.createUserAndTemplate();
		const cv = await utils.createCV(user.id, template.id);
		const competenceGroup = await utils.createCompetenceGroup(
			cv.id,
			"competences",
			1,
		);
		const competence = await utils.createCompetence("JavaScript");
		await utils.addCompetenceToGroup(competence.id, competenceGroup.id);

		const dbCV = await prismaTest.cV.findUnique({
			where: { id: cv.id },
			include: {
				competences: {
					include: { cvCompetences: { include: { competence: true } } },
				},
			},
		});

		expect(dbCV!.competences[0]!.cvCompetences[0]!.competence.name).toBe(
			"JavaScript",
		);
	});

	it("should cascade delete CV modules and items", async () => {
		const { user, template } = await utils.createUserAndTemplate(
			"delete@fullflow.com",
		);
		const cv = await utils.createCV(user.id, template.id);
		const competenceGroup = await utils.createCompetenceGroup(
			cv.id,
			"competences",
			1,
		);
		const competence = await utils.createCompetence("TypeScript");
		await utils.addCompetenceToGroup(competence.id, competenceGroup.id);

		await prismaTest.cV.delete({ where: { id: cv.id } });

		const dbModules = await prismaTest.cvCompetenceGroup.findMany({
			where: { cvId: cv.id },
		});
		const dbcompetences = await prismaTest.cvCompetence.findMany();
		expect(dbModules.length).toBe(0);
		expect(dbcompetences.length).toBe(0);
	});
});
