import { describe, expect, it } from "vitest";
import { CvTimelineStatus, Level } from "../../../generated/prisma/client";
import { prismaTest } from "../../../lib/prismaTest";
import { profileSaveService } from "../../../src/services/profile/profileSaveService";
import {
	profileSaveSchema,
	type ProfileSaveInput,
} from "../../../src/services/schemas/profileSave.schema";
import { NotFoundError } from "../../../src/services/errors";
import { createTestUser } from "../../utils/create-test-user";
import { createTestProfile } from "../../utils/create-test-profile";
import { profileService } from "../../../src/services/profile/profileService";
import { mapProfileToSaveInput } from "../../../src/features/profile/mapProfileToSaveInput";

async function createCatalogSkill(name = `skill-${Date.now()}`) {
	return prismaTest.skill.create({ data: { name } });
}

async function createCatalogCompetence(name = `competence-${Date.now()}`) {
	return prismaTest.competence.create({ data: { name } });
}

async function createCatalogTag(name = `tag-${Date.now()}`) {
	return prismaTest.tag.create({ data: { name } });
}

const start = new Date("2020-01-01");
const end = new Date("2022-01-01");

function item<T>(clientKey: string, order: number, content: T) {
	return { clientKey, order, content };
}

function mission(clientKey: string, content: string, order = 1) {
	return { clientKey, order, content: { content } };
}

function identity(overrides: Partial<ProfileSaveInput> = {}): ProfileSaveInput {
	return {
		firstName: "John",
		lastName: "Doe",
		phone: "0606060606",
		location: "Paris",
		email: "john@test.com",
		photo: "photo.png",
		...overrides,
	};
}

function buildSaveInput(
	overrides: Partial<ProfileSaveInput> = {},
	opts: {
		skillId?: string;
		skillName?: string;
		competenceId?: string;
		competenceName?: string;
		tagId?: string;
		tagName?: string;
	} = {},
): ProfileSaveInput {
	const skillName = opts.skillName ?? "TypeScript";
	const competenceName = opts.competenceName ?? "Architecture";
	const tagName = opts.tagName ?? "Remote";

	return {
		...identity(),
		description: { description: "À propos de moi" },
		philosophy: { citation: "Philosophie 1", author: "Author 1" },
		experiences: [
			item("experience-1", 1, {
				title: "Développeur",
				company: "Acme",
				start,
				end,
				location: "Paris",
				description: "Dev fullstack",
				missions: [mission("mission-1", "Développer des features")],
			}),
		],
		projects: [
			item("project-1", 1, {
				title: "Projet 1",
				start,
				end,
				status: CvTimelineStatus.INTERRUPTED,
				technology: "React",
				location: "Paris",
				description: "App web",
				missions: [mission("mission-1", "Développer des features")],
			}),
		],
		volunteerings: [
			item("volunteering-1", 1, {
				title: "Volontariat 1",
				organisation: "Organisation 1",
				start,
				end,
				location: "Paris",
				description: "Dev fullstack",
				missions: [mission("mission-1", "Développer des features")],
			}),
		],
		formations: [
			item("formation-1", 1, {
				title: "Formation 1",
				organismeFormation: "Organisation 1",
				start,
				end,
				status: CvTimelineStatus.COMPLETED,
			}),
		],
		certifications: [
			item("certification-1", 1, {
				title: "Certification 1",
				organismeCertification: "Organisation 1",
			}),
		],
		prizes: [
			item("prize-1", 1, {
				title: "Prix 1",
				icon: "FaTrophy",
				domaine: "Domain 1",
			}),
		],
		expertises: [
			item("expertise-1", 1, {
				title: "Expertise 1",
				level: Level.Débutant,
			}),
		],
		socialMedias: [
			item("socialMedia-1", 1, {
				socialNetwork: "Social Network 1",
				username: "JohnDoe",
				icon: "🌐",
			}),
		],
		passions: [
			item("passion-1", 1, {
				title: "Passion 1",
				icon: "BsBalloonHeartFill",
			}),
		],
		languages: [
			item("language-1", 1, {
				name: "Language 1",
				level: Level.Débutant,
			}),
		],
		publications: [
			item("publication-1", 1, {
				title: "Publication 1",
				start,
				end,
				journalName: "Journal 1",
				description: "Description 1",
				url: "https://www.google.com",
			}),
		],
		strengths: [
			item("strength-1", 1, {
				title: "Strength 1",
				description: "Description 1",
				icon: "FaThumbsUp",
			}),
		],
		achievements: [
			item("achievement-1", 1, {
				title: "Achievement 1",
				description: "Description 1",
				year: 2021,
				technology: "Technology 1",
			}),
		],
		educations: [
			item("education-1", 1, {
				title: "Education 1",
				school: "School 1",
				degree: "Degree 1",
				city: "City 1",
				start,
				end,
				obtained: CvTimelineStatus.COMPLETED,
			}),
		],
		skillGroups: [
			item("skillGroup-1", 1, {
				title: "Skill Group 1",
				skills: [
					item("skill-1", 1, {
						name: skillName,
						...(opts.skillId ? { skillId: opts.skillId } : {}),
						level: Level.Débutant,
					}),
				],
			}),
		],
		competenceGroups: [
			item("competenceGroup-1", 1, {
				title: "Competence Group 1",
				competences: [
					item("competence-1", 1, {
						name: competenceName,
						...(opts.competenceId ? { competenceId: opts.competenceId } : {}),
					}),
				],
			}),
		],
		tagGroups: [
			item("tagGroup-1", 1, {
				title: "Tag Group 1",
				tags: [
					item("tag-1", 1, {
						name: tagName,
						...(opts.tagId ? { tagId: opts.tagId } : {}),
					}),
				],
			}),
		],
		...overrides,
	};
}

