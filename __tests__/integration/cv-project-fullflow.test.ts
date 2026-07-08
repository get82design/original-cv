import { describe, it, expect } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import * as utils from "../utils/create-test-cv-full-flow";

describe("CV Fullflow Integration with price", () => {
	it("should create a CV with project with all fields", async () => {
		const { user, template } = await utils.createUserAndTemplate();
		const cv = await utils.createCV(user.id, template.id);
		const start = new Date();
		const end = new Date();
		const project = await utils.createProject(
			cv.id,
			"Project 1",
			start,
			1,
			"Description 1",
			"Location 1",
			"Technology 1",
			end,
		);
		expect(project.cvId).toBe(cv.id);
		expect(project.title).toBe("Project 1");
		expect(project.description).toBe("Description 1");
		expect(project.location).toBe("Location 1");
		expect(project.technology).toBe("Technology 1");
		expect(project.start).toEqual(start);
		expect(project.end).toEqual(end);
		expect(project.order).toBe(1);
	});

	it("should create a CV with project with optional fields", async () => {
		const { user, template } = await utils.createUserAndTemplate();
		const cv = await utils.createCV(user.id, template.id);
		const start = new Date();
		const project = await utils.createProject(cv.id, "Project 1", start, 1);
		expect(project.cvId).toBe(cv.id);
		expect(project.title).toBe("Project 1");
		expect(project.description).toBeNull();
		expect(project.location).toBeNull();
		expect(project.technology).toBeNull();
		expect(project.start).toEqual(start);
		expect(project.order).toBe(1);
		expect(project.end).toBeNull();
	});

	it("should delete a CV with project", async () => {
		const { user, template } = await utils.createUserAndTemplate();
		const cv = await utils.createCV(user.id, template.id);
		const project = await utils.createProject(
			cv.id,
			"Project 1",
			new Date(),
			1,
			"Description 1",
			"Location 1",
			"Technology 1",
			new Date(),
		);
		await prismaTest.cV.delete({ where: { id: cv.id } });
		const projectAfterDelete = await prismaTest.cvProject.findUnique({
			where: { id: project.id },
		});
		expect(projectAfterDelete).toBeNull();
	});
});
