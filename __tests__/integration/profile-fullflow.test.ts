import { describe, it, expect } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import * as utils from "../utils/create-test-user-with-profile";
import { CvTimelineStatus } from "../../generated/prisma/enums";

describe("Profile Fullflow Integration", () => {
	describe("Profile Full Flow", () => {
		it("should create a full profile with all sections", async () => {
			const user = await utils.createTestUserWithProfile();
			expect(user.profile).toBeDefined();
			expect(user.name).toBe("Bob");
			expect(user.password).toBe("123");
			const profile = user.profile!;
			expect(profile.firstName).toBe("Bob");
			expect(profile.lastName).toBe("Martin");
			expect(profile.phone).toBe("1234567890");
			expect(profile.location).toBe("Paris");
			expect(profile.skills).toBeDefined();
			expect(profile.experiences).toBeDefined();
			expect(profile.educations).toBeDefined();
			expect(profile.achievements).toBeDefined();
			expect(profile.strengths).toBeDefined();
			expect(profile.volunteerings).toBeDefined();
			expect(profile.projects).toBeDefined();
			expect(profile.publications).toBeDefined();
			expect(profile.languages).toBeDefined();
			expect(profile.passions).toBeDefined();
			expect(profile.socialMedias).toBeDefined();
			expect(profile.philosophy).toBeDefined();
			expect(profile.expertises).toBeDefined();
			expect(profile.prizes).toBeDefined();
			expect(profile.certifications).toBeDefined();
			expect(profile.formations).toBeDefined();
			expect(profile.competences).toBeDefined();
			expect(profile.tags).toBeDefined();
			// create achievement
			await utils.createAchievement(
				profile.id,
				"Achievement 1",
				1,
				"Technology 1",
				"Description 1",
				2020,
			);
			const upProfileAchievement = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { achievements: true },
			});
			expect(upProfileAchievement?.achievements).toBeDefined();
			expect(upProfileAchievement?.achievements?.length).toBe(1);
			expect(upProfileAchievement?.achievements?.[0]?.title).toBe(
				"Achievement 1",
			);
			expect(upProfileAchievement?.achievements?.[0]?.description).toBe(
				"Description 1",
			);
			expect(upProfileAchievement?.achievements?.[0]?.technology).toBe(
				"Technology 1",
			);
			expect(upProfileAchievement?.achievements?.[0]?.year).toBe(2020);
			expect(upProfileAchievement?.achievements?.[0]?.order).toBe(1);
			// create certifications
			await utils.createCertification(
				profile.id,
				"Certification 1",
				1,
				"Organisme 1",
			);
			const upProfileCertification = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { certifications: true },
			});
			expect(upProfileCertification?.certifications).toBeDefined();
			expect(upProfileCertification?.certifications?.length).toBe(1);
			expect(upProfileCertification?.certifications?.[0]?.title).toBe(
				"Certification 1",
			);
			expect(
				upProfileCertification?.certifications?.[0]?.organismeCertification,
			).toBe("Organisme 1");
			expect(upProfileCertification?.certifications?.[0]?.order).toBe(1);
			// create competence
			const competence = await utils.createCompetence("Competence 1");
			const groupCompetence = await utils.createProfileCompetenceGroup(
				profile.id,
				"Competence Group 1",
				1,
			);
			await utils.createProfileCompetence(competence.id, groupCompetence.id);
			const upProfileCompetence = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: {
					competences: {
						include: { competences: { include: { competence: true } } },
					},
				},
			});
			expect(upProfileCompetence?.competences).toBeDefined();
			expect(upProfileCompetence?.competences?.length).toBe(1);
			expect(upProfileCompetence?.competences?.[0]?.title).toBe(
				"Competence Group 1",
			);
			expect(upProfileCompetence?.competences?.[0]?.order).toBe(1);
			expect(
				upProfileCompetence?.competences?.[0]?.competences?.[0]?.competence
					?.name,
			).toBe("Competence 1");
			// create tag
			const tag = await utils.createTag("Tag 1");
			const groupTag = await utils.createProfileTagGroup(
				profile.id,
				"Tag Group 1",
				1,
			);
			await utils.createProfileTag(tag.id, groupTag.id);
			const upProfileTag = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: {
					tags: {
						include: { tags: { include: { tag: true } } },
					},
				},
			});
			expect(upProfileTag?.tags).toBeDefined();
			expect(upProfileTag?.tags?.length).toBe(1);
			expect(upProfileTag?.tags?.[0]?.title).toBe("Tag Group 1");
			expect(upProfileTag?.tags?.[0]?.order).toBe(1);
			expect(upProfileTag?.tags?.[0]?.tags?.[0]?.tag?.name).toBe("Tag 1");
			// create description
			await utils.createDescription(profile.id, "Description 1");
			const upProfileDescription = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { description: true },
			});
			expect(upProfileDescription?.description).toBeDefined();
			expect(upProfileDescription?.description?.description).toBe(
				"Description 1",
			);
			// create education
			const start = new Date();
			const end = new Date();
			await utils.createEducation(
				profile.id,
				"Education 1",
				"School 1",
				"Degree 1",
				start,
				end,
				1,
				CvTimelineStatus.COMPLETED,
			);
			const upProfileEducation = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { educations: true },
			});
			expect(upProfileEducation?.educations).toBeDefined();
			expect(upProfileEducation?.educations?.length).toBe(1);
			expect(upProfileEducation?.educations?.[0]?.title).toBe("Education 1");
			expect(upProfileEducation?.educations?.[0]?.school).toBe("School 1");
			expect(upProfileEducation?.educations?.[0]?.degree).toBe("Degree 1");
			expect(upProfileEducation?.educations?.[0]?.start).toEqual(start);
			expect(upProfileEducation?.educations?.[0]?.end).toEqual(end);
			expect(upProfileEducation?.educations?.[0]?.obtained).toBe(
				CvTimelineStatus.COMPLETED,
			);
			expect(upProfileEducation?.educations?.[0]?.order).toBe(1);
			// create experiences
			await utils.createExperience(
				profile.id,
				"Experience 1",
				"Description 1",
				"Company 1",
				start,
				end,
				"Location 1",
				["Mission 1"],
				1,
			);
			const upProfileExperience = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { experiences: { include: { missions: true } } },
			});
			expect(upProfileExperience?.experiences).toBeDefined();
			expect(upProfileExperience?.experiences?.length).toBe(1);
			expect(upProfileExperience?.experiences?.[0]?.title).toBe("Experience 1");
			expect(upProfileExperience?.experiences?.[0]?.description).toBe(
				"Description 1",
			);
			expect(upProfileExperience?.experiences?.[0]?.company).toBe("Company 1");
			expect(upProfileExperience?.experiences?.[0]?.start).toEqual(start);
			expect(upProfileExperience?.experiences?.[0]?.end).toEqual(end);
			expect(upProfileExperience?.experiences?.[0]?.location).toBe(
				"Location 1",
			);
			expect(upProfileExperience?.experiences?.[0]?.missions).toBeDefined();
			expect(upProfileExperience?.experiences?.[0]?.missions?.length).toBe(1);
			expect(
				upProfileExperience?.experiences?.[0]?.missions?.[0]?.content,
			).toBe("Mission 1");
			expect(upProfileExperience?.experiences?.[0]?.order).toBe(1);
			// create expertises
			await utils.createExpertise(profile.id, "Expertise 1", "Expert", 1);
			const upProfileExpertise = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { expertises: true },
			});
			expect(upProfileExpertise?.expertises).toBeDefined();
			expect(upProfileExpertise?.expertises?.length).toBe(1);
			expect(upProfileExpertise?.expertises?.[0]?.title).toBe("Expertise 1");
			expect(upProfileExpertise?.expertises?.[0]?.level).toBe("Expert");
			expect(upProfileExpertise?.expertises?.[0]?.order).toBe(1);
			// create formations
			await utils.createFormation(
				profile.id,
				"Formation 1",
				"Organisme 1",
				start,
				end,
				1,
			);
			const upProfileFormation = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { formations: true },
			});
			expect(upProfileFormation?.formations).toBeDefined();
			expect(upProfileFormation?.formations?.length).toBe(1);
			expect(upProfileFormation?.formations?.[0]?.title).toBe("Formation 1");
			expect(upProfileFormation?.formations?.[0]?.organismeFormation).toBe(
				"Organisme 1",
			);
			expect(upProfileFormation?.formations?.[0]?.start).toEqual(start);
			expect(upProfileFormation?.formations?.[0]?.end).toEqual(end);
			expect(upProfileFormation?.formations?.[0]?.order).toBe(1);
			// create languages
			await utils.createLanguage(profile.id, "Language 1", "Expert", 1);
			const upProfileLanguage = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { languages: true },
			});
			expect(upProfileLanguage?.languages).toBeDefined();
			expect(upProfileLanguage?.languages?.length).toBe(1);
			expect(upProfileLanguage?.languages?.[0]?.name).toBe("Language 1");
			expect(upProfileLanguage?.languages?.[0]?.level).toBe("Expert");
			expect(upProfileLanguage?.languages?.[0]?.order).toBe(1);
			// create passions
			await utils.createPassion(profile.id, "Passion 1", "🎵", 1);
			const upProfilePassion = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { passions: true },
			});
			expect(upProfilePassion?.passions).toBeDefined();
			expect(upProfilePassion?.passions?.length).toBe(1);
			expect(upProfilePassion?.passions?.[0]?.title).toBe("Passion 1");
			expect(upProfilePassion?.passions?.[0]?.icon).toBe("🎵");
			expect(upProfilePassion?.passions?.[0]?.order).toBe(1);
			// create philosophies
			await utils.createPhilosophy(profile.id, "Philosophy 1", "Author 1");
			const upProfilePhilosophy = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { philosophy: true },
			});
			expect(upProfilePhilosophy?.philosophy).toBeDefined();
			expect(upProfilePhilosophy?.philosophy?.citation).toBe("Philosophy 1");
			expect(upProfilePhilosophy?.philosophy?.author).toBe("Author 1");
			// create prizes
			await utils.createPrize(profile.id, "Prize 1", "Domaine 1", 1, "💰");
			const upProfilePrize = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { prizes: true },
			});
			expect(upProfilePrize?.prizes).toBeDefined();
			expect(upProfilePrize?.prizes?.length).toBe(1);
			expect(upProfilePrize?.prizes?.[0]?.title).toBe("Prize 1");
			expect(upProfilePrize?.prizes?.[0]?.domaine).toBe("Domaine 1");
			expect(upProfilePrize?.prizes?.[0]?.icon).toBe("💰");
			expect(upProfilePrize?.prizes?.[0]?.order).toBe(1);
			// create projects
			await utils.createProject(
				profile.id,
				"Project 1",
				start,
				["Mission 1"],
				1,
				"Description 1",
				"Location 1",
				end,
			);
			const upProfileProject = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { projects: { include: { missions: true } } },
			});
			expect(upProfileProject?.projects).toBeDefined();
			expect(upProfileProject?.projects?.length).toBe(1);
			expect(upProfileProject?.projects?.[0]?.title).toBe("Project 1");
			expect(upProfileProject?.projects?.[0]?.description).toBe(
				"Description 1",
			);
			expect(upProfileProject?.projects?.[0]?.location).toBe("Location 1");
			expect(upProfileProject?.projects?.[0]?.start).toEqual(start);
			expect(upProfileProject?.projects?.[0]?.end).toEqual(end);
			expect(upProfileProject?.projects?.[0]?.missions).toBeDefined();
			expect(upProfileProject?.projects?.[0]?.missions?.length).toBe(1);
			expect(upProfileProject?.projects?.[0]?.missions?.[0]?.content).toBe(
				"Mission 1",
			);
			expect(upProfileProject?.projects?.[0]?.order).toBe(1);
			// create publications
			await utils.createPublication(
				profile.id,
				"Publication 1",
				start,
				1,
				"Description 1",
				"Journal 1",
				end,
				"https://example.com",
			);
			const upProfilePublication = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { publications: true },
			});
			expect(upProfilePublication?.publications).toBeDefined();
			expect(upProfilePublication?.publications?.length).toBe(1);
			expect(upProfilePublication?.publications?.[0]?.title).toBe(
				"Publication 1",
			);
			expect(upProfilePublication?.publications?.[0]?.description).toBe(
				"Description 1",
			);
			expect(upProfilePublication?.publications?.[0]?.journalName).toBe(
				"Journal 1",
			);
			expect(upProfilePublication?.publications?.[0]?.start).toEqual(start);
			expect(upProfilePublication?.publications?.[0]?.end).toEqual(end);
			expect(upProfilePublication?.publications?.[0]?.url).toBe(
				"https://example.com",
			);
			expect(upProfilePublication?.publications?.[0]?.order).toBe(1);
			// create skills
			const skill = await utils.createSkill("Skill 1");
			const groupSkill = await utils.createProfileSkillGroup(
				profile.id,
				"Skill Group 1",
				1,
			);
			await utils.createProfileSkill(skill.id, groupSkill.id, "Expert");
			const upProfileSkill = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: {
					skills: { include: { skills: { include: { skill: true } } } },
				},
			});
			expect(upProfileSkill?.skills).toBeDefined();
			expect(upProfileSkill?.skills?.length).toBe(1);
			expect(upProfileSkill?.skills?.[0]?.title).toBe("Skill Group 1");
			expect(upProfileSkill?.skills?.[0]?.order).toBe(1);
			expect(upProfileSkill?.skills?.[0]?.skills?.[0]?.skill?.name).toBe(
				"Skill 1",
			);
			expect(upProfileSkill?.skills?.[0]?.skills?.[0]?.level).toBe("Expert");
			// create social media
			await utils.createSocialMedia(
				profile.id,
				"Social Media 1",
				"Username 1",
				"faGlobe",
				1,
			);
			const upProfileSocialMedia = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { socialMedias: true },
			});
			expect(upProfileSocialMedia?.socialMedias).toBeDefined();
			expect(upProfileSocialMedia?.socialMedias?.length).toBe(1);
			expect(upProfileSocialMedia?.socialMedias?.[0]?.socialNetwork).toBe(
				"Social Media 1",
			);
			expect(upProfileSocialMedia?.socialMedias?.[0]?.username).toBe(
				"Username 1",
			);
			expect(upProfileSocialMedia?.socialMedias?.[0]?.order).toBe(1);
			// create strengths
			await utils.createStrength(profile.id, "Strength 1", "💪", 1);
			const upProfileStrength = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { strengths: true },
			});
			expect(upProfileStrength?.strengths).toBeDefined();
			expect(upProfileStrength?.strengths?.length).toBe(1);
			expect(upProfileStrength?.strengths?.[0]?.title).toBe("Strength 1");
			expect(upProfileStrength?.strengths?.[0]?.icon).toBe("💪");
			expect(upProfileStrength?.strengths?.[0]?.order).toBe(1);
			// create volunteerings
			await utils.createVolunteering(
				profile.id,
				"Volunteering 1",
				"Organization 1",
				start,
				["Mission 1"],
				1,
				"Description 1",
				end,
				"Location 1",
			);
			const upProfileVolunteering = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { volunteerings: { include: { missions: true } } },
			});
			expect(upProfileVolunteering?.volunteerings).toBeDefined();
			expect(upProfileVolunteering?.volunteerings?.length).toBe(1);
			expect(upProfileVolunteering?.volunteerings?.[0]?.title).toBe(
				"Volunteering 1",
			);
			expect(upProfileVolunteering?.volunteerings?.[0]?.organisation).toBe(
				"Organization 1",
			);
			expect(upProfileVolunteering?.volunteerings?.[0]?.description).toBe(
				"Description 1",
			);
			expect(upProfileVolunteering?.volunteerings?.[0]?.start).toEqual(start);
			expect(upProfileVolunteering?.volunteerings?.[0]?.end).toEqual(end);
			expect(upProfileVolunteering?.volunteerings?.[0]?.location).toBe(
				"Location 1",
			);
			expect(upProfileVolunteering?.volunteerings?.[0]?.missions).toBeDefined();
			expect(upProfileVolunteering?.volunteerings?.[0]?.missions?.length).toBe(
				1,
			);
			expect(
				upProfileVolunteering?.volunteerings?.[0]?.missions?.[0]?.content,
			).toBe("Mission 1");
			expect(upProfileVolunteering?.volunteerings?.[0]?.order).toBe(1);
		});

		it("should delete profile and cascade all children", async () => {
			const user = await utils.createTestUserWithProfile();
			const profile = user.profile!;
			await utils.createAchievement(
				profile.id,
				"Achievement 1",
				1,
				"Technology 1",
				"Description 1",
				2020,
			);
			await utils.createCertification(
				profile.id,
				"Certification 1",
				1,
				"Organisme 1",
			);
			const competence = await utils.createCompetence("Competence 1");
			const groupCompetence = await utils.createProfileCompetenceGroup(
				profile.id,
				"Competence Group 1",
				1,
			);
			await utils.createProfileCompetence(competence.id, groupCompetence.id);
			const tag = await utils.createTag("Tag 1");
			const groupTag = await utils.createProfileTagGroup(
				profile.id,
				"Tag Group 1",
				1,
			);
			await utils.createProfileTag(tag.id, groupTag.id);
			await utils.createDescription(profile.id, "Description 1");
			const start = new Date();
			const end = new Date();
			await utils.createEducation(
				profile.id,
				"Education 1",
				"School 1",
				"Degree 1",
				start,
				end,
				1,
				CvTimelineStatus.COMPLETED,
			);
			await utils.createExperience(
				profile.id,
				"Experience 1",
				"Description 1",
				"Company 1",
				start,
				end,
				"Location 1",
				["Mission 1"],
				1,
			);
			await utils.createExpertise(profile.id, "Expertise 1", "Expert", 1);
			await utils.createFormation(
				profile.id,
				"Formation 1",
				"Organisme 1",
				start,
				end,
				1,
			);
			await utils.createLanguage(profile.id, "Language 1", "Expert", 1);
			await utils.createPassion(profile.id, "Passion 1", "🎵", 1);
			await utils.createPhilosophy(profile.id, "Philosophy 1", "Author 1");
			await utils.createPrize(profile.id, "Prize 1", "Domaine 1", 1, "💰");
			await utils.createProject(
				profile.id,
				"Project 1",
				start,
				["Mission 1"],
				1,
				"Description 1",
				"Location 1",
				end,
			);
			await utils.createPublication(
				profile.id,
				"Publication 1",
				start,
				1,
				"Description 1",
				"Journal 1",
				end,
				"https://example.com",
			);
			const skill = await utils.createSkill("Skill 1");
			const groupSkill = await utils.createProfileSkillGroup(
				profile.id,
				"Skill Group 1",
				1,
			);
			await utils.createProfileSkill(skill.id, groupSkill.id, "Expert");
			await utils.createSocialMedia(
				profile.id,
				"Social Media 1",
				"Username 1",
				"faGlobe",
				1,
			);
			await utils.createStrength(profile.id, "Strength 1", "💪", 1);
			await utils.createVolunteering(
				profile.id,
				"Volunteering 1",
				"Organization 1",
				start,
				["Mission 1"],
				1,
				"Description 1",
				end,
				"Location 1",
			);
			await prismaTest.profile.delete({ where: { id: profile.id } });
			const upProfileAchievement = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { achievements: true },
			});
			expect(upProfileAchievement?.achievements).toBeUndefined();
			const upProfileCertification = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				// delete profile
				include: { certifications: true },
			});
			expect(upProfileCertification?.certifications).toBeUndefined();
			const upProfileCompetence = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { competences: true },
			});
			expect(upProfileCompetence?.competences).toBeUndefined();
			const upProfileTag = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { tags: true },
			});
			expect(upProfileTag?.tags).toBeUndefined();
			const upProfileDescription = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { description: true },
			});
			expect(upProfileDescription?.description).toBeUndefined();
			const upProfileEducation = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { educations: true },
			});
			expect(upProfileEducation?.educations).toBeUndefined();
			const upProfileExperience = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { experiences: true },
			});
			expect(upProfileExperience?.experiences).toBeUndefined();
			const upProfileExpertise = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { expertises: true },
			});
			expect(upProfileExpertise?.expertises).toBeUndefined();
			const upProfileFormation = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { formations: true },
			});
			expect(upProfileFormation?.formations).toBeUndefined();
			const upProfileLanguage = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { languages: true },
			});
			expect(upProfileLanguage?.languages).toBeUndefined();
			const upProfilePassion = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { passions: true },
			});
			expect(upProfilePassion?.passions).toBeUndefined();
			const upProfilePhilosophy = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { philosophy: true },
			});
			expect(upProfilePhilosophy?.philosophy).toBeUndefined();
			const upProfilePrize = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { prizes: true },
			});
			expect(upProfilePrize?.prizes).toBeUndefined();
			const upProfileProject = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { projects: true },
			});
			expect(upProfileProject?.projects).toBeUndefined();
			const upProfilePublication = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { publications: true },
			});
			expect(upProfilePublication?.publications).toBeUndefined();
			const upProfileSkill = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { skills: true },
			});
			expect(upProfileSkill?.skills).toBeUndefined();
			const upProfileSocialMedia = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { socialMedias: true },
			});
			expect(upProfileSocialMedia?.socialMedias).toBeUndefined();
			const upProfileStrength = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { strengths: true },
			});
			expect(upProfileStrength?.strengths).toBeUndefined();
			const upProfileVolunteering = await prismaTest.profile.findUnique({
				where: { id: profile.id },
				include: { volunteerings: true },
			});
			expect(upProfileVolunteering?.volunteerings).toBeUndefined();
		});
	});
});
