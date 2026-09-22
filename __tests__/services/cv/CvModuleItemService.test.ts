import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import { cvModuleService } from "../../../src/services/cv/cvModuleService";
import { CVModuleItemType, CVModuleType, Level } from "../../../generated/prisma/enums";
import { cvModuleItemService } from "../../../src/services/cv/cvModuleItemService";
import { createCV } from "../../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../../utils/create-test-template";
import { cvDescriptionService } from "../../../src/services/cv/cvDescriptionService";
import { ConflictError, NotFoundError, ValidationError } from "../../../src/services/errors";
import { cvPhilosophyService } from "../../../src/services/cv/cvPhilosophyService";
import { cvCompetenceGroupService } from "../../../src/services/cv/cvCompetenceGroupService";
import { cvPassionService } from "../../../src/services/cv/cvPassionService";
import { cvLanguageService } from "../../../src/services/cv/cvLanguageService";
import { cvPrizeService } from "../../../src/services/cv/cvPrizeService";
import { cvCertificationService } from "../../../src/services/cv/cvCertificationService";
import { cvFormationService } from "../../../src/services/cv/cvFormationService";
import { cvExpertiseService } from "../../../src/services/cv/cvExpertiseService";
import { cvAchievementService } from "../../../src/services/cv/cvAchievementService";
import { cvPublicationService } from "../../../src/services/cv/cvPublicationService";
import { cvVolunteeringService } from "../../../src/services/cv/cvVolunteeringService";
import { cvProjectService } from "../../../src/services/cv/cvProjectService";
import { cvEducationService } from "../../../src/services/cv/cvEducationService";
import { cvExperienceService } from "../../../src/services/cv/cvExperienceService";
import { cvSkillGroupService } from "../../../src/services/cv/cvSkillGroupService";
import { expectMoveNoOp } from "../../utils/move-noop";

type Case = {
	type: CVModuleItemType;
	createItem: (cvId: string) => Promise<{ id: string }>;
};
const cases: Case[] = [
	{
		type: CVModuleItemType.cvDescription,
		createItem: (cvId) => cvDescriptionService.create(cvId, { description: "Desc" }),
	},
	{
		type: CVModuleItemType.cvPhilosophy,
		createItem: (cvId) => cvPhilosophyService.create(cvId, { citation: "Cite" }),
	},
	{
		type: CVModuleItemType.cvSkillGroup,
		createItem: (cvId) =>
			cvSkillGroupService.create(cvId, {
				title: "Skills",
				order: 1,
				skills: [],
			}),
	},
	{
		type: CVModuleItemType.cvExperience,
		createItem: (cvId) =>
			cvExperienceService.create(cvId, {
				title: "Dev",
				company: "Acme",
				start: new Date("2020-01-01"),
				missions: [],
				order: 1,
			}),
	},
	{
		type: CVModuleItemType.cvEducation,
		createItem: (cvId) =>
			cvEducationService.create(cvId, {
				school: "Acme",
				degree: "Bachelor",
				title: "Education",
				start: new Date("2020-01-01"),
				order: 1,
			}),
	},
	{
		type: CVModuleItemType.cvProject,
		createItem: (cvId) =>
			cvProjectService.create(cvId, {
				title: "Project",
				description: "Description",
				start: new Date("2020-01-01"),
				order: 1,
			}),
	},
	{
		type: CVModuleItemType.cvVolunteering,
		createItem: (cvId) =>
			cvVolunteeringService.create(cvId, {
				title: "Volunteering",
				description: "Description",
				start: new Date("2020-01-01"),
				end: new Date("2020-01-01"),
				organisation: "Acme",
				missions: [],
				order: 1,
			}),
	},
	{
		type: CVModuleItemType.cvPublication,
		createItem: (cvId) =>
			cvPublicationService.create(cvId, {
				title: "Publication",
				description: "Description",
				start: new Date("2020-01-01"),
				order: 1,
			}),
	},
	{
		type: CVModuleItemType.cvAchievement,
		createItem: (cvId) =>
			cvAchievementService.create(cvId, {
				title: "Achievement",
				description: "Description",
				order: 1,
			}),
	},
	{
		type: CVModuleItemType.cvExpertise,
		createItem: (cvId) =>
			cvExpertiseService.create(cvId, {
				title: "Expertise",
				level: Level.Débutant,
				order: 1,
			}),
	},
	{
		type: CVModuleItemType.cvFormation,
		createItem: (cvId) =>
			cvFormationService.create(cvId, {
				title: "Formation",
				start: new Date("2020-01-01"),
				order: 1,
			}),
	},
	{
		type: CVModuleItemType.cvCertification,
		createItem: (cvId) =>
			cvCertificationService.create(cvId, {
				title: "Certification",
				organismeCertification: "Acme",
				order: 1,
			}),
	},
	{
		type: CVModuleItemType.cvPrize,
		createItem: (cvId) =>
			cvPrizeService.create(cvId, {
				title: "Prize",
				domaine: "Acme",
				order: 1,
			}),
	},
	{
		type: CVModuleItemType.cvLanguage,
		createItem: (cvId) =>
			cvLanguageService.create(cvId, {
				name: "French",
				level: Level.Débutant,
				order: 1,
			}),
	},
	{
		type: CVModuleItemType.cvPassion,
		createItem: (cvId) =>
			cvPassionService.create(cvId, {
				title: "Passion",
				icon: "🎨",
				order: 1,
			}),
	},
	{
		type: CVModuleItemType.cvCompetenceGroup,
		createItem: (cvId) =>
			cvCompetenceGroupService.create(cvId, {
				title: "Competence Group",
				order: 1,
				competences: [],
			}),
	},
];

