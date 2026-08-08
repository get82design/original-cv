import { describe, expect, it } from "vitest";
import { CVModuleType, CvTimelineStatus, Level } from "../../../generated/prisma/client";
import { prismaTest } from "../../../lib/prismaTest";
import { cvSaveService } from "../../../src/services/cv/cvSaveService";
import { cvSaveSchema, type CvSaveInput } from "../../../src/services/schemas/cvSave.schema";
import {
	ForbiddenError,
	NotFoundError,
	ValidationError,
} from "../../../src/services/errors";
import { createCV } from "../../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../../utils/create-test-template";
import { createTestUser } from "../../utils/create-test-user";
import { mapCvToSaveInput } from "../../../src/features/cv-editor/mapCvToSaveInput";
import { cvService } from "../../../src/services/cv/cvService";

async function createCatalogSkill(name = `skill-${Date.now()}`) {
	return prismaTest.skill.create({ data: { name } });
}

async function createCatalogCompetence(name = `competence-${Date.now()}`) {
	return prismaTest.competence.create({ data: { name } });
}

const baseTextSettings = {
	sizeModel: "16px",
	weightModel: 400,
	colorSelect: "primaryColor" as const,
	sizeSelect: "sm" as const,
	weightSelect: "sm" as const,
	withPrimaryColor: true,
	textAlign: "left" as const,
};

const sectionTitleSettings = {
	title: baseTextSettings,
};

const experienceItemSettings = {
	title: baseTextSettings,
	company: baseTextSettings,
	periode: baseTextSettings,
	location: baseTextSettings,
	description: baseTextSettings,
	missions: baseTextSettings,
	withDescription: true,
	withListMissions: true,
	withTitle: true,
	withCompany: true,
	withPeriode: true,
	withLocation: true,
};

const projectItemSettings = {
	title: baseTextSettings,
	description: baseTextSettings,
	location: baseTextSettings,
	periode: baseTextSettings,
	technology: baseTextSettings,
	missions: baseTextSettings,
	withDescription: true,
	withLocation: true,
	withPeriode: true,
	withTechnology: true,
	withMissions: true,
	withTitle: true,
};

const languageItemSettings = {
	language: baseTextSettings,
	design: "stars" as const,
};

const educationItemSettings = {
	diplome: baseTextSettings,
	etablissement: baseTextSettings,
	year: baseTextSettings,
	ville: baseTextSettings,
	withYear: true,
	withVille: true,
	withEtablissement: true,
};

function buildSaveInput(
	templateId: string,
	overrides: Partial<CvSaveInput> = {},
    opts: { skillId?: string, competenceId?: string } = {},
): CvSaveInput {
	return {
		templateId,
		title: "CV Test",
		datas: {
			header: {
				title: "John Doe",
				prenom: "John",
				nom: "Doe",
				email: "john@test.com",
			},
			description: {
				content: { description: "À propos de moi" },
				settings: {
					title: baseTextSettings,
					content: baseTextSettings,
				},
			},
			experience: {
				content: [
					{
						clientKey: "experience-1",
						order: 1,
						content: {
							title: "Développeur",
							company: "Acme",
							start: new Date("2020-01-01"),
							end: new Date("2022-01-01"),
							location: "Paris",
							description: "Dev fullstack",
							missions: [
								{
									clientKey: "mission-1",
									content: { content: "Développer des features" },
								},
							],
							settings: experienceItemSettings,
						},
					},
				],
				settings: sectionTitleSettings,
			},
            project: {
                content: [
                    {
                        clientKey: "project-1",
                        order: 1,
                        content: { 
                            title: "Projet 1", 
                            start: new Date("2020-01-01"), 
                            end: new Date("2022-01-01"), 
                            status: CvTimelineStatus.INTERRUPTED,
                            technology: "React",
                            missions: [
                                {
                                    clientKey: "mission-1",
                                    content: { content: "Développer des features" },
                                },
                            ],
                            settings: projectItemSettings,
                        },
                    },
                ],
				settings: sectionTitleSettings,
            },
            volunteering: {
                content: [
                    {
                        clientKey: "volunteering-1",
                        order: 1,
                        content: {
                            title: "Volontariat 1",
                            organisation: "Organisation 1",
                            start: new Date("2020-01-01"),
                            end: new Date("2022-01-01"),
                            location: "Paris",
                            description: "Dev fullstack",
                            missions: [
                                { clientKey: "mission-1", content: { content: "Développer des features" } },
                            ],
                            settings: { withDescription: true, withList: true },
                        },
                    },
                ],
            },
            formation: {
                content: [
                    {
                        clientKey: "formation-1",
                        order: 1,
                        content: {
                            title: "Formation 1",
                            start: new Date("2020-01-01"),
                            end: new Date("2022-01-01"),
                            status: CvTimelineStatus.COMPLETED,
                            organismeFormation: "Organisation 1",
                            settings: { withDescription: true, withList: true },
                        },
                    },
                ],
            },
            certification: {
                content: [
                    {
                        clientKey: "certification-1",
                        order: 1,
                        content: {
                            title: "Certification 1",
                            organismeCertification: "Organisation 1",
                            settings: { withDescription: true, withList: true },
                        },
                    },
                ],
            },
            prize: {
                content: [
                    {
                        clientKey: "prize-1",
                        order: 1,
                        content: { 
                            title: "Prix 1", 
                            domaine: "Domain 1", 
                            settings: { 
                                withDescription: true, 
                                withList: true,
                            },
                        },
                    },
                ],
            },
            expertise: {
                content: [
                    {
                        clientKey: "expertise-1",
                        order: 1,
                        content: {
                            title: "Expertise 1",
                            level: Level.Débutant,
                            settings: {
                                withDescription: true,
                                withList: true,
                            },
                        },
                    },
                ],
            },  
            philosophy: {
                content: {
                    citation: "Philosophie 1",
                    author: "Author 1",
                    settings: {
                        withDescription: true,
                        withList: true,
                    },
                },
            },
            socialMedia: {
                content: [
                    {
                        clientKey: "socialMedia-1",
                        order: 1,
                        content: {
                            socialNetwork: "Social Network 1",
                            username: "JohnDoe",
							icon: "🌐",
                            settings: { 
								socialNetwork: baseTextSettings,
								username: baseTextSettings,
								withIcon: true, 
								withSocialNetwork: true, 
								withUsername: true 
							},
                        },
                    },
                ],
				settings: sectionTitleSettings,
            },
            passion: {
                content: [
                    {
                        clientKey: "passion-1",
                        order: 1,
                        content: {
                            title: "Passion 1",
                            icon: "🎨",
                            settings: {
                                withDescription: true,
                                withList: true,
                            },
                        },
                    },
                ],
            },
            language: {
                content: [
                    {
                        clientKey: "language-1",
                        order: 1,
                        content: {
                            name: "Language 1",
                            level: Level.Débutant,
                            settings: languageItemSettings,
                        },
                    },
                ],
				settings: sectionTitleSettings,
            },
            publication: {
                content: [
                    {
                        clientKey: "publication-1",
                        order: 1,
                        content: {
                            title: "Publication 1",
                            start: new Date("2020-01-01"),
                            end: new Date("2022-01-01"),
                            journalName: "Journal 1",
                            description: "Description 1",
                            url: "https://www.google.com",
                            settings: {
                                withDescription: true,
                                withList: true,
                            },
                        },
                    },
                ],
            },
            strength: {
                content: [
                    {
                        clientKey: "strength-1",
                        order: 1,
                        content: {
                            title: "Strength 1",
                            icon: "💪",
                            settings: {
                                withDescription: true,
                                withList: true,
                            },
                        },
                    },
                ],
            },
            achievement: {
                content: [
                    {
                        clientKey: "achievement-1",
                        order: 1,
                        content: {
                            title: "Achievement 1",
                            description: "Description 1",
                            year: 2021,
                            technology: "Technology 1",
                            settings: {
                                withDescription: true,
                                withList: true,
                            },
                        },
                    },
                ],
            },
            education: {
                content: [
                    {
                        clientKey: "education-1",
                        order: 1,
                        content: {
                            title: "Education 1",
                            school: "School 1",
                            degree: "Degree 1",
                            city: "City 1",
                            start: new Date("2020-01-01"),
                            end: new Date("2022-01-01"),
                            obtained: CvTimelineStatus.COMPLETED,
                            settings: educationItemSettings,
                        },
                    },
                ],
				settings: sectionTitleSettings,
            },
            skillGroup: opts?.skillId
                ? {
                    content: [
                        {
                            clientKey: "skillGroup-1",
                            order: 1,
                            content: {
                            title: "Skill Group 1",
                            skills: [
                                {
                                    clientKey: "skill-1",
                                    order: 1,
                                    content: {
										name: "Skill 1",
                                        skillId: opts.skillId,
                                        level: Level.Débutant,
                                    },
                                },
                            ],
                            },
                        },
                    ],
					settings: sectionTitleSettings,
                }
                : undefined, // ou {} si tu préfères toujours envoyer la section
            competenceGroup: opts?.competenceId
            ? {
                content: [
                    {
                        clientKey: "competenceGroup-1",
                        order: 1,
                        content: {
                        title: "Competence Group 1",
                        competences: [
                            {
                                clientKey: "competence-1",
                                order: 1,
                                content: {
                                    competenceId: opts.competenceId,
                                },
                            },
                        ],
                        },
                    },
                ],
            }
            : undefined, // ou {} si tu préfères toujours envoyer la section
		},
		modules: [
			{
				type: CVModuleType.description,
				order: 1,
				isActive: true,
				settings: {},
			},
			{
				type: CVModuleType.experience,
				order: 2,
				isActive: true,
				title: "Expériences",
				settings: {},
			},
            {
                type: CVModuleType.project,
                order: 3,
                isActive: true,
                title: "Projets",
                settings: {},
            },
            {
                type: CVModuleType.volunteering,
                order: 4,
                isActive: true,
                title: "Volontariat",
                settings: {},
            },
            {
                type: CVModuleType.formation,
                order: 5,
                isActive: true,
                title: "Formations",
                settings: {},
            },
            {
                type: CVModuleType.certification,
                order: 6,
                isActive: true,
                title: "Certifications",
                settings: {},
            },
            {
                type: CVModuleType.prize,
                order: 7,
                isActive: true,
                title: "Prix",
                settings: {},
            },
            {
                type: CVModuleType.expertise,
                order: 8,
                isActive: true,
                title: "Expertises",
                settings: {},
            },
            {
                type: CVModuleType.philosophy,
                order: 9,
                isActive: true,
                title: "Philosophie",
                settings: {},
            },
            {
                type: CVModuleType.socialMedia,
                order: 10,
                isActive: true,
                title: "Réseaux sociaux",
                settings: {},
            },
            {
                type: CVModuleType.passion,
                order: 11,
                isActive: true,
                title: "Passions",
                settings: {},
            },
            {
                type: CVModuleType.language,
                order: 12,
                isActive: true,
                title: "Langues",
                settings: {},
            },
            {
                type: CVModuleType.publication,
                order: 13,
                isActive: true,
                title: "Publications",
                settings: {},
            },
            {
                type: CVModuleType.strength,
                order: 14,
                isActive: true,
                title: "Compétences",
                settings: {},
            },
            {
                type: CVModuleType.achievement,
                order: 15,
                isActive: true,
                title: "Achievements",
                settings: {},
            },
            {
                type: CVModuleType.education,
                order: 16,
                isActive: true,
                title: "Éducation",
                settings: {},
            },
            {
                type: CVModuleType.skill,
                order: 17,
                isActive: true,
                title: "Skills",
                settings: {},
            },
            {
                type: CVModuleType.competence,
                order: 18,
                isActive: true,
                title: "Competences",
                settings: {},
            },
		],
		...overrides,
	};
}