describe("ProfileSaveService.save", () => {
	it("throws NotFoundError for unknown user", async () => {
		await expect(profileSaveService.save("unknown-user", identity())).rejects.toThrow(
			NotFoundError,
		);
	});

	it("creates a full profile when none exists", async () => {
		const user = await createTestUser();
		const catalogSkill = await createCatalogSkill(`skill-${Date.now()}`);
		const catalogCompetence = await createCatalogCompetence(`competence-${Date.now()}`);
		const catalogTag = await createCatalogTag(`tag-${Date.now()}`);

		const result = await profileSaveService.save(
			user.id,
			buildSaveInput(
				{},
				{
					skillId: catalogSkill.id,
					skillName: catalogSkill.name,
					competenceId: catalogCompetence.id,
					competenceName: catalogCompetence.name,
					tagId: catalogTag.id,
					tagName: catalogTag.name,
				},
			),
		);

		expect(result).not.toBeNull();
		expect(result!.userId).toBe(user.id);
		expect(result!.firstName).toBe("John");
		expect(result!.lastName).toBe("Doe");
		expect(result!.phone).toBe("0606060606");
		expect(result!.location).toBe("Paris");
		expect(result!.email).toBe("john@test.com");
		expect(result!.photo).toBe("photo.png");

		expect(result!.description?.description).toBe("À propos de moi");
		expect(result!.philosophy?.citation).toBe("Philosophie 1");
		expect(result!.philosophy?.author).toBe("Author 1");

		expect(result!.experiences).toHaveLength(1);
		expect(result!.experiences[0]?.title).toBe("Développeur");
		expect(result!.experiences[0]?.company).toBe("Acme");
		expect(result!.experiences[0]?.location).toBe("Paris");
		expect(result!.experiences[0]?.description).toBe("Dev fullstack");
		expect(result!.experiences[0]?.start).toStrictEqual(start);
		expect(result!.experiences[0]?.end).toStrictEqual(end);
		expect(result!.experiences[0]?.missions).toHaveLength(1);
		expect(result!.experiences[0]?.missions[0]?.content).toBe("Développer des features");

		expect(result!.projects).toHaveLength(1);
		expect(result!.projects[0]?.title).toBe("Projet 1");
		expect(result!.projects[0]?.technology).toBe("React");
		expect(result!.projects[0]?.status).toBe(CvTimelineStatus.INTERRUPTED);
		expect(result!.projects[0]?.missions).toHaveLength(1);
		expect(result!.projects[0]?.missions[0]?.content).toBe("Développer des features");

		expect(result!.volunteerings).toHaveLength(1);
		expect(result!.volunteerings[0]?.title).toBe("Volontariat 1");
		expect(result!.volunteerings[0]?.organisation).toBe("Organisation 1");
		expect(result!.volunteerings[0]?.missions).toHaveLength(1);

		expect(result!.formations).toHaveLength(1);
		expect(result!.formations[0]?.title).toBe("Formation 1");
		expect(result!.formations[0]?.organismeFormation).toBe("Organisation 1");
		expect(result!.formations[0]?.status).toBe(CvTimelineStatus.COMPLETED);

		expect(result!.certifications).toHaveLength(1);
		expect(result!.certifications[0]?.title).toBe("Certification 1");
		expect(result!.certifications[0]?.organismeCertification).toBe("Organisation 1");

		expect(result!.prizes).toHaveLength(1);
		expect(result!.prizes[0]?.title).toBe("Prix 1");
		expect(result!.prizes[0]?.domaine).toBe("Domain 1");

		expect(result!.expertises).toHaveLength(1);
		expect(result!.expertises[0]?.title).toBe("Expertise 1");
		expect(result!.expertises[0]?.level).toBe(Level.Débutant);

		expect(result!.socialMedias).toHaveLength(1);
		expect(result!.socialMedias[0]?.socialNetwork).toBe("Social Network 1");
		expect(result!.socialMedias[0]?.username).toBe("JohnDoe");

		expect(result!.passions).toHaveLength(1);
		expect(result!.passions[0]?.title).toBe("Passion 1");
		expect(result!.passions[0]?.icon).toBe("BsBalloonHeartFill");

		expect(result!.languages).toHaveLength(1);
		expect(result!.languages[0]?.name).toBe("Language 1");
		expect(result!.languages[0]?.level).toBe(Level.Débutant);

		expect(result!.publications).toHaveLength(1);
		expect(result!.publications[0]?.title).toBe("Publication 1");
		expect(result!.publications[0]?.journalName).toBe("Journal 1");

		expect(result!.strengths).toHaveLength(1);
		expect(result!.strengths[0]?.title).toBe("Strength 1");
		expect(result!.strengths[0]?.icon).toBe("FaThumbsUp");

		expect(result!.achievements).toHaveLength(1);
		expect(result!.achievements[0]?.title).toBe("Achievement 1");
		expect(result!.achievements[0]?.year).toBe(2021);

		expect(result!.educations).toHaveLength(1);
		expect(result!.educations[0]?.title).toBe("Education 1");
		expect(result!.educations[0]?.school).toBe("School 1");
		expect(result!.educations[0]?.obtained).toBe(CvTimelineStatus.COMPLETED);

		expect(result!.skills).toHaveLength(1);
		expect(result!.skills[0]?.title).toBe("Skill Group 1");
		expect(result!.skills[0]?.skills).toHaveLength(1);
		expect(result!.skills[0]?.skills[0]?.skill?.name).toBe(catalogSkill.name);
		expect(result!.skills[0]?.skills[0]?.level).toBe(Level.Débutant);

		expect(result!.competences).toHaveLength(1);
		expect(result!.competences[0]?.title).toBe("Competence Group 1");
		expect(result!.competences[0]?.competences).toHaveLength(1);
		expect(result!.competences[0]?.competences[0]?.competence?.name).toBe(catalogCompetence.name);

		expect(result!.tags).toHaveLength(1);
		expect(result!.tags[0]?.title).toBe("Tag Group 1");
		expect(result!.tags[0]?.tags).toHaveLength(1);
		expect(result!.tags[0]?.tags[0]?.tag?.name).toBe(catalogTag.name);

		const count = await prismaTest.profile.count({ where: { userId: user.id } });
		expect(count).toBe(1);
	});

	it("upserts identity fields on an existing profile", async () => {
		const user = await createTestUser();
		const existing = await createTestProfile(user.id, "Old", "Name");

		const updated = await profileSaveService.save(
			user.id,
			identity({
				firstName: "Jane",
				lastName: "Roe",
				phone: "0707070707",
				location: "Lyon",
				email: "jane@test.com",
				photo: "new.png",
			}),
		);

		expect(updated!.id).toBe(existing.id);
		expect(updated!.firstName).toBe("Jane");
		expect(updated!.lastName).toBe("Roe");
		expect(updated!.phone).toBe("0707070707");
		expect(updated!.location).toBe("Lyon");
		expect(updated!.email).toBe("jane@test.com");
		expect(updated!.photo).toBe("new.png");

		const count = await prismaTest.profile.count({ where: { userId: user.id } });
		expect(count).toBe(1);
	});

	it("upserts description and philosophy, then deletes them when omitted", async () => {
		const user = await createTestUser();
		const created = await profileSaveService.save(
			user.id,
			identity({
				description: { description: "Première bio" },
				philosophy: { citation: "Citation A", author: "A" },
			}),
		);
		expect(created!.description?.description).toBe("Première bio");
		expect(created!.philosophy?.citation).toBe("Citation A");
		const descriptionId = created!.description?.id;
		const philosophyId = created!.philosophy?.id;

		const updated = await profileSaveService.save(
			user.id,
			identity({
				description: { description: "Bio mise à jour" },
				philosophy: { citation: "Citation B", author: "B" },
			}),
		);
		expect(updated!.description?.id).toBe(descriptionId);
		expect(updated!.description?.description).toBe("Bio mise à jour");
		expect(updated!.philosophy?.id).toBe(philosophyId);
		expect(updated!.philosophy?.citation).toBe("Citation B");
		expect(updated!.philosophy?.author).toBe("B");

		const cleared = await profileSaveService.save(user.id, identity());
		expect(cleared!.description).toBeNull();
		expect(cleared!.philosophy).toBeNull();
	});

	it("replaces experiences: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const created = await profileSaveService.save(
			user.id,
			identity({
				experiences: [
					item("exp-1", 1, {
						title: "First",
						company: "A",
						start,
						missions: [],
					}),
					item("exp-2", 2, {
						title: "Second",
						company: "B",
						start,
						missions: [],
					}),
				],
			}),
		);
		const keepId = created!.experiences.find((e) => e.title === "First")?.id;
		expect(keepId).toBeDefined();

		const updated = await profileSaveService.save(
			user.id,
			identity({
				experiences: [
					{
						id: keepId,
						...item("exp-1", 1, {
							title: "First updated",
							company: "A",
							start,
							missions: [mission("m-new", "Nouvelle mission")],
						}),
					},
				],
			}),
		);

		expect(updated!.experiences).toHaveLength(1);
		expect(updated!.experiences[0]?.id).toBe(keepId);
		expect(updated!.experiences[0]?.title).toBe("First updated");
		expect(updated!.experiences[0]?.missions).toHaveLength(1);
		expect(updated!.experiences[0]?.missions[0]?.content).toBe("Nouvelle mission");
	});

	it("updates existing experience missions and deletes unlisted ones", async () => {
		const user = await createTestUser();
		const created = await profileSaveService.save(
			user.id,
			identity({
				experiences: [
					item("exp-1", 1, {
						title: "Dev",
						company: "Acme",
						start,
						missions: [mission("m1", "Mission A", 1), mission("m2", "Mission B", 2)],
					}),
				],
			}),
		);
		const experienceId = created!.experiences[0]?.id;
		const keepMissionId = created!.experiences[0]?.missions.find(
			(m) => m.content === "Mission A",
		)?.id;
		expect(experienceId).toBeDefined();
		expect(keepMissionId).toBeDefined();

		const updated = await profileSaveService.save(
			user.id,
			identity({
				experiences: [
					{
						id: experienceId,
						...item("exp-1", 1, {
							title: "Dev",
							company: "Acme",
							start,
							missions: [
								{
									id: keepMissionId,
									...mission("m1", "Mission A updated", 1),
								},
							],
						}),
					},
				],
			}),
		);

		expect(updated!.experiences[0]?.missions).toHaveLength(1);
		expect(updated!.experiences[0]?.missions[0]?.id).toBe(keepMissionId);
		expect(updated!.experiences[0]?.missions[0]?.content).toBe("Mission A updated");
	});

	it("replaces projects: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const created = await profileSaveService.save(
			user.id,
			identity({
				projects: [
					item("project-1", 1, {
						title: "First",
						start,
						end,
						status: CvTimelineStatus.INTERRUPTED,
						technology: "React",
						missions: [],
					}),
					item("project-2", 2, {
						title: "Second",
						start,
						end,
						status: CvTimelineStatus.COMPLETED,
						technology: "Angular",
						missions: [],
					}),
				],
			}),
		);
		const keepId = created!.projects.find((p) => p.title === "First")?.id;
		expect(keepId).toBeDefined();

		const updated = await profileSaveService.save(
			user.id,
			identity({
				projects: [
					{
						id: keepId,
						...item("project-1", 1, {
							title: "First updated",
							start,
							end,
							status: CvTimelineStatus.COMPLETED,
							technology: "Vue",
							missions: [mission("m-new", "Nouvelle mission")],
						}),
					},
				],
			}),
		);

		expect(updated!.projects).toHaveLength(1);
		expect(updated!.projects[0]?.id).toBe(keepId);
		expect(updated!.projects[0]?.title).toBe("First updated");
		expect(updated!.projects[0]?.technology).toBe("Vue");
		expect(updated!.projects[0]?.missions).toHaveLength(1);
	});

	it("updates existing project missions and deletes unlisted ones", async () => {
		const user = await createTestUser();
		const created = await profileSaveService.save(
			user.id,
			identity({
				projects: [
					item("project-1", 1, {
						title: "App",
						start,
						end,
						status: CvTimelineStatus.COMPLETED,
						technology: "React",
						missions: [mission("m1", "Mission A", 1), mission("m2", "Mission B", 2)],
					}),
				],
			}),
		);
		const projectId = created!.projects[0]?.id;
		const keepMissionId = created!.projects[0]?.missions.find((m) => m.content === "Mission A")?.id;

		const updated = await profileSaveService.save(
			user.id,
			identity({
				projects: [
					{
						id: projectId,
						...item("project-1", 1, {
							title: "App",
							start,
							end,
							status: CvTimelineStatus.COMPLETED,
							technology: "React",
							missions: [
								{
									id: keepMissionId,
									...mission("m1", "Mission A updated", 1),
								},
							],
						}),
					},
				],
			}),
		);

		expect(updated!.projects[0]?.missions).toHaveLength(1);
		expect(updated!.projects[0]?.missions[0]?.id).toBe(keepMissionId);
		expect(updated!.projects[0]?.missions[0]?.content).toBe("Mission A updated");
	});

	it("replaces volunteerings: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const created = await profileSaveService.save(
			user.id,
			identity({
				volunteerings: [
					item("vol-1", 1, {
						title: "First",
						organisation: "A",
						start,
						missions: [],
					}),
					item("vol-2", 2, {
						title: "Second",
						organisation: "B",
						start,
						missions: [],
					}),
				],
			}),
		);
		const keepId = created!.volunteerings.find((v) => v.title === "First")?.id;

		const updated = await profileSaveService.save(
			user.id,
			identity({
				volunteerings: [
					{
						id: keepId,
						...item("vol-1", 1, {
							title: "First updated",
							organisation: "A",
							start,
							missions: [mission("m-new", "Nouvelle mission")],
						}),
					},
				],
			}),
		);

		expect(updated!.volunteerings).toHaveLength(1);
		expect(updated!.volunteerings[0]?.id).toBe(keepId);
		expect(updated!.volunteerings[0]?.title).toBe("First updated");
		expect(updated!.volunteerings[0]?.missions).toHaveLength(1);
	});

	it("updates existing volunteering missions and deletes unlisted ones", async () => {
		const user = await createTestUser();
		const created = await profileSaveService.save(
			user.id,
			identity({
				volunteerings: [
					item("vol-1", 1, {
						title: "Asso",
						organisation: "Org",
						start,
						missions: [mission("m1", "Mission A", 1), mission("m2", "Mission B", 2)],
					}),
				],
			}),
		);
		const volunteeringId = created!.volunteerings[0]?.id;
		const keepMissionId = created!.volunteerings[0]?.missions.find(
			(m) => m.content === "Mission A",
		)?.id;

		const updated = await profileSaveService.save(
			user.id,
			identity({
				volunteerings: [
					{
						id: volunteeringId,
						...item("vol-1", 1, {
							title: "Asso",
							organisation: "Org",
							start,
							missions: [
								{
									id: keepMissionId,
									...mission("m1", "Mission A updated", 1),
								},
							],
						}),
					},
				],
			}),
		);

		expect(updated!.volunteerings[0]?.missions).toHaveLength(1);
		expect(updated!.volunteerings[0]?.missions[0]?.id).toBe(keepMissionId);
		expect(updated!.volunteerings[0]?.missions[0]?.content).toBe("Mission A updated");
	});

	it("replaces formations: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const created = await profileSaveService.save(
			user.id,
			identity({
				formations: [
					item("f-1", 1, { title: "First", start, organismeFormation: "A" }),
					item("f-2", 2, { title: "Second", start, organismeFormation: "B" }),
				],
			}),
		);
		const keepId = created!.formations.find((f) => f.title === "First")?.id;

		const updated = await profileSaveService.save(
			user.id,
			identity({
				formations: [
					{
						id: keepId,
						...item("f-1", 1, {
							title: "First updated",
							start,
							end,
							status: CvTimelineStatus.COMPLETED,
							organismeFormation: "A updated",
						}),
					},
				],
			}),
		);

		expect(updated!.formations).toHaveLength(1);
		expect(updated!.formations[0]?.id).toBe(keepId);
		expect(updated!.formations[0]?.title).toBe("First updated");
		expect(updated!.formations[0]?.organismeFormation).toBe("A updated");
	});

	it("replaces certifications: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const created = await profileSaveService.save(
			user.id,
			identity({
				certifications: [
					item("c-1", 1, {
						title: "First",
						organismeCertification: "A",
					}),
					item("c-2", 2, {
						title: "Second",
						organismeCertification: "B",
					}),
				],
			}),
		);
		const keepId = created!.certifications.find((c) => c.title === "First")?.id;

		const updated = await profileSaveService.save(
			user.id,
			identity({
				certifications: [
					{
						id: keepId,
						...item("c-1", 1, {
							title: "First updated",
							organismeCertification: "A updated",
						}),
					},
				],
			}),
		);

		expect(updated!.certifications).toHaveLength(1);
		expect(updated!.certifications[0]?.id).toBe(keepId);
		expect(updated!.certifications[0]?.title).toBe("First updated");
	});

	it("replaces prizes: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const created = await profileSaveService.save(
			user.id,
			identity({
				prizes: [
					item("p-1", 1, { title: "First", icon: "A", domaine: "Dom A" }),
					item("p-2", 2, { title: "Second", icon: "B", domaine: "Dom B" }),
				],
			}),
		);
		const keepId = created!.prizes.find((p) => p.title === "First")?.id;

		const updated = await profileSaveService.save(
			user.id,
			identity({
				prizes: [
					{
						id: keepId,
						...item("p-1", 1, {
							title: "First updated",
							icon: "FaTrophy",
							domaine: "Dom A updated",
						}),
					},
				],
			}),
		);

		expect(updated!.prizes).toHaveLength(1);
		expect(updated!.prizes[0]?.id).toBe(keepId);
		expect(updated!.prizes[0]?.title).toBe("First updated");
		expect(updated!.prizes[0]?.domaine).toBe("Dom A updated");
	});

	it("replaces expertises: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const created = await profileSaveService.save(
			user.id,
			identity({
				expertises: [
					item("e-1", 1, { title: "First", level: Level.Débutant }),
					item("e-2", 2, { title: "Second", level: Level.Senior }),
				],
			}),
		);
		const keepId = created!.expertises.find((e) => e.title === "First")?.id;

		const updated = await profileSaveService.save(
			user.id,
			identity({
				expertises: [
					{
						id: keepId,
						...item("e-1", 1, { title: "First updated", level: Level.Expert }),
					},
				],
			}),
		);

		expect(updated!.expertises).toHaveLength(1);
		expect(updated!.expertises[0]?.id).toBe(keepId);
		expect(updated!.expertises[0]?.title).toBe("First updated");
		expect(updated!.expertises[0]?.level).toBe(Level.Expert);
	});

	it("replaces social media: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const created = await profileSaveService.save(
			user.id,
			identity({
				socialMedias: [
					item("s-1", 1, {
						socialNetwork: "LinkedIn",
						username: "john",
						icon: "in",
					}),
					item("s-2", 2, {
						socialNetwork: "GitHub",
						username: "john-gh",
						icon: "gh",
					}),
				],
			}),
		);
		const keepId = created!.socialMedias.find((s) => s.socialNetwork === "LinkedIn")?.id;

		const updated = await profileSaveService.save(
			user.id,
			identity({
				socialMedias: [
					{
						id: keepId,
						...item("s-1", 1, {
							socialNetwork: "LinkedIn",
							username: "jane",
							icon: "in",
						}),
					},
				],
			}),
		);

		expect(updated!.socialMedias).toHaveLength(1);
		expect(updated!.socialMedias[0]?.id).toBe(keepId);
		expect(updated!.socialMedias[0]?.username).toBe("jane");
	});

	it("replaces passions: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const created = await profileSaveService.save(
			user.id,
			identity({
				passions: [
					item("p-1", 1, { title: "First", icon: "A" }),
					item("p-2", 2, { title: "Second", icon: "B" }),
				],
			}),
		);
		const keepId = created!.passions.find((p) => p.title === "First")?.id;

		const updated = await profileSaveService.save(
			user.id,
			identity({
				passions: [
					{
						id: keepId,
						...item("p-1", 1, { title: "First updated", icon: "FaHeart" }),
					},
				],
			}),
		);

		expect(updated!.passions).toHaveLength(1);
		expect(updated!.passions[0]?.id).toBe(keepId);
		expect(updated!.passions[0]?.title).toBe("First updated");
	});

	it("replaces languages: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const created = await profileSaveService.save(
			user.id,
			identity({
				languages: [
					item("l-1", 1, { name: "First", level: Level.Débutant }),
					item("l-2", 2, { name: "Second", level: Level.Senior }),
				],
			}),
		);
		const keepId = created!.languages.find((l) => l.name === "First")?.id;

		const updated = await profileSaveService.save(
			user.id,
			identity({
				languages: [
					{
						id: keepId,
						...item("l-1", 1, { name: "First", level: Level.Expert }),
					},
				],
			}),
		);

		expect(updated!.languages).toHaveLength(1);
		expect(updated!.languages[0]?.id).toBe(keepId);
		expect(updated!.languages[0]?.level).toBe(Level.Expert);
	});

	it("replaces publications: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const created = await profileSaveService.save(
			user.id,
			identity({
				publications: [
					item("p-1", 1, { title: "First", start }),
					item("p-2", 2, { title: "Second", start }),
				],
			}),
		);
		const keepId = created!.publications.find((p) => p.title === "First")?.id;

		const updated = await profileSaveService.save(
			user.id,
			identity({
				publications: [
					{
						id: keepId,
						...item("p-1", 1, {
							title: "First updated",
							start,
							end,
							journalName: "Journal updated",
							description: "Desc",
							url: "https://example.com",
						}),
					},
				],
			}),
		);

		expect(updated!.publications).toHaveLength(1);
		expect(updated!.publications[0]?.id).toBe(keepId);
		expect(updated!.publications[0]?.title).toBe("First updated");
		expect(updated!.publications[0]?.journalName).toBe("Journal updated");
	});

	it("replaces strengths: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const created = await profileSaveService.save(
			user.id,
			identity({
				strengths: [
					item("s-1", 1, { title: "First", icon: "A" }),
					item("s-2", 2, { title: "Second", icon: "B" }),
				],
			}),
		);
		const keepId = created!.strengths.find((s) => s.title === "First")?.id;

		const updated = await profileSaveService.save(
			user.id,
			identity({
				strengths: [
					{
						id: keepId,
						...item("s-1", 1, {
							title: "First updated",
							icon: "FaThumbsUp",
							description: "Desc",
						}),
					},
				],
			}),
		);

		expect(updated!.strengths).toHaveLength(1);
		expect(updated!.strengths[0]?.id).toBe(keepId);
		expect(updated!.strengths[0]?.title).toBe("First updated");
	});

	it("replaces stats: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const created = await profileSaveService.save(
			user.id,
			identity({
				stats: [
					item("st-1", 1, { label: "projets", value: "+50" }),
					item("st-2", 2, { label: "clients", value: "12" }),
				],
			}),
		);
		const keepId = created!.stats.find((s) => s.label === "projets")?.id;

		const updated = await profileSaveService.save(
			user.id,
			identity({
				stats: [
					{
						id: keepId,
						...item("st-1", 1, {
							label: "projets",
							value: "+99",
						}),
					},
				],
			}),
		);

		expect(updated!.stats).toHaveLength(1);
		expect(updated!.stats[0]?.id).toBe(keepId);
		expect(updated!.stats[0]?.value).toBe("+99");
	});

	it("replaces achievements: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const created = await profileSaveService.save(
			user.id,
			identity({
				achievements: [item("a-1", 1, { title: "First" }), item("a-2", 2, { title: "Second" })],
			}),
		);
		const keepId = created!.achievements.find((a) => a.title === "First")?.id;

		const updated = await profileSaveService.save(
			user.id,
			identity({
				achievements: [
					{
						id: keepId,
						...item("a-1", 1, {
							title: "First updated",
							description: "Desc",
							year: 2022,
							technology: "Go",
						}),
					},
				],
			}),
		);

		expect(updated!.achievements).toHaveLength(1);
		expect(updated!.achievements[0]?.id).toBe(keepId);
		expect(updated!.achievements[0]?.title).toBe("First updated");
		expect(updated!.achievements[0]?.year).toBe(2022);
	});

	it("replaces educations: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const created = await profileSaveService.save(
			user.id,
			identity({
				educations: [
					item("e-1", 1, { title: "First", school: "A", degree: "D", start }),
					item("e-2", 2, { title: "Second", school: "B", degree: "D", start }),
				],
			}),
		);
		const keepId = created!.educations.find((e) => e.title === "First")?.id;

		const updated = await profileSaveService.save(
			user.id,
			identity({
				educations: [
					{
						id: keepId,
						...item("e-1", 1, {
							title: "First updated",
							school: "School updated",
							degree: "Degree updated",
							city: "Lyon",
							start,
							end,
							obtained: CvTimelineStatus.COMPLETED,
						}),
					},
				],
			}),
		);

		expect(updated!.educations).toHaveLength(1);
		expect(updated!.educations[0]?.id).toBe(keepId);
		expect(updated!.educations[0]?.title).toBe("First updated");
		expect(updated!.educations[0]?.school).toBe("School updated");
	});

	it("replaces skillGroups: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const skillA = await createCatalogSkill(`A-${Date.now()}`);
		const skillB = await createCatalogSkill(`B-${Date.now()}`);
		const skillC = await createCatalogSkill(`C-${Date.now()}`);
		const created = await profileSaveService.save(
			user.id,
			identity({
				skillGroups: [
					item("sg-1", 1, {
						title: "First",
						skills: [
							item("s-a", 1, {
								name: skillA.name,
								skillId: skillA.id,
								level: Level.Débutant,
							}),
							item("s-b", 2, {
								name: skillB.name,
								skillId: skillB.id,
								level: Level.Senior,
							}),
						],
					}),
					item("sg-2", 2, {
						title: "Second",
						skills: [
							item("s-c", 1, {
								name: skillC.name,
								skillId: skillC.id,
								level: Level.Expert,
							}),
						],
					}),
				],
			}),
		);
		const keepGroup = created!.skills.find((g) => g.title === "First");
		expect(keepGroup).toBeDefined();
		const keepSkill = keepGroup!.skills.find((s) => s.skillId === skillA.id);
		expect(keepSkill).toBeDefined();

		const updated = await profileSaveService.save(
			user.id,
			identity({
				skillGroups: [
					{
						id: keepGroup!.id,
						...item("sg-1", 1, {
							title: "First updated",
							skills: [
								{
									id: keepSkill!.id,
									...item("s-a", 1, {
										name: skillA.name,
										skillId: skillA.id,
										level: Level.Expert,
									}),
								},
								item("s-c-new", 2, {
									name: skillC.name,
									skillId: skillC.id,
									level: Level.Débutant,
								}),
							],
						}),
					},
				],
			}),
		);

		expect(updated!.skills).toHaveLength(1);
		expect(updated!.skills[0]?.id).toBe(keepGroup!.id);
		expect(updated!.skills[0]?.title).toBe("First updated");
		expect(updated!.skills[0]?.skills).toHaveLength(2);
		const skills = updated!.skills[0]!.skills;
		expect(skills.find((s) => s.id === keepSkill!.id)?.level).toBe(Level.Expert);
		expect(skills.some((s) => s.skillId === skillB.id)).toBe(false);
		expect(skills.some((s) => s.skillId === skillC.id)).toBe(true);
	});

	it("resolves skill by name when skillId is omitted (findFirst then create catalog)", async () => {
		const user = await createTestUser();
		const existingName = `Existing-${Date.now()}`;
		const existing = await createCatalogSkill(existingName);
		const brandNewName = `BrandNew-${Date.now()}`;

		const result = await profileSaveService.save(
			user.id,
			identity({
				skillGroups: [
					item("sg-1", 1, {
						title: "Group",
						skills: [
							item("s-existing", 1, {
								name: existingName,
								level: Level.Débutant,
							}),
							item("s-new", 2, {
								name: brandNewName,
								level: Level.Senior,
							}),
						],
					}),
				],
			}),
		);

		const group = result!.skills[0]!;
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

	it("skips skills with a blank name", async () => {
		const user = await createTestUser();
		const result = await profileSaveService.save(
			user.id,
			identity({
				skillGroups: [
					item("sg-1", 1, {
						title: "Group",
						skills: [
							item("s-empty", 1, { name: "   ", level: Level.Débutant }),
							item("s-ok", 2, { name: "React", level: Level.Senior }),
						],
					}),
				],
			}),
		);

		expect(result!.skills[0]?.skills).toHaveLength(1);
		expect(result!.skills[0]?.skills[0]?.skill?.name).toBe("React");
	});

	it("clears all skills in a kept skillGroup when skills is empty", async () => {
		const user = await createTestUser();
		const skill = await createCatalogSkill();
		const created = await profileSaveService.save(
			user.id,
			identity({
				skillGroups: [
					item("sg-1", 1, {
						title: "Keep me",
						skills: [
							item("s-1", 1, {
								name: skill.name,
								skillId: skill.id,
								level: Level.Débutant,
							}),
						],
					}),
				],
			}),
		);
		const groupId = created!.skills[0]?.id;

		const updated = await profileSaveService.save(
			user.id,
			identity({
				skillGroups: [
					{
						id: groupId,
						...item("sg-1", 1, { title: "Keep me", skills: [] }),
					},
				],
			}),
		);

		expect(updated!.skills).toHaveLength(1);
		expect(updated!.skills[0]?.id).toBe(groupId);
		expect(updated!.skills[0]?.skills).toHaveLength(0);
	});

	it("replaces competenceGroups: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const competenceA = await createCatalogCompetence(`A-${Date.now()}`);
		const competenceB = await createCatalogCompetence(`B-${Date.now()}`);
		const competenceC = await createCatalogCompetence(`C-${Date.now()}`);
		const created = await profileSaveService.save(
			user.id,
			identity({
				competenceGroups: [
					item("cg-1", 1, {
						title: "First",
						competences: [
							item("c-a", 1, {
								name: competenceA.name,
								competenceId: competenceA.id,
							}),
							item("c-b", 2, {
								name: competenceB.name,
								competenceId: competenceB.id,
							}),
						],
					}),
					item("cg-2", 2, {
						title: "Second",
						competences: [
							item("c-c", 1, {
								name: competenceC.name,
								competenceId: competenceC.id,
							}),
						],
					}),
				],
			}),
		);
		const keepGroup = created!.competences.find((g) => g.title === "First");
		const keepCompetence = keepGroup!.competences.find((c) => c.competenceId === competenceA.id);

		const updated = await profileSaveService.save(
			user.id,
			identity({
				competenceGroups: [
					{
						id: keepGroup!.id,
						...item("cg-1", 1, {
							title: "First updated",
							competences: [
								{
									id: keepCompetence!.id,
									...item("c-a", 1, {
										name: competenceA.name,
										competenceId: competenceA.id,
									}),
								},
								item("c-c-new", 2, {
									name: competenceC.name,
									competenceId: competenceC.id,
								}),
							],
						}),
					},
				],
			}),
		);

		expect(updated!.competences).toHaveLength(1);
		expect(updated!.competences[0]?.id).toBe(keepGroup!.id);
		expect(updated!.competences[0]?.title).toBe("First updated");
		expect(updated!.competences[0]?.competences).toHaveLength(2);
		expect(
			updated!.competences[0]?.competences.some((c) => c.competenceId === competenceB.id),
		).toBe(false);
		expect(
			updated!.competences[0]?.competences.some((c) => c.competenceId === competenceC.id),
		).toBe(true);
	});

	it("resolves competence by name when competenceId is omitted", async () => {
		const user = await createTestUser();
		const existingName = `ExistingC-${Date.now()}`;
		const existing = await createCatalogCompetence(existingName);
		const brandNewName = `BrandNewC-${Date.now()}`;

		const result = await profileSaveService.save(
			user.id,
			identity({
				competenceGroups: [
					item("cg-1", 1, {
						title: "Group",
						competences: [
							item("c-existing", 1, { name: existingName }),
							item("c-new", 2, { name: brandNewName }),
						],
					}),
				],
			}),
		);

		const group = result!.competences[0]!;
		expect(group.competences).toHaveLength(2);
		expect(group.competences.find((c) => c.competence?.name === existingName)?.competenceId).toBe(
			existing.id,
		);
		const catalogNew = await prismaTest.competence.findFirst({
			where: { name: brandNewName },
		});
		expect(catalogNew).toBeTruthy();
		expect(group.competences.find((c) => c.competence?.name === brandNewName)?.competenceId).toBe(
			catalogNew!.id,
		);
	});

	it("replaces tagGroups: keeps listed ids and deletes others", async () => {
		const user = await createTestUser();
		const tagA = await createCatalogTag(`A-${Date.now()}`);
		const tagB = await createCatalogTag(`B-${Date.now()}`);
		const tagC = await createCatalogTag(`C-${Date.now()}`);
		const created = await profileSaveService.save(
			user.id,
			identity({
				tagGroups: [
					item("tg-1", 1, {
						title: "First",
						tags: [
							item("t-a", 1, { name: tagA.name, tagId: tagA.id }),
							item("t-b", 2, { name: tagB.name, tagId: tagB.id }),
						],
					}),
					item("tg-2", 2, {
						title: "Second",
						tags: [item("t-c", 1, { name: tagC.name, tagId: tagC.id })],
					}),
				],
			}),
		);
		const keepGroup = created!.tags.find((g) => g.title === "First");
		const keepTag = keepGroup!.tags.find((t) => t.tagId === tagA.id);

		const updated = await profileSaveService.save(
			user.id,
			identity({
				tagGroups: [
					{
						id: keepGroup!.id,
						...item("tg-1", 1, {
							title: "First updated",
							tags: [
								{
									id: keepTag!.id,
									...item("t-a", 1, { name: tagA.name, tagId: tagA.id }),
								},
								item("t-c-new", 2, { name: tagC.name, tagId: tagC.id }),
							],
						}),
					},
				],
			}),
		);

		expect(updated!.tags).toHaveLength(1);
		expect(updated!.tags[0]?.id).toBe(keepGroup!.id);
		expect(updated!.tags[0]?.title).toBe("First updated");
		expect(updated!.tags[0]?.tags).toHaveLength(2);
		expect(updated!.tags[0]?.tags.some((t) => t.tagId === tagB.id)).toBe(false);
		expect(updated!.tags[0]?.tags.some((t) => t.tagId === tagC.id)).toBe(true);
	});

	it("resolves tag by name when tagId is omitted", async () => {
		const user = await createTestUser();
		const existingName = `ExistingT-${Date.now()}`;
		const existing = await createCatalogTag(existingName);
		const brandNewName = `BrandNewT-${Date.now()}`;

		const result = await profileSaveService.save(
			user.id,
			identity({
				tagGroups: [
					item("tg-1", 1, {
						title: "Group",
						tags: [
							item("t-existing", 1, { name: existingName }),
							item("t-new", 2, { name: brandNewName }),
						],
					}),
				],
			}),
		);

		const group = result!.tags[0]!;
		expect(group.tags).toHaveLength(2);
		expect(group.tags.find((t) => t.tag?.name === existingName)?.tagId).toBe(existing.id);
		const catalogNew = await prismaTest.tag.findFirst({
			where: { name: brandNewName },
		});
		expect(group.tags.find((t) => t.tag?.name === brandNewName)?.tagId).toBe(catalogNew!.id);
	});

	it("deletes all list sections when they are empty arrays", async () => {
		const user = await createTestUser();
		const created = await profileSaveService.save(user.id, buildSaveInput());
		expect(created!.experiences.length).toBeGreaterThan(0);
		expect(created!.projects.length).toBeGreaterThan(0);
		expect(created!.skills.length).toBeGreaterThan(0);

		const updated = await profileSaveService.save(
			user.id,
			identity({
				experiences: [],
				projects: [],
				volunteerings: [],
				formations: [],
				certifications: [],
				prizes: [],
				expertises: [],
				socialMedias: [],
				passions: [],
				languages: [],
				publications: [],
				strengths: [],
				achievements: [],
				educations: [],
				skillGroups: [],
				competenceGroups: [],
				tagGroups: [],
			}),
		);

		expect(updated!.experiences).toHaveLength(0);
		expect(updated!.projects).toHaveLength(0);
		expect(updated!.volunteerings).toHaveLength(0);
		expect(updated!.formations).toHaveLength(0);
		expect(updated!.certifications).toHaveLength(0);
		expect(updated!.prizes).toHaveLength(0);
		expect(updated!.expertises).toHaveLength(0);
		expect(updated!.socialMedias).toHaveLength(0);
		expect(updated!.passions).toHaveLength(0);
		expect(updated!.languages).toHaveLength(0);
		expect(updated!.publications).toHaveLength(0);
		expect(updated!.strengths).toHaveLength(0);
		expect(updated!.achievements).toHaveLength(0);
		expect(updated!.educations).toHaveLength(0);
		expect(updated!.skills).toHaveLength(0);
		expect(updated!.competences).toHaveLength(0);
		expect(updated!.tags).toHaveLength(0);
	});

	it("does not touch list sections when they are omitted", async () => {
		const user = await createTestUser();
		const created = await profileSaveService.save(user.id, buildSaveInput());
		expect(created!.experiences).toHaveLength(1);

		const updated = await profileSaveService.save(user.id, identity({ firstName: "Jane" }));

		expect(updated!.firstName).toBe("Jane");
		expect(updated!.experiences).toHaveLength(1);
		expect(updated!.experiences[0]?.title).toBe("Développeur");
		expect(updated!.projects).toHaveLength(1);
		expect(updated!.volunteerings).toHaveLength(1);
		expect(updated!.formations).toHaveLength(1);
		expect(updated!.certifications).toHaveLength(1);
		expect(updated!.prizes).toHaveLength(1);
		expect(updated!.expertises).toHaveLength(1);
		expect(updated!.socialMedias).toHaveLength(1);
		expect(updated!.passions).toHaveLength(1);
		expect(updated!.languages).toHaveLength(1);
		expect(updated!.publications).toHaveLength(1);
		expect(updated!.strengths).toHaveLength(1);
		expect(updated!.achievements).toHaveLength(1);
		expect(updated!.educations).toHaveLength(1);
		expect(updated!.skills).toHaveLength(1);
		expect(updated!.competences).toHaveLength(1);
		expect(updated!.tags).toHaveLength(1);
	});

	it("uses order from the list index when order is omitted", async () => {
		const user = await createTestUser();
		const result = await profileSaveService.save(
			user.id,
			identity({
				strengths: [
					{
						clientKey: "s-1",
						content: { title: "First", icon: "A" },
					},
					{
						clientKey: "s-2",
						content: { title: "Second", icon: "B" },
					},
				],
			}),
		);

		expect(result!.strengths.map((s) => s.order)).toEqual([0, 1]);
	});

	it("stores empty string fallbacks for optional identity-like fields", async () => {
		const user = await createTestUser();
		const result = await profileSaveService.save(
			user.id,
			identity({
				experiences: [item("exp-1", 1, { title: "Dev", start, missions: [] })],
				languages: [item("l-1", 1, {})],
				expertises: [item("e-1", 1, { title: "Exp" })],
				educations: [item("ed-1", 1, { start })],
				skillGroups: [item("sg-1", 1, { title: "   ", skills: [] })],
			}),
		);

		expect(result!.experiences[0]?.company).toBe("");
		expect(result!.languages[0]?.name).toBe("");
		expect(result!.languages[0]?.level).toBe(Level.Débutant);
		expect(result!.expertises[0]?.level).toBe(Level.Débutant);
		expect(result!.educations[0]?.title).toBe("");
		expect(result!.educations[0]?.school).toBe("");
		expect(result!.skills[0]?.title).toBeNull();
	});

	it("roundtrips findCompleteByUserId → mapProfileToSaveInput → save", async () => {
		const user = await createTestUser();
		const catalogSkill = await createCatalogSkill(`rt-skill-${Date.now()}`);
		const catalogCompetence = await createCatalogCompetence(`rt-competence-${Date.now()}`);
		const catalogTag = await createCatalogTag(`rt-tag-${Date.now()}`);
		const created = await profileSaveService.save(
			user.id,
			buildSaveInput(
				{},
				{
					skillId: catalogSkill.id,
					skillName: catalogSkill.name,
					competenceId: catalogCompetence.id,
					competenceName: catalogCompetence.name,
					tagId: catalogTag.id,
					tagName: catalogTag.name,
				},
			),
		);
		expect(created).not.toBeNull();

		const full = await profileService.findCompleteByUserId(user.id);
		expect(full).not.toBeNull();
		const mapped = mapProfileToSaveInput(full!);
		const { id: _id, ...payload } = mapped;
		expect(profileSaveSchema.safeParse(payload).success).toBe(true);

		const saved = await profileSaveService.save(user.id, payload);
		expect(saved!.id).toBe(created!.id);
		expect(saved!.experiences[0]?.id).toBe(created!.experiences[0]?.id);
		expect(saved!.skills[0]?.id).toBe(created!.skills[0]?.id);
		expect(saved!.experiences[0]?.missions[0]?.id).toBe(created!.experiences[0]?.missions[0]?.id);
	});
});