describe("CvModuleItemService.create", () => {
	it("creates a module item", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const module = await cvModuleService.create(cv.id, {
			type: CVModuleType.description,
			title: "Description",
			column: 0,
			order: 1,
			settings: {},
			isActive: true,
		});
		const description = await cvDescriptionService.create(cv.id, {
			description: "Description",
		});
		const moduleItem = await cvModuleItemService.create(module.id, {
			itemType: CVModuleItemType.cvDescription,
			itemId: description.id,
			order: 1,
		});
		expect(moduleItem.moduleId).toBe(module.id);
		expect(moduleItem.itemType).toBe(CVModuleItemType.cvDescription);
		expect(moduleItem.itemId).toBe(description.id);
		expect(moduleItem.order).toBe(1);
	});

	it("throws if module does not exist", async () => {
		await expect(
			cvModuleItemService.create("unknown-module", {
				itemType: CVModuleItemType.cvDescription,
				itemId: "1",
				order: 1,
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if referenced item does not exist", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const module = await cvModuleService.create(cv.id, {
			type: CVModuleType.description,
			title: "Description",
			column: 0,
			order: 1,
			settings: {},
			isActive: true,
		});
		await expect(
			cvModuleItemService.create(module.id, {
				itemType: CVModuleItemType.cvDescription,
				itemId: "unknown-item",
				order: 1,
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if item already exists in module", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const module = await cvModuleService.create(cv.id, {
			type: CVModuleType.description,
			title: "Description",
			column: 0,
			order: 1,
			settings: {},
			isActive: true,
		});
		const description = await cvDescriptionService.create(cv.id, {
			description: "Description",
		});
		await cvModuleItemService.create(module.id, {
			itemType: CVModuleItemType.cvDescription,
			itemId: description.id,
			order: 1,
		});

		await expect(
			cvModuleItemService.create(module.id, {
				itemType: CVModuleItemType.cvDescription,
				itemId: description.id,
				order: 2,
			}),
		).rejects.toThrow(ConflictError);
	});

	it("throws if order already exists in module", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const module = await cvModuleService.create(cv.id, {
			type: CVModuleType.description,
			title: "Description",
			column: 0,
			order: 1,
			settings: {},
			isActive: true,
		});
		const description = await cvDescriptionService.create(cv.id, {
			description: "Description",
		});
		const philosophy = await cvPhilosophyService.create(cv.id, {
			citation: "Philosophy",
		});
		await cvModuleItemService.create(module.id, {
			itemType: CVModuleItemType.cvDescription,
			itemId: description.id,
			order: 1,
		});
		await expect(
			cvModuleItemService.create(module.id, {
				itemType: CVModuleItemType.cvPhilosophy,
				itemId: philosophy.id,
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});

	it.each(cases)("creates module item for $type", async ({ type, createItem }) => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const module = await cvModuleService.create(cv.id, {
			type: CVModuleType.description, // le type de module importe peu ici
			title: "Module",
			column: 0,
			order: 1,
			settings: {},
			isActive: true,
		});
		const item = await createItem(cv.id);
		const moduleItem = await cvModuleItemService.create(module.id, {
			itemType: type,
			itemId: item.id,
			order: 1,
		});
		expect(moduleItem.itemType).toBe(type);
		expect(moduleItem.itemId).toBe(item.id);
	});
});

describe("CvModuleItemService.findAllByModuleId", () => {
	it("returns items of a module", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const module = await cvModuleService.create(cv.id, {
			type: CVModuleType.description,
			title: "Description",
			column: 0,
			order: 1,
			settings: {},
			isActive: true,
		});
		const description = await cvDescriptionService.create(cv.id, {
			description: "Description",
		});
		await cvModuleItemService.create(module.id, {
			itemType: CVModuleItemType.cvDescription,
			itemId: description.id,
			order: 1,
		});
		const items = await cvModuleItemService.findAllByModuleId(module.id);
		expect(items.length).toBe(1);
		expect(items[0]!.moduleId).toBe(module.id);
		expect(items[0]!.itemType).toBe(CVModuleItemType.cvDescription);
		expect(items[0]!.itemId).toBe(description.id);
		expect(items[0]!.order).toBe(1);
	});

	it("returns empty array if no item exists", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const module = await cvModuleService.create(cv.id, {
			type: CVModuleType.description,
			title: "Description",
			column: 0,
			order: 1,
			settings: {},
			isActive: true,
		});
		const items = await cvModuleItemService.findAllByModuleId(module.id);
		expect(items.length).toBe(0);
		expect(items).toEqual([]);
	});

	it("does not return items from another module", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const module = await cvModuleService.create(cv.id, {
			type: CVModuleType.description,
			title: "Description",
			column: 0,
			order: 1,
			settings: {},
			isActive: true,
		});
		const module2 = await cvModuleService.create(cv.id, {
			type: CVModuleType.philosophy,
			title: "Philosophy 2",
			column: 0,
			order: 2,
			settings: {},
			isActive: true,
		});
		const description = await cvDescriptionService.create(cv.id, {
			description: "Description",
		});
		const moduleItem = await cvModuleItemService.create(module2.id, {
			itemType: CVModuleItemType.cvDescription,
			itemId: description.id,
			order: 1,
		});
		const items = await cvModuleItemService.findAllByModuleId(module.id);
		const items2 = await cvModuleItemService.findAllByModuleId(module2.id);
		expect(items.length).toBe(0);
		expect(items).toEqual([]);
		expect(items2.length).toBe(1);
		expect(items2).toEqual([moduleItem]);
	});
});