describe("CvSaveService.save", () => {
	it("creates a full CV without cvId", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const catalogSkill = await prismaTest.skill.create({
			data: { name: `skill-${Date.now()}` }, // name unique
		});
		const catalogCompetence = await createCatalogCompetence(`competence-${Date.now()}`);
		const result = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {}, { skillId: catalogSkill.id, competenceId: catalogCompetence.id }),
		);


		expect(result.userId).toBe(user.id);
		expect(result.title).toBe("CV Test");
		expect(result.headerCv?.title).toBe("John Doe");
		expect(result.headerCv?.prenom).toBe("John");
		expect(result.description?.description).toBe("À propos de moi");
		expect(result.experiences).toHaveLength(1);
		expect(result.experiences[0]?.title).toBe("Développeur");
		expect(result.experiences[0]?.cvMissions).toHaveLength(1);
		expect(result.experiences[0]?.cvMissions[0]?.content).toBe(
			"Développer des features",
		);
        expect(result.experiences[0]?.settings).toEqual(experienceItemSettings);
		expect(result.projects).toHaveLength(1);
		expect(result.projects[0]?.title).toBe("Projet 1");
		expect(result.projects[0]?.cvMissions).toHaveLength(1);
		expect(result.projects[0]?.cvMissions[0]?.content).toBe(
			"Développer des features",
		);
        expect(result.projects[0]?.technology).toBe("React");
        expect(result.projects[0]?.status).toBe(CvTimelineStatus.INTERRUPTED);
        expect(result.projects[0]?.settings).toEqual(projectItemSettings);
        expect(result.volunteerings).toHaveLength(1);
        expect(result.volunteerings[0]?.title).toBe("Volontariat 1");
        expect(result.volunteerings[0]?.cvMissions).toHaveLength(1);
        expect(result.volunteerings[0]?.cvMissions[0]?.content).toBe(
            "Développer des features",
        );
        expect(result.volunteerings[0]?.settings).toEqual({
            withDescription: true, withList: true,
        });
        expect(result.volunteerings[0]?.organisation).toBe("Organisation 1");
        expect(result.volunteerings[0]?.start).toStrictEqual(new Date("2020-01-01"));
        expect(result.volunteerings[0]?.end).toStrictEqual(new Date("2022-01-01"));
        expect(result.volunteerings[0]?.location).toBe("Paris");
        expect(result.volunteerings[0]?.description).toBe("Dev fullstack");
        expect(result.formations).toHaveLength(1);
        expect(result.formations[0]?.title).toBe("Formation 1");
        expect(result.formations[0]?.settings).toEqual({
            withDescription: true, withList: true,
        });
        expect(result.formations[0]?.organismeFormation).toBe("Organisation 1");
        expect(result.formations[0]?.start).toStrictEqual(new Date("2020-01-01"));
        expect(result.formations[0]?.end).toStrictEqual(new Date("2022-01-01"));
        expect(result.formations[0]?.status).toBe(CvTimelineStatus.COMPLETED);
        expect(result.certifications).toHaveLength(1);
        expect(result.certifications[0]?.title).toBe("Certification 1");
        expect(result.certifications[0]?.settings).toEqual({
            withDescription: true, withList: true,
        });
        expect(result.certifications[0]?.organismeCertification).toBe("Organisation 1");
        expect(result.prizes).toHaveLength(1);
        expect(result.prizes[0]?.title).toBe("Prix 1");
        expect(result.prizes[0]?.settings).toEqual({
            withDescription: true, withList: true,
        });
        expect(result.prizes[0]?.domaine).toBe("Domain 1");
        expect(result.expertises).toHaveLength(1);
        expect(result.expertises[0]?.title).toBe("Expertise 1");
        expect(result.expertises[0]?.level).toBe(Level.Débutant);
        expect(result.expertises[0]?.settings).toEqual({
            withDescription: true, withList: true,
        });
        expect(result.philosophy).not.toBeNull();
        expect(result.philosophy?.citation).toBe("Philosophie 1");
        expect(result.philosophy?.author).toBe("Author 1");
        expect(result.philosophy?.settings).toEqual({
            withDescription: true, withList: true,
        });
        expect(result.socialMedias).toHaveLength(1);
        expect(result.socialMedias[0]?.socialNetwork).toBe("Social Network 1");
        expect(result.socialMedias[0]?.username).toBe("JohnDoe");
        expect(result.socialMedias[0]?.icon).toBe("🌐");
		expect(result.socialMedias[0]?.settings).toEqual({
			socialNetwork: baseTextSettings,
			username: baseTextSettings,
			withIcon: true,
			withSocialNetwork: true,
			withUsername: true,
		});
        expect(result.passions).toHaveLength(1);
        expect(result.passions[0]?.title).toBe("Passion 1");
        expect(result.passions[0]?.icon).toBe("🎨");
        expect(result.passions[0]?.settings).toEqual({
            withDescription: true, withList: true,
        });
        expect(result.languages).toHaveLength(1);
        expect(result.languages[0]?.name).toBe("Language 1");
        expect(result.languages[0]?.level).toBe(Level.Débutant);
        expect(result.languages[0]?.settings).toEqual(languageItemSettings);
        expect(result.publications).toHaveLength(1);
        expect(result.publications[0]?.title).toBe("Publication 1");
        expect(result.publications[0]?.start).toStrictEqual(new Date("2020-01-01"));
        expect(result.publications[0]?.end).toStrictEqual(new Date("2022-01-01"));
        expect(result.publications[0]?.journalName).toBe("Journal 1");
        expect(result.publications[0]?.description).toBe("Description 1");
        expect(result.publications[0]?.url).toBe("https://www.google.com");
        expect(result.publications[0]?.settings).toEqual({
            withDescription: true, withList: true,
        });
        expect(result.strengths).toHaveLength(1);
        expect(result.strengths[0]?.title).toBe("Strength 1");
        expect(result.strengths[0]?.icon).toBe("💪");
        expect(result.strengths[0]?.settings).toEqual({
            withDescription: true, withList: true,
        });
        expect(result.achievements).toHaveLength(1);
        expect(result.achievements[0]?.title).toBe("Achievement 1");
        expect(result.achievements[0]?.description).toBe("Description 1");
        expect(result.achievements[0]?.year).toBe(2021);
        expect(result.achievements[0]?.technology).toBe("Technology 1");
        expect(result.achievements[0]?.settings).toEqual({
            withDescription: true, withList: true,
        });
        expect(result.educations).toHaveLength(1);
        expect(result.educations[0]?.title).toBe("Education 1");
        expect(result.educations[0]?.school).toBe("School 1");
        expect(result.educations[0]?.degree).toBe("Degree 1");
        expect(result.educations[0]?.city).toBe("City 1");
        expect(result.educations[0]?.start).toStrictEqual(new Date("2020-01-01"));
        expect(result.educations[0]?.end).toStrictEqual(new Date("2022-01-01"));
        expect(result.educations[0]?.obtained).toBe(CvTimelineStatus.COMPLETED);
        expect(result.educations[0]?.settings).toEqual(educationItemSettings);
        expect(result.skillGroups).toHaveLength(1);
        expect(result.skillGroups[0]?.title).toBe("Skill Group 1");
        expect(result.skillGroups[0]?.skills).toHaveLength(1);
        expect(result.skillGroups[0]?.skills[0]?.skill?.name).toBe(catalogSkill.name);
        expect(result.skillGroups[0]?.skills[0]?.level).toBe(Level.Débutant);
        expect(result.skillGroups[0]?.skills[0]?.order).toBe(1);
        expect(result.skillGroups[0]?.skills[0]?.groupId).toBe(result.skillGroups[0]?.id);
        expect(result.competences).toHaveLength(1);
        expect(result.competences[0]?.title).toBe("Competence Group 1");
        expect(result.competences[0]?.cvCompetences).toHaveLength(1);
        expect(result.competences[0]?.cvCompetences[0]?.competence?.name).toBe(catalogCompetence.name);
        expect(result.competences[0]?.cvCompetences[0]?.order).toBe(1);
        expect(result.competences[0]?.cvCompetences[0]?.groupId).toBe(result.competences[0]?.id);

		const modules = await prismaTest.cVModule.findMany({
			where: { cvId: result.id },
			orderBy: { order: "asc" },
		});
		expect(modules).toHaveLength(18);       
		expect(modules[0]?.type).toBe(CVModuleType.description);
		expect(modules[1]?.type).toBe(CVModuleType.experience);
		expect(modules[2]?.type).toBe(CVModuleType.project);
		expect(modules[3]?.type).toBe(CVModuleType.volunteering);
		expect(modules[4]?.type).toBe(CVModuleType.formation);
		expect(modules[5]?.type).toBe(CVModuleType.certification);
		expect(modules[6]?.type).toBe(CVModuleType.prize);
		expect(modules[7]?.type).toBe(CVModuleType.expertise);
		expect(modules[8]?.type).toBe(CVModuleType.philosophy);
		expect(modules[9]?.type).toBe(CVModuleType.socialMedia);
		expect(modules[10]?.type).toBe(CVModuleType.passion);
		expect(modules[11]?.type).toBe(CVModuleType.language);
		expect(modules[12]?.type).toBe(CVModuleType.publication);
		expect(modules[13]?.type).toBe(CVModuleType.strength);
		expect(modules[14]?.type).toBe(CVModuleType.achievement);
		expect(modules[15]?.type).toBe(CVModuleType.education);
		expect(modules[16]?.type).toBe(CVModuleType.skill);
		expect(modules[17]?.type).toBe(CVModuleType.competence);
	});

	it("updates an existing CV with cvId", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id),
		);

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				title: "CV Updated",
				datas: {
					header: {
						title: "Jane Doe",
						prenom: "Jane",
						nom: "Doe",
					},
					description: {
						content: { description: "Nouvelle description" },
						settings: {
							title: baseTextSettings,
							content: baseTextSettings,
						},
					},
				},
				modules: [
					{
						type: CVModuleType.description,
						order: 1,
						isActive: true,
						settings: {},
					},
				],
			}),
		);

		expect(updated.id).toBe(created.id);
		expect(updated.title).toBe("CV Updated");
		expect(updated.headerCv?.title).toBe("Jane Doe");
		expect(updated.headerCv?.prenom).toBe("Jane");
		expect(updated.description?.description).toBe("Nouvelle description");

		const count = await prismaTest.cV.count({ where: { userId: user.id } });
		expect(count).toBe(1);
	});

	it("throws NotFoundError for unknown cvId", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		await expect(
			cvSaveService.save(
				user.id,
				buildSaveInput(template.id, { cvId: "unknown-cv" }),
			),
		).rejects.toThrow(NotFoundError);
	});

	it("throws ForbiddenError for another user's CV", async () => {
		const owner = await createTestUser();
		const other = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(owner.id, template.id);

		await expect(
			cvSaveService.save(
				other.id,
				buildSaveInput(template.id, { cvId: cv.id }),
			),
		).rejects.toThrow(ForbiddenError);
	});

	it("throws ValidationError when CV limit is reached", async () => {
		const user = await createTestUser(); // maxCvs = 1 par défaut
		const template = await createTestTemplate();
		await createCV(user.id, template.id);

		await expect(
			cvSaveService.save(user.id, buildSaveInput(template.id)),
		).rejects.toThrow(ValidationError);
	});

	it("throws ValidationError when header title is missing", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		await expect(
			cvSaveService.save(
				user.id,
				buildSaveInput(template.id, {
					datas: {
						header: { prenom: "John", nom: "Doe" },
					},
					modules: [],
				}),
			),
		).rejects.toThrow(ValidationError);
	});

	it("replaces experiences: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				datas: {
					header: { title: "John Doe" },
					experience: {
						content: [
							{
								clientKey: "exp-1",
								order: 1,
								content: {
									title: "First",
									company: "A",
									start: new Date("2020-01-01"),
									missions: [],
								},
							},
							{
								clientKey: "exp-2",
								order: 2,
								content: {
									title: "Second",
									company: "B",
									start: new Date("2021-01-01"),
									missions: [],
								},
							},
						],
					
					settings: sectionTitleSettings,
				},
				},
				modules: [],
			}),
		);

		const keepId = created.experiences.find((e) => e.title === "First")?.id;
		expect(keepId).toBeDefined();

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: {
					experience: {
						content: [
							{
								id: keepId,
								clientKey: "exp-1",
								order: 1,
								content: {
									title: "First updated",
									company: "A",
									start: new Date("2020-01-01"),
									missions: [
										{
											clientKey: "m-new",
											content: { content: "Nouvelle mission" },
										},
									],
								},
							},
						],
					
					settings: sectionTitleSettings,
				},
				},
				modules: [],
			}),
		);

		expect(updated.experiences).toHaveLength(1);
		expect(updated.experiences[0]?.id).toBe(keepId);
		expect(updated.experiences[0]?.title).toBe("First updated");
		expect(updated.experiences[0]?.cvMissions).toHaveLength(1);
		expect(updated.experiences[0]?.cvMissions[0]?.content).toBe(
			"Nouvelle mission",
		);
	});

    it("replaces projects: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				datas: {
					header: { title: "John Doe" },
					project: {
						content: [
							{
								clientKey: "project-1",
								order: 1,
								content: {
									title: "First",
									start: new Date("2020-01-01"),
									end: new Date("2022-01-01"),
									status: CvTimelineStatus.INTERRUPTED,
									technology: "React",
									missions: [],
								},
							},
							{
								clientKey: "project-2",
								order: 2,
								content: {
									title: "Second",
									start: new Date("2021-01-01"),
									end: new Date("2023-01-01"),
									status: CvTimelineStatus.COMPLETED,
									technology: "Angular",
									missions: [],
								},
							},
						],
					
					settings: sectionTitleSettings,
				},
				},
				modules: [],
			}),
		);

		const keepId = created.projects.find((p) => p.title === "First")?.id;
		expect(keepId).toBeDefined();

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: {
					project: {
						content: [
							{
								id: keepId,
								clientKey: "project-1",
								order: 1,
								content: {
									title: "First updated",
									start: new Date("2020-01-01"),
									end: new Date("2022-01-01"),
									status: CvTimelineStatus.INTERRUPTED,
									technology: "React",
									settings: projectItemSettings,
									missions: [
										{
											clientKey: "m-new",
											content: { content: "Nouvelle mission" },
										},
									],
								},
							},
						],
					settings: sectionTitleSettings,
					},
				},
				modules: [],
			}),
		);

		expect(updated.projects).toHaveLength(1);
		expect(updated.projects[0]?.id).toBe(keepId);
		expect(updated.projects[0]?.title).toBe("First updated");
		expect(updated.projects[0]?.cvMissions).toHaveLength(1);
		expect(updated.projects[0]?.cvMissions[0]?.content).toBe(
			"Nouvelle mission",
		);
		expect(updated.projects[0]?.technology).toBe("React");
		expect(updated.projects[0]?.status).toBe(CvTimelineStatus.INTERRUPTED);
		expect(updated.projects[0]?.settings).toEqual(projectItemSettings);
	});

    it("replaces volunteerings: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				datas: {
					header: { title: "John Doe" },
					volunteering: {
						content: [
							{
								clientKey: "volunteering-1",
								order: 1,
								content: {
									title: "First",
									start: new Date("2020-01-01"),
									end: new Date("2022-01-01"),
                                    organisation: "Organisation 1",
                                    location: "Paris",
                                    description: "Dev fullstack",
									missions: [],
								},
							},
							{
								clientKey: "volunteering-2",
								order: 2,
								content: {
									title: "Second",
									start: new Date("2021-01-01"),
									end: new Date("2023-01-01"),
									organisation: "Organisation 2",
									location: "Lyon",
									description: "Dev fullstack",
									missions: [],
								},
							},
						],
					},
				},
				modules: [],
			}),
		);

		const keepId = created.volunteerings.find((v) => v.title === "First")?.id;
		expect(keepId).toBeDefined();

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: {
					volunteering: {
						content: [
							{
								id: keepId,
								clientKey: "volunteering-1",
								order: 1,
								content: {
									title: "First updated",
									start: new Date("2020-01-01"),
									end: new Date("2022-01-01"),
									organisation: "Organisation 1",
									location: "Paris",
									description: "Dev fullstack",
									settings: {
										withDescription: true,
										withList: true,
									},
									missions: [
										{
											clientKey: "m-new",
											content: { content: "Nouvelle mission" },
										},
									],
								},
							},
						],
					},
				},
				modules: [],
			}),
		);

		expect(updated.volunteerings).toHaveLength(1);
		expect(updated.volunteerings[0]?.id).toBe(keepId);
		expect(updated.volunteerings[0]?.title).toBe("First updated");
		expect(updated.volunteerings[0]?.cvMissions).toHaveLength(1);
		expect(updated.volunteerings[0]?.cvMissions[0]?.content).toBe(
			"Nouvelle mission",
		);
		expect(updated.volunteerings[0]?.organisation).toBe("Organisation 1");
		expect(updated.volunteerings[0]?.location).toBe("Paris");
		expect(updated.volunteerings[0]?.description).toBe("Dev fullstack");
		expect(updated.volunteerings[0]?.settings).toEqual({
			withDescription: true,
			withList: true,
		});
	});

    it("replaces formations: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				datas: {
					header: { title: "John Doe" },
					formation: {
						content: [
							{
								clientKey: "formation-1",
								order: 1,
								content: {
									title: "First",
									start: new Date("2020-01-01"),
									end: new Date("2022-01-01"),
                                    organismeFormation: "Organisation 1",
                                    status: CvTimelineStatus.COMPLETED,
								},
							},
							{
								clientKey: "formation-2",
								order: 2,
								content: {
									title: "Second",
									start: new Date("2021-01-01"),
									end: new Date("2023-01-01"),
									organismeFormation: "Organisation 2",
									status: CvTimelineStatus.COMPLETED,
								},
							},
						],
					},
				},
				modules: [],
			}),
		);

		const keepId = created.formations.find((f) => f.title === "First")?.id;
		expect(keepId).toBeDefined();

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: {
					formation: {
						content: [
							{
								id: keepId,
								clientKey: "formation-1",
								order: 1,
								content: {
									title: "First updated",
									start: new Date("2020-01-01"),
									end: new Date("2022-01-01"),
									organismeFormation: "Organisation 1",
									status: CvTimelineStatus.COMPLETED,
									settings: {
										withDescription: true,
										withList: true,
									},
								},
							},
						],
					},
				},
				modules: [],
			}),
		);

		expect(updated.formations).toHaveLength(1);
		expect(updated.formations[0]?.id).toBe(keepId);
		expect(updated.formations[0]?.title).toBe("First updated");
		expect(updated.formations[0]?.organismeFormation).toBe("Organisation 1");
		expect(updated.formations[0]?.status).toBe(CvTimelineStatus.COMPLETED);
		expect(updated.formations[0]?.settings).toEqual({
			withDescription: true,
			withList: true,
		});
	});

    it("replaces certifications: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				datas: {
					header: { title: "John Doe" },
					certification: {
						content: [
							{
								clientKey: "certification-1",
								order: 1,
								content: {
									title: "First",
                                    organismeCertification: "Organisation 1",
								},
							},
							{
								clientKey: "certification-2",
								order: 2,
								content: {
									title: "Second",
									organismeCertification: "Organisation 2",
								},
							},
						],
					},
				},
				modules: [],
			}),
		);

		const keepId = created.certifications.find((c) => c.title === "First")?.id;
		expect(keepId).toBeDefined();

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: {
					certification: {
						content: [
							{
								id: keepId,
								clientKey: "certification-1",
								order: 1,
								content: {
									title: "First updated",
									organismeCertification: "Organisation 1",
									settings: {
										withDescription: true,
										withList: true,
									},
								},
							},
						],
					},
				},
				modules: [],
			}),
		);

		expect(updated.certifications).toHaveLength(1);
		expect(updated.certifications[0]?.id).toBe(keepId);
		expect(updated.certifications[0]?.title).toBe("First updated");
		expect(updated.certifications[0]?.organismeCertification).toBe("Organisation 1");
		expect(updated.certifications[0]?.settings).toEqual({
			withDescription: true,
			withList: true,
		});
	});

    it("replaces prizes: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				datas: {
					header: { title: "John Doe" },
					prize: {
						content: [
							{
								clientKey: "prize-1",
								order: 1,
								content: {
									title: "First",
                                    domaine: "Domain 1",
								},
							},
							{
								clientKey: "prize-2",
								order: 2,
								content: {
									title: "Second",
									domaine: "Domain 2",
								},
							},
						],
					},
				},
				modules: [],
			}),
		);

		const keepId = created.prizes.find((p) => p.title === "First")?.id;
		expect(keepId).toBeDefined();

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: {
					prize: {
						content: [
							{
								id: keepId,
								clientKey: "prize-1",
								order: 1,
								content: {
									title: "First updated",
									domaine: "Domain 1",
									settings: {
										withDescription: true,
										withList: true,
									},
								},
							},
						],
					},
				},
				modules: [],
			}),
		);

		expect(updated.prizes).toHaveLength(1);
		expect(updated.prizes[0]?.id).toBe(keepId);
		expect(updated.prizes[0]?.title).toBe("First updated");
		expect(updated.prizes[0]?.domaine).toBe("Domain 1");
		expect(updated.prizes[0]?.settings).toEqual({
			withDescription: true,
			withList: true,
		});
	});

    it("replaces expertises: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				datas: {
					header: { title: "John Doe" },
					expertise: {
						content: [
							{
								clientKey: "expertise-1",
								order: 1,
								content: {
									title: "First",
                                    level: Level.Débutant,
								},
							},
							{
								clientKey: "expertise-2",
								order: 2,
								content: {
									title: "Second",
									level: Level.Intermédiaire,
								},
							},
						],
					},
				},
				modules: [],
			}),
		);

		const keepId = created.expertises.find((e) => e.title === "First")?.id;
		expect(keepId).toBeDefined();

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: {
					expertise: {
						content: [
							{
								id: keepId,
								clientKey: "expertise-1",
								order: 1,
								content: {
									title: "First updated",
									level: Level.Débutant,
									settings: {
										withDescription: true,
										withList: true,
									},
								},
							},
						],
					},
				},
				modules: [],
			}),
		);

		expect(updated.expertises).toHaveLength(1);
		expect(updated.expertises[0]?.id).toBe(keepId);
		expect(updated.expertises[0]?.title).toBe("First updated");
		expect(updated.expertises[0]?.level).toBe(Level.Débutant);
		expect(updated.expertises[0]?.settings).toEqual({
			withDescription: true,
			withList: true,
		});
	});

    it("replaces social media: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				datas: {
					header: { title: "John Doe" },
					socialMedia: {
						content: [
							{
								clientKey: "socialMedia-1",
								order: 1,
								content: {
									socialNetwork: "Twitter",
                                    username: "JohnDoe",
									icon: "🌐",
									settings: {
										socialNetwork: baseTextSettings,
										username: baseTextSettings,
										withIcon: true,
										withSocialNetwork: true,
										withUsername: true,
									},
								},
							},
							{
								clientKey: "socialMedia-2",
								order: 2,
								content: {
									socialNetwork: "LinkedIn",
									username: "JohnDoe",
									icon: "🌐",
									settings: {
										socialNetwork: baseTextSettings,
										username: baseTextSettings,
										withIcon: true,
										withSocialNetwork: true,
										withUsername: true,
									},
								},
							},
						],
						settings: sectionTitleSettings,
					},
				},
				modules: [],
			}),
		);

		const keepId = created.socialMedias.find((s) => s.socialNetwork === "Twitter")?.id;
		expect(keepId).toBeDefined();

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: {
					socialMedia: {
						content: [
							{
								id: keepId,
								clientKey: "socialMedia-1",
								order: 1,
								content: {
									socialNetwork: "Twitter updated",
									username: "JohnDoe updated",
									icon: "🌐 updated",
									settings: {
										socialNetwork: baseTextSettings,
										username: baseTextSettings,
										withIcon: true,
										withSocialNetwork: true,
										withUsername: true,
									},
								},
							},
						],
						settings: sectionTitleSettings,
					},
				},
				modules: [],
			}),
		);

		expect(updated.socialMedias).toHaveLength(1);
		expect(updated.socialMedias[0]?.id).toBe(keepId);
		expect(updated.socialMedias[0]?.socialNetwork).toBe("Twitter updated");
		expect(updated.socialMedias[0]?.username).toBe("JohnDoe updated");
		expect(updated.socialMedias[0]?.icon).toBe("🌐 updated");
		expect(updated.socialMedias[0]?.settings).toEqual({
			socialNetwork: baseTextSettings,
			username: baseTextSettings,
			withIcon: true,
			withSocialNetwork: true,
			withUsername: true,
		});
	});

    it("replaces passions: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				datas: {
					header: { title: "John Doe" },
					passion: {
						content: [
							{
								clientKey: "passion-1",
								order: 1,
								content: {
									title: "Passion 1",
                                    icon: "🎨",
								},
							},
							{
								clientKey: "passion-2",
								order: 2,
								content: {
									title: "Passion 2",
									icon: "🎨",
								},
							},
						],
					},
				},
				modules: [],
			}),
		);

		const keepId = created.passions.find((p) => p.title === "Passion 1")?.id;
		expect(keepId).toBeDefined();

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: {
					passion: {
						content: [
							{
								id: keepId,
								clientKey: "passion-1",
								order: 1,
								content: {
									title: "Passion 1 updated",
									icon: "🎨 updated",
									settings: {
										withDescription: true,
										withIcon: true,
									},
								},
							},
						],
					},
				},
				modules: [],
			}),
		);

		expect(updated.passions).toHaveLength(1);
		expect(updated.passions[0]?.id).toBe(keepId);
		expect(updated.passions[0]?.title).toBe("Passion 1 updated");
		expect(updated.passions[0]?.icon).toBe("🎨 updated");
		expect(updated.passions[0]?.settings).toEqual({
			withDescription: true,
			withIcon: true,
		});
	});

    it("replaces languages: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				datas: {
					header: { title: "John Doe" },
					language: {
						content: [
							{
								clientKey: "language-1",
								order: 1,
								content: {
									name: "Language 1",
                                    level: Level.Débutant,
								},
							},
							{
								clientKey: "language-2",
								order: 2,
								content: {
									name: "Language 2",
									level: Level.Intermédiaire,
								},
							},
						],
					
					settings: sectionTitleSettings,
				},
				},
				modules: [],
			}),
		);

		const keepId = created.languages.find((l) => l.name === "Language 1")?.id;
		expect(keepId).toBeDefined();

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: {
					    language: {
						content: [
							{
								id: keepId,
								clientKey: "language-1",
								order: 1,
								content: {
									name: "Language 1 updated",
									level: Level.Débutant,
									settings: languageItemSettings,
								},
							},
						],
					settings: sectionTitleSettings,
					},
				},
				modules: [],
			}),
		);

		expect(updated.languages).toHaveLength(1);
		expect(updated.languages[0]?.id).toBe(keepId);
		expect(updated.languages[0]?.name).toBe("Language 1 updated");
		expect(updated.languages[0]?.level).toBe(Level.Débutant);
		expect(updated.languages[0]?.settings).toEqual(languageItemSettings);
	});

    it("replaces publications: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				datas: {
					header: { title: "John Doe" },
					publication: {
						content: [
							{
								clientKey: "publication-1",
								order: 1,
								content: {
									title: "Publication 1",
                                    start: new Date("2020-01-01"),
                                    end: new Date("2022-01-01"),
                                    journalName: "Journal 1",
                                    description: "Description 1",
                                    url: "https://www.google.com",
								},
							},
							{
								    clientKey: "publication-2",
								order: 2,
								content: {
									title: "Publication 2",
                                    start: new Date("2020-01-01"),
                                    end: new Date("2022-01-01"),
                                    journalName: "Journal 2",
                                    description: "Description 2",
                                    url: "https://www.google.com",
								},
							},
						],
					},
				},
				modules: [],
			}),
		);

		const keepId = created.publications.find((p) => p.title === "Publication 1")?.id;
		expect(keepId).toBeDefined();

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: {
					    publication: {
						content: [
							{
								id: keepId,
								clientKey: "publication-1",
								order: 1,
								content: {
									title: "Publication 1 updated",
									start: new Date("2020-01-01"),
									end: new Date("2022-01-01"),
									journalName: "Journal 1 updated",
									description: "Description 1 updated",
									url: "https://www.google.com updated",
									settings: {
										withDescription: true,
										withList: true,
									},
								},
							},
						],
					},
				},
				modules: [],
			}),
		);

		expect(updated.publications).toHaveLength(1);
		expect(updated.publications[0]?.id).toBe(keepId);
		expect(updated.publications[0]?.title).toBe("Publication 1 updated");
		expect(updated.publications[0]?.start).toStrictEqual(new Date("2020-01-01"));
		expect(updated.publications[0]?.end).toStrictEqual(new Date("2022-01-01"));
		expect(updated.publications[0]?.journalName).toBe("Journal 1 updated");
		expect(updated.publications[0]?.description).toBe("Description 1 updated");
		expect(updated.publications[0]?.url).toBe("https://www.google.com updated");
		expect(updated.publications[0]?.settings).toEqual({
			withDescription: true,
			withList: true,
		});
	});

    it("replaces strengths: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				datas: {
					header: { title: "John Doe" },
					strength: {
						content: [
							{
								clientKey: "strength-1",
								order: 1,
								content: {
									title: "Strength 1",
                                    icon: "💪",
								},
							},
							{
								clientKey: "strength-2",
								order: 2,
								content: {
									title: "Strength 2",
									icon: "💪",
								},
							},
						],
					},
				},
				modules: [],
			}),
		);

		const keepId = created.strengths.find((s) => s.title === "Strength 1")?.id;
		expect(keepId).toBeDefined();

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: {
					    strength: {
						content: [
							{
								id: keepId,
								clientKey: "strength-1",
								order: 1,
								content: {
									title: "Strength 1 updated",
									icon: "💪 updated",
									settings: {
										withDescription: true,
										withList: true,
									},
								},
							},
						],
					},
				},
				modules: [],
			}),
		);

		expect(updated.strengths).toHaveLength(1);
		expect(updated.strengths[0]?.id).toBe(keepId);
		expect(updated.strengths[0]?.title).toBe("Strength 1 updated");
		expect(updated.strengths[0]?.icon).toBe("💪 updated");
		expect(updated.strengths[0]?.settings).toEqual({
			withDescription: true,
			withList: true,
		});
	});

    it("replaces achievements: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				datas: {
					header: { title: "John Doe" },
					achievement: {
						content: [
							{
								clientKey: "achievement-1",
								order: 1,
								content: {
									title: "Achievement 1",
									description: "Description 1",
									year: 2021,
									technology: "Technology 1",
								},
							},
							{
								clientKey: "achievement-2",
								order: 2,
								content: {
									title: "Achievement 2",
									description: "Description 2",
									year: 2022,
									technology: "Technology 2",
								},
							},
						],
					},
				},
				modules: [],
			}),
		);

		const keepId = created.achievements.find((a) => a.title === "Achievement 1")?.id;
		expect(keepId).toBeDefined();

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: {
					    achievement: {
						content: [
							{
								id: keepId,
								    clientKey: "achievement-1",
								order: 1,
								content: {
									title: "Achievement 1 updated",
									description: "Description 1 updated",
									year: 2021,
									technology: "Technology 1 updated",
									settings: {
										withDescription: true,
										withList: true,
									},
								},
							},
						],
					},
				},
				modules: [],
			}),
		);

		expect(updated.achievements).toHaveLength(1);
		expect(updated.achievements[0]?.id).toBe(keepId);
		expect(updated.achievements[0]?.title).toBe("Achievement 1 updated");
		expect(updated.achievements[0]?.description).toBe("Description 1 updated");
		expect(updated.achievements[0]?.year).toBe(2021);
		expect(updated.achievements[0]?.technology).toBe("Technology 1 updated");
		expect(updated.achievements[0]?.settings).toEqual({
			withDescription: true,
			withList: true,
		});
	});

    it("replaces educations: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				datas: {
					header: { title: "John Doe" },
					education: {
						content: [
							{
								clientKey: "education-1",
								order: 1,
								content: {
									title: "Education 1",
									school: "School 1",
									degree: "Degree 1",
									city: "City 1",
									start: new Date("2020-01-01"),
									end: new Date("2022-01-01"),
									obtained: CvTimelineStatus.COMPLETED,
									settings: educationItemSettings,
								},
							},
							{
								clientKey: "education-2",
								order: 2,
								content: {
									title: "Education 2",
									school: "School 2",
									degree: "Degree 2",
									city: "City 2",
									start: new Date("2020-01-01"),
									end: new Date("2022-01-01"),
									obtained: CvTimelineStatus.COMPLETED,
									settings: educationItemSettings,
								},
							},
						],
					settings: sectionTitleSettings,
					},
				},
				modules: [],
			}),
		);

		const keepId = created.educations.find((e) => e.title === "Education 1")?.id;
		expect(keepId).toBeDefined();

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: {
					    education: {
						content: [
							{
								id: keepId,
								clientKey: "education-1",
								order: 1,
								content: {
									title: "Education 1 updated",
									school: "School 1 updated",
									degree: "Degree 1 updated",
									city: "City 1 updated",
									start: new Date("2020-01-01"),
									end: new Date("2022-01-01"),
									obtained: CvTimelineStatus.COMPLETED,
									settings: educationItemSettings,
								},
							},
						],
					settings: sectionTitleSettings,
					},
				},
				modules: [],
			}),
		);

		expect(updated.educations).toHaveLength(1);
		expect(updated.educations[0]?.id).toBe(keepId);
		expect(updated.educations[0]?.title).toBe("Education 1 updated");
		expect(updated.educations[0]?.school).toBe("School 1 updated");
		expect(updated.educations[0]?.degree).toBe("Degree 1 updated");
		expect(updated.educations[0]?.city).toBe("City 1 updated");
		expect(updated.educations[0]?.start).toStrictEqual(new Date("2020-01-01"));
		expect(updated.educations[0]?.end).toStrictEqual(new Date("2022-01-01"));
		expect(updated.educations[0]?.obtained).toBe(CvTimelineStatus.COMPLETED);
		expect(updated.educations[0]?.settings).toEqual(educationItemSettings);
	});

    it("replaces skillGroups: keeps listed ids and deletes others", async () => {
        const user = await createTestUser();
        const template = await createTestTemplate();
        const skillA = await createCatalogSkill(`A-${Date.now()}`);
        const skillB = await createCatalogSkill(`B-${Date.now()}`);
        const skillC = await createCatalogSkill(`C-${Date.now()}`);
        const created = await cvSaveService.save(
            user.id,
            buildSaveInput(template.id, {
                datas: {
                    header: { title: "John Doe" },
                    skillGroup: {
                        content: [
                            {
                                clientKey: "sg-1",
                                order: 1,
                                content: {
                                    title: "First",
                                    skills: [
                                        {
                                            clientKey: "s-a",
                                            order: 1,
                                            content: {
												name: skillA.name,
                                                skillId: skillA.id,
                                                level: Level.Débutant,
                                            },
                                        },
                                        {
                                            clientKey: "s-b",
                                            order: 2,
                                            content: {
												name: skillB.name,
                                                skillId: skillB.id,
                                                level: Level.Senior,
                                            },
                                        },
                                    ],
                                },
                            },
                            {
                                clientKey: "sg-2",
                                order: 2,
                                content: {
                                    title: "Second",
                                    skills: [
                                        {
                                            clientKey: "s-c",
                                            order: 1,
                                            content: {
												name: skillC.name,
                                                skillId: skillC.id,
                                                level: Level.Expert,
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    
					settings: sectionTitleSettings,
				},
                },
                modules: [],
            }),
        );
        const keepGroup = created.skillGroups.find((g) => g.title === "First");
        expect(keepGroup).toBeDefined();
        const keepSkill = keepGroup!.skills.find((s) => s.skillId === skillA.id);
        expect(keepSkill).toBeDefined();
        const updated = await cvSaveService.save(
            user.id,
            buildSaveInput(template.id, {
                cvId: created.id,
                datas: {
                    skillGroup: {
                        content: [
                            {
                                id: keepGroup!.id,
                                clientKey: "sg-1",
                                order: 1,
                                content: {
                                    title: "First updated",
                                    skills: [
                                        {
                                            id: keepSkill!.id,
                                            clientKey: "s-a",
                                            order: 1,
                                            content: {
												name: skillA.name,
                                                skillId: skillA.id,
                                                level: Level.Expert, // level mis à jour
                                            },
                                        },
                                        // skillB omis → supprimé du groupe
                                        {
                                            clientKey: "s-c-new",
                                            order: 2,
                                            content: {
												name: skillC.name,
                                                skillId: skillC.id,
                                                level: Level.Débutant,
                                            },
                                        },
                                    ],
                                },
                            },
                            // Second omis → groupe supprimé
                        ],
                    
					settings: sectionTitleSettings,
				},
                },
                modules: [],
            }),
        );
        expect(updated.skillGroups).toHaveLength(1);
        expect(updated.skillGroups[0]?.id).toBe(keepGroup!.id);
        expect(updated.skillGroups[0]?.title).toBe("First updated");
        expect(updated.skillGroups[0]?.skills).toHaveLength(2);
        const skills = updated.skillGroups[0]!.skills;
        expect(skills.find((s) => s.id === keepSkill!.id)?.level).toBe(Level.Expert);
        expect(skills.some((s) => s.skillId === skillB.id)).toBe(false);
        expect(skills.some((s) => s.skillId === skillC.id)).toBe(true);
    });

	it("resolves skill by name when skillId is omitted (findFirst then create catalog)", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const existingName = `Existing-${Date.now()}`;
		const existing = await createCatalogSkill(existingName);
		const brandNewName = `BrandNew-${Date.now()}`;
		const result = await cvSaveService.save(
		  user.id,
		  buildSaveInput(template.id, {
			datas: {
			  header: { title: "John Doe" },
			  skillGroup: {
				content: [
				  {
					clientKey: "sg-1",
					order: 1,
					content: {
					  title: "Group",
					  skills: [
						{
						  clientKey: "s-existing",
						  order: 1,
						  content: {
							name: existingName, // pas de skillId → findFirst
							level: Level.Débutant,
						  },
						},
						{
						  clientKey: "s-new",
						  order: 2,
						  content: {
							name: brandNewName, // pas de skillId → create catalogue
							level: Level.Senior,
						  },
						},
					  ],
					},
				  },
				],
				settings: sectionTitleSettings,
			  },
			},
			modules: [],
		  }),
		);
		const group = result.skillGroups[0]!;
		expect(group.skills).toHaveLength(2);
		const linkedExisting = group.skills.find((s) => s.skill?.name === existingName);
		expect(linkedExisting?.skillId).toBe(existing.id);
		const linkedNew = group.skills.find((s) => s.skill?.name === brandNewName);
		expect(linkedNew).toBeDefined();
		expect(linkedNew!.skillId).not.toBe(existing.id);
		const catalogNew = await prismaTest.skill.findFirst({
		  where: { name: brandNewName },
		});
		expect(catalogNew).toBeTruthy();
		expect(linkedNew!.skillId).toBe(catalogNew!.id);
	});

    it("replaces competenceGroups: keeps listed ids and deletes others", async () => {
        const user = await createTestUser();
        const template = await createTestTemplate();
        const competenceA = await createCatalogCompetence(`A-${Date.now()}`);
        const competenceB = await createCatalogCompetence(`B-${Date.now()}`);
        const competenceC = await createCatalogCompetence(`C-${Date.now()}`);
        const created = await cvSaveService.save(
            user.id,
            buildSaveInput(template.id, {
                datas: {
                    header: { title: "John Doe" },
                    competenceGroup: {
                        content: [
                            {
                                clientKey: "sg-1",
                                order: 1,
                                content: {
                                    title: "First",
                                    competences: [
                                        {
                                            clientKey: "s-a",
                                            order: 1,
                                            content: {
                                                competenceId: competenceA.id,
                                            },
                                        },
                                        {
                                            clientKey: "s-b",
                                            order: 2,
                                            content: {
                                                competenceId: competenceB.id,
                                            },
                                        },
                                    ],
                                },
                            },
                            {
                                clientKey: "sg-2",
                                order: 2,
                                content: {
                                    title: "Second",
                                    competences: [
                                        {
                                            clientKey: "s-c",
                                            order: 1,
                                            content: {
                                                competenceId: competenceC.id,
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
                modules: [],
            }),
        );
        const keepGroup = created.competences.find((g) => g.title === "First");
        expect(keepGroup).toBeDefined();
        const keepCompetence = keepGroup!.cvCompetences.find((c) => c.competenceId === competenceA.id);
        expect(keepCompetence).toBeDefined();
        const updated = await cvSaveService.save(
            user.id,
            buildSaveInput(template.id, {
                cvId: created.id,
                datas: {
                    competenceGroup: {
                        content: [
                            {
                                id: keepGroup!.id,
                                clientKey: "sg-1",
                                order: 1,
                                content: {
                                    title: "First updated",
                                    competences: [
                                        {
                                            id: keepCompetence!.id,
                                            clientKey: "s-a",
                                            order: 1,
                                            content: {
                                                competenceId: competenceA.id,
                                            },
                                        },
                                        // competenceB omis → supprimé du groupe
                                        {
                                            clientKey: "s-c-new",
                                            order: 2,
                                            content: {
                                                competenceId: competenceC.id,
                                            },
                                        },
                                    ],
                                },
                            },
                            // Second omis → groupe supprimé
                        ],
                    },
                },
                modules: [],
            }),
        );
        expect(updated.competences).toHaveLength(1);
        expect(updated.competences[0]?.id).toBe(keepGroup!.id);
        expect(updated.competences[0]?.title).toBe("First updated");
        expect(updated.competences[0]?.cvCompetences).toHaveLength(2);
        const competences = updated.competences[0]!.cvCompetences;
        expect(competences.find((c) => c.id === keepCompetence!.id)?.competenceId).toBe(competenceA.id);
        expect(competences.some((c) => c.competenceId === competenceB.id)).toBe(false);
        expect(competences.some((c) => c.competenceId === competenceC.id)).toBe(true);
    });

	it("clears all skills in a kept skillGroup when skills is empty", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const skill = await createCatalogSkill(`Clear-${Date.now()}`);
		const created = await cvSaveService.save(
		  user.id,
		  buildSaveInput(template.id, {
			datas: {
			  header: { title: "John Doe" },
			  skillGroup: {
				content: [
				  {
					clientKey: "sg-1",
					order: 1,
					content: {
					  title: "Keep me",
					  skills: [
						{
						  clientKey: "s-1",
						  order: 1,
						  content: {
							name: skill.name,
							skillId: skill.id,
							level: Level.Débutant,
						  },
						},
					  ],
					},
				  },
				],
				settings: sectionTitleSettings,
			  },
			},
			modules: [],
		  }),
		);
		const groupId = created.skillGroups[0]!.id;
		expect(created.skillGroups[0]!.skills).toHaveLength(1);
		const updated = await cvSaveService.save(
		  user.id,
		  buildSaveInput(template.id, {
			cvId: created.id,
			datas: {
			  skillGroup: {
				content: [
				  {
					id: groupId,
					clientKey: "sg-1",
					order: 1,
					content: {
					  title: "Keep me",
					  skills: [], // ← vide → deleteMany all skills of group
					},
				  },
				],
				settings: sectionTitleSettings,
			  },
			},
			modules: [],
		  }),
		);
		expect(updated.skillGroups).toHaveLength(1);
		expect(updated.skillGroups[0]!.id).toBe(groupId);
		expect(updated.skillGroups[0]!.skills).toHaveLength(0);
	});

	it("deletes all experiences when content is empty", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, { modules: [] }),
		);
		expect(created.experiences.length).toBeGreaterThan(0);

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: { experience: { content: [], settings: sectionTitleSettings } },
				modules: [],
			}),
		);

		expect(updated.experiences).toHaveLength(0);
	});

    it("deletes all projects when content is empty", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, { modules: [] }),
		);
		expect(created.projects.length).toBeGreaterThan(0);

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: { project: { content: [], settings: sectionTitleSettings } },
				modules: [],
			}),
		);

		expect(updated.projects).toHaveLength(0);
	});

    it("deletes all volunteerings when content is empty", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, { modules: [] }),
		);
		expect(created.volunteerings.length).toBeGreaterThan(0);

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: { volunteering: { content: [] } },
				modules: [],
			}),
		);

		expect(updated.volunteerings).toHaveLength(0);
	});

    it("deletes all formations when content is empty", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, { modules: [] }),
		);
		expect(created.formations.length).toBeGreaterThan(0);

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: { formation: { content: [] } },
				modules: [],
			}),
		);

		expect(updated.formations).toHaveLength(0);
	});

    it("deletes all certifications when content is empty", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, { modules: [] }),
		);
		expect(created.certifications.length).toBeGreaterThan(0);

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: { certification: { content: [] } },
				modules: [],
			}),
		);

		expect(updated.certifications).toHaveLength(0);
	});

    it("deletes all prizes when content is empty", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, { modules: [] }),
		);
		expect(created.prizes.length).toBeGreaterThan(0);

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: { prize: { content: [] } },
				modules: [],
			}),
		);

		expect(updated.prizes).toHaveLength(0);
	});

    it("deletes all expertises when content is empty", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, { modules: [] }),
		);
		expect(created.expertises.length).toBeGreaterThan(0);

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: { expertise: { content: [] } },
				modules: [],
			}),
		);

		expect(updated.expertises).toHaveLength(0);
	});

    it("deletes all social media when content is empty", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, { modules: [] }),
		);
		expect(created.socialMedias.length).toBeGreaterThan(0);

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: { socialMedia: { content: [], settings: sectionTitleSettings } },
				modules: [],
			}),
		);

		expect(updated.socialMedias).toHaveLength(0);
	});

    it("deletes all passions when content is empty", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, { modules: [] }),
		);
		expect(created.passions.length).toBeGreaterThan(0);

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: { passion: { content: [] } },
				modules: [],
			}),
		);

		expect(updated.passions).toHaveLength(0);
	});

    it("deletes all languages when content is empty", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, { modules: [] }),
		);
		expect(created.languages.length).toBeGreaterThan(0);

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: { language: { content: [], settings: sectionTitleSettings } },
				modules: [],
			}),
		);

		expect(updated.languages).toHaveLength(0);
	});

    it("deletes all publications when content is empty", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, { modules: [] }),
		);
		expect(created.publications.length).toBeGreaterThan(0);

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: { publication: { content: [] } },
				modules: [],
			}),
		);

		expect(updated.publications).toHaveLength(0);
	});

    it("deletes all strengths when content is empty", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, { modules: [] }),
		);
		expect(created.strengths.length).toBeGreaterThan(0);

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: { strength: { content: [] } },
				modules: [],
			}),
		);

		expect(updated.strengths).toHaveLength(0);
	});

    it("deletes all achievements when content is empty", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, { modules: [] }),
		);
		expect(created.achievements.length).toBeGreaterThan(0);

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: { achievement: { content: [] } },
				modules: [],
			}),
		);

		expect(updated.achievements).toHaveLength(0);
	});

    it("deletes all educations when content is empty", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, { modules: [] }),
		);
		expect(created.educations.length).toBeGreaterThan(0);

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: { education: { content: [], settings: sectionTitleSettings } },
				modules: [],
			}),
		);

		expect(updated.educations).toHaveLength(0);
	});

    it("deletes all skillGroups when content is empty", async () => {
        const user = await createTestUser();
        const template = await createTestTemplate();
        const catalogSkill = await createCatalogSkill();
        const created = await cvSaveService.save(
            user.id,
            buildSaveInput(
                template.id,
                { modules: [] },
                { skillId: catalogSkill.id },
            ),
        );
        expect(created.skillGroups.length).toBeGreaterThan(0);
        const updated = await cvSaveService.save(
            user.id,
            buildSaveInput(template.id, {
                cvId: created.id,
                datas: { skillGroup: { content: [], settings: sectionTitleSettings } },
                modules: [],
            }),
        );
        expect(updated.skillGroups).toHaveLength(0);
    });

    it("deletes all competenceGroups when content is empty", async () => {
        const user = await createTestUser();
        const template = await createTestTemplate();
        const catalogCompetence = await createCatalogCompetence();
        const created = await cvSaveService.save(
            user.id,
            buildSaveInput(
                template.id,
                { modules: [] },
                { competenceId: catalogCompetence.id },
            ),
        );
        expect(created.competences.length).toBeGreaterThan(0);
        const updated = await cvSaveService.save(
            user.id,
            buildSaveInput(template.id, {
                cvId: created.id,
                datas: { competenceGroup: { content: [] } },
                modules: [],
            }),
        );
        expect(updated.competences).toHaveLength(0);
    });

	it("replaces modules on each save", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id),
		);

		await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: {},
				modules: [
					{
						type: CVModuleType.project,
						order: 1,
						isActive: false,
						settings: {},
					},
				],
			}),
		);

		const modules = await prismaTest.cVModule.findMany({
			where: { cvId: created.id },
		});
		expect(modules).toHaveLength(1);
		expect(modules[0]?.type).toBe(CVModuleType.project);
		expect(modules[0]?.isActive).toBe(false);
	});

	it("does not touch experiences when datas.experience is omitted", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const catalogSkill = await createCatalogSkill();
        const created = await cvSaveService.save(
            user.id,
            buildSaveInput(template.id, { modules: [] }, { skillId: catalogSkill.id }),
        );

		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				title: "Titre seul",
				datas: {
					header: { title: "Header only" },
				},
				modules: [],
			}),
		);

		expect(updated.title).toBe("Titre seul");
		expect(updated.headerCv?.title).toBe("Header only");
		expect(updated.experiences).toHaveLength(1);
		expect(updated.experiences[0]?.title).toBe("Développeur");
        expect(updated.projects).toHaveLength(1);
        expect(updated.projects[0]?.title).toBe("Projet 1");
        expect(updated.volunteerings).toHaveLength(1);
        expect(updated.volunteerings[0]?.title).toBe("Volontariat 1");
        expect(updated.formations).toHaveLength(1);
        expect(updated.formations[0]?.title).toBe("Formation 1");
        expect(updated.certifications).toHaveLength(1);
        expect(updated.certifications[0]?.title).toBe("Certification 1");
        expect(updated.prizes).toHaveLength(1);
        expect(updated.prizes[0]?.title).toBe("Prix 1");
        expect(updated.expertises).toHaveLength(1);
        expect(updated.expertises[0]?.title).toBe("Expertise 1");
        expect(updated.socialMedias).toHaveLength(1);
        expect(updated.socialMedias[0]?.socialNetwork).toBe("Social Network 1");
        expect(updated.passions).toHaveLength(1);
        expect(updated.passions[0]?.title).toBe("Passion 1");
        expect(updated.languages).toHaveLength(1);
        expect(updated.languages[0]?.name).toBe("Language 1");
        expect(updated.publications).toHaveLength(1);
        expect(updated.publications[0]?.title).toBe("Publication 1");
        expect(updated.strengths).toHaveLength(1);
        expect(updated.strengths[0]?.title).toBe("Strength 1");
        expect(updated.achievements).toHaveLength(1);
        expect(updated.achievements[0]?.title).toBe("Achievement 1");
        expect(updated.educations).toHaveLength(1);
        expect(updated.educations[0]?.title).toBe("Education 1");
        expect(updated.skillGroups).toHaveLength(1);
        expect(updated.skillGroups[0]?.title).toBe("Skill Group 1");
	});

	it("roundtrips findById → mapCvToSaveInput → save", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const created = await cvSaveService.save(user.id, buildSaveInput(template.id));
		const full = await cvService.findById(created.id);
		const mapped = mapCvToSaveInput(full);
		expect(cvSaveSchema.safeParse(mapped).success).toBe(true);
		const saved = await cvSaveService.save(user.id, {
			...mapped,
			cvId: created.id,
		});
		expect(saved.id).toBe(created.id);
	});

	it("updates existing project missions and deletes unlisted ones", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				datas: {
					header: { title: "John Doe" },
					project: {
						content: [
							{
								clientKey: "project-1",
								order: 1,
								content: {
									title: "App",
									start: new Date("2020-01-01"),
									end: new Date("2022-01-01"),
									status: CvTimelineStatus.COMPLETED,
									technology: "React",
									missions: [
										{
											clientKey: "m1",
											content: { content: "Mission A" },
										},
										{
											clientKey: "m2",
											content: { content: "Mission B" },
										},
									],
								},
							},
						],
					
					settings: sectionTitleSettings,
				},
				},
				modules: [],
			}),
		);
		const projectId = created.projects[0]?.id!;
		const keepMissionId = created.projects[0]?.cvMissions.find(
			(m) => m.content === "Mission A",
		)?.id!;
		expect(keepMissionId).toBeDefined();
		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: {
					project: {
						content: [
							{
								id: projectId,
								clientKey: "project-1",
								order: 1,
								content: {
									title: "App",
									start: new Date("2020-01-01"),
									end: new Date("2022-01-01"),
									status: CvTimelineStatus.COMPLETED,
									technology: "React",
									missions: [
										{
											id: keepMissionId,
											clientKey: "m1",
											order: 1,
											content: { content: "Mission A updated" },
										},
									],
								},
							},
						],
					
					settings: sectionTitleSettings,
				},
				},
				modules: [],
			}),
		);
		expect(updated.projects[0]?.cvMissions).toHaveLength(1);
		expect(updated.projects[0]?.cvMissions[0]?.id).toBe(keepMissionId);
		expect(updated.projects[0]?.cvMissions[0]?.content).toBe(
			"Mission A updated",
		);
	});
	
	it("updates existing volunteering missions and deletes unlisted ones", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				datas: {
					header: { title: "John Doe" },
					volunteering: {
						content: [
							{
								clientKey: "vol-1",
								order: 1,
								content: {
									title: "Asso",
									organisation: "Org",
									start: new Date("2020-01-01"),
									end: new Date("2022-01-01"),
									missions: [
										{
											clientKey: "m1",
											content: { content: "Aide A" },
										},
										{
											clientKey: "m2",
											content: { content: "Aide B" },
										},
									],
								},
							},
						],
					},
				},
				modules: [],
			}),
		);
		const volunteeringId = created.volunteerings[0]?.id!;
		const keepMissionId = created.volunteerings[0]?.cvMissions.find(
			(m) => m.content === "Aide A",
		)?.id!;
		expect(keepMissionId).toBeDefined();
		const updated = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id, {
				cvId: created.id,
				datas: {
					volunteering: {
						content: [
							{
								id: volunteeringId,
								clientKey: "vol-1",
								order: 1,
								content: {
									title: "Asso",
									organisation: "Org",
									start: new Date("2020-01-01"),
									end: new Date("2022-01-01"),
									missions: [
										{
											id: keepMissionId,
											clientKey: "m1",
											order: 1,
											content: { content: "Aide A updated" },
										},
									],
								},
							},
						],
					},
				},
				modules: [],
			}),
		);
		expect(updated.volunteerings[0]?.cvMissions).toHaveLength(1);
		expect(updated.volunteerings[0]?.cvMissions[0]?.id).toBe(keepMissionId);
		expect(updated.volunteerings[0]?.cvMissions[0]?.content).toBe(
			"Aide A updated",
		);
	});

	it("roundtrips findById → mapCvToSaveInput → save", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const created = await cvSaveService.save(
			user.id,
			buildSaveInput(template.id),
		);
		const full = await cvService.findById(created.id);
		const mapped = mapCvToSaveInput(full);
		expect(cvSaveSchema.safeParse(mapped).success).toBe(true);
		const saved = await cvSaveService.save(user.id, {
			...mapped,
			cvId: created.id,
		});
		expect(saved.id).toBe(created.id);
	});
});