describe("CvModuleItemService.move", () => {
	it("moves a module item", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const module = await cvModuleService.create(cv.id, {
			type: CVModuleType.description,
			title: "Description",
			column: 0,
			order: 1,
			settings: {},
			isActive: true,
		});
		const description = await cvDescriptionService.create(cv.id, {
			description: "Description",
		});
		const philosophy = await cvPhilosophyService.create(cv.id, {
			citation: "Philosophy",
		});
		const moduleItem = await cvModuleItemService.create(module.id, {
			itemType: CVModuleItemType.cvDescription,
			itemId: description.id,
			order: 1,
		});
		const moduleItem2 = await cvModuleItemService.create(module.id, {
			itemType: CVModuleItemType.cvPhilosophy,
			itemId: philosophy.id,
			order: 2,
		});
		await cvModuleItemService.move(moduleItem2.id, 1);
		const items = await cvModuleItemService.findAllByModuleId(module.id);
		expect(items.length).toBe(2);
		expect(items[0]!.moduleId).toBe(module.id);
		expect(items[0]!.itemType).toBe(CVModuleItemType.cvPhilosophy);
		expect(items[0]!.itemId).toBe(philosophy.id);
		expect(items[0]!.order).toBe(1);
		expect(items[1]!.moduleId).toBe(module.id);
		expect(items[1]!.itemType).toBe(CVModuleItemType.cvDescription);
		expect(items[1]!.itemId).toBe(description.id);
		expect(items[1]!.order).toBe(2);
	});

	it("throws if module item does not exist", async () => {
		await expect(cvModuleItemService.move("unknown-module-item", 1)).rejects.toThrow(NotFoundError);
	});

	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const module = await cvModuleService.create(cv.id, {
			type: CVModuleType.description,
			title: "Description",
			column: 0,
			order: 1,
			settings: {},
			isActive: true,
		});
		const description = await cvDescriptionService.create(cv.id, {
			description: "Description",
		});
		const moduleItem = await cvModuleItemService.create(module.id, {
			itemType: CVModuleItemType.cvDescription,
			itemId: description.id,
			order: 1,
		});
		await expect(cvModuleItemService.move(moduleItem.id, 0)).rejects.toThrow(ValidationError);
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const module = await cvModuleService.create(cv.id, {
			type: CVModuleType.description,
			title: "Description",
			column: 0,
			order: 1,
			settings: {},
			isActive: true,
		});
		const description = await cvDescriptionService.create(cv.id, {
			description: "Description",
		});
		await expectMoveNoOp({
			createEntity: async () => {
				const item = await cvModuleItemService.create(module.id, {
					itemType: CVModuleItemType.cvDescription,
					itemId: description.id,
					order: 1,
				});
				return { id: item.id, order: item.order };
			},
			moveEntity: (id, order) => cvModuleItemService.move(id, order),
		});
	});
});

describe("CvModuleItemService.delete", () => {
	it("deletes a module item", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const module = await cvModuleService.create(cv.id, {
			type: CVModuleType.description,
			title: "Description",
			column: 0,
			order: 1,
			settings: {},
			isActive: true,
		});
		const description = await cvDescriptionService.create(cv.id, {
			description: "Description",
		});
		const moduleItem = await cvModuleItemService.create(module.id, {
			itemType: CVModuleItemType.cvDescription,
			itemId: description.id,
			order: 1,
		});
		await cvModuleItemService.delete(moduleItem.id);
		const items = await cvModuleItemService.findAllByModuleId(module.id);
		expect(items.length).toBe(0);
	});

	it("throws if module item does not exist", async () => {
		await expect(cvModuleItemService.delete("unknown-module-item")).rejects.toThrow(NotFoundError);
	});

	it("reorders remaining items after deletion", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const module = await cvModuleService.create(cv.id, {
			type: CVModuleType.description,
			title: "Description",
			column: 0,
			order: 1,
			settings: {},
			isActive: true,
		});
		const description = await cvDescriptionService.create(cv.id, {
			description: "Description",
		});
		const philosophy = await cvPhilosophyService.create(cv.id, {
			citation: "Philosophy",
		});
		const moduleItem = await cvModuleItemService.create(module.id, {
			itemType: CVModuleItemType.cvDescription,
			itemId: description.id,
			order: 1,
		});
		const moduleItem2 = await cvModuleItemService.create(module.id, {
			itemType: CVModuleItemType.cvPhilosophy,
			itemId: philosophy.id,
			order: 2,
		});
		await cvModuleItemService.delete(moduleItem.id);
		const items = await cvModuleItemService.findAllByModuleId(module.id);
		expect(items.length).toBe(1);
		expect(items[0]!.moduleId).toBe(module.id);
		expect(items[0]!.itemType).toBe(CVModuleItemType.cvPhilosophy);
		expect(items[0]!.itemId).toBe(philosophy.id);
		expect(items[0]!.order).toBe(1);
	});
});
