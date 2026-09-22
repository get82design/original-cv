import { describe, expect, it } from "vitest";
import { CvTimelineStatus, Level } from "../../../generated/prisma/client";
import {
	mapProfileToSaveInput,
	type ProfileMapperInput,
} from "../../../src/features/profile/mapProfileToSaveInput";
import { profileSaveSchema } from "../../../src/services/schemas/profileSave.schema";

const start = new Date("2020-01-01T00:00:00.000Z");
const end = new Date("2022-01-01T00:00:00.000Z");

function emptyLists() {
	return {
		experiences: [],
		achievements: [],
		strengths: [],
		projects: [],
		publications: [],
		volunteerings: [],
		skills: [],
		tags: [],
		competences: [],
		educations: [],
		languages: [],
		socialMedias: [],
		expertises: [],
		certifications: [],
		formations: [],
		passions: [],
		prizes: [],
	};
}

function baseProfile(overrides: Record<string, unknown> = {}): ProfileMapperInput {
	return {
		id: "profile-1",
		userId: "user-1",
		firstName: "John",
		lastName: "Doe",
		phone: null,
		location: null,
		email: null,
		photo: null,
		description: null,
		philosophy: null,
		...emptyLists(),
		...overrides,
	} as unknown as ProfileMapperInput;
}

describe("mapProfileToSaveInput", () => {
	it("maps a minimal profile", () => {
		const input = mapProfileToSaveInput(baseProfile());

		expect(input).toMatchObject({
			id: "profile-1",
			firstName: "John",
			lastName: "Doe",
		});
		expect(input.phone).toBeNull();
		expect(input.location).toBeNull();
		expect(input.email).toBeNull();
		expect(input.photo).toBeNull();
		expect(input.description).toBeUndefined();
		expect(input.philosophy).toBeUndefined();
		expect(input.experiences).toEqual([]);
		expect(input.achievements).toEqual([]);
		expect(input.skillGroups).toEqual([]);
		expect(input.tagGroups).toEqual([]);
		expect(input.competenceGroups).toEqual([]);
		expect(profileSaveSchema.safeParse(input).success).toBe(true);
	});

	it("maps identity fields when set", () => {
		const input = mapProfileToSaveInput(
			baseProfile({
				phone: "0600000000",
				location: "Paris",
				email: "john@test.com",
				photo: "https://cdn/photo.jpg",
			}),
		);

		expect(input.phone).toBe("0600000000");
		expect(input.location).toBe("Paris");
		expect(input.email).toBe("john@test.com");
		expect(input.photo).toBe("https://cdn/photo.jpg");
		expect(profileSaveSchema.safeParse(input).success).toBe(true);
	});

	it("maps description and philosophy", () => {
		const input = mapProfileToSaveInput(
			baseProfile({
				description: {
					id: "d1",
					profileId: "profile-1",
					description: "Bio",
				},
				philosophy: {
					id: "p1",
					profileId: "profile-1",
					citation: "Cite",
					author: "Auteur",
				},
			}),
		);

		expect(input.description).toEqual({
			id: "d1",
			description: "Bio",
		});
		expect(input.philosophy).toEqual({
			id: "p1",
			citation: "Cite",
			author: "Auteur",
		});
		expect(profileSaveSchema.safeParse(input).success).toBe(true);
	});

	it("maps experiences, projects and volunteerings with missions", () => {
		const input = mapProfileToSaveInput(
			baseProfile({
				experiences: [
					{
						id: "e1",
						profileId: "profile-1",
						title: "Dev",
						company: "Acme",
						start,
						end,
						location: "Paris",
						description: "Desc",
						order: 1,
						missions: [
							{
								id: "em1",
								experienceId: "e1",
								content: "Livré",
								order: 1,
							},
							{
								id: "em2",
								experienceId: "e1",
								content: "Testé",
								order: 2,
							},
						],
					},
					{
						id: "e2",
						profileId: "profile-1",
						title: "Lead",
						company: "Beta",
						start,
						end: null,
						location: null,
						description: null,
						order: 2,
					},
				],
				projects: [
					{
						id: "pr1",
						profileId: "profile-1",
						title: "App",
						start,
						end,
						location: "Remote",
						technology: "TS",
						description: "D",
						order: 1,
						missions: [
							{
								id: "pm1",
								projectId: "pr1",
								content: "Ship",
								order: 1,
							},
						],
					},
				],
				volunteerings: [
					{
						id: "v1",
						profileId: "profile-1",
						title: "Aide",
						organisation: "Org",
						start,
						end: null,
						location: "Lyon",
						description: "Help",
						order: 1,
						missions: [
							{
								id: "vm1",
								volunteeringId: "v1",
								content: "Accueil",
								order: 1,
							},
						],
					},
				],
			}),
		);

		expect(input.experiences).toEqual([
			{
				id: "e1",
				clientKey: "e1",
				order: 1,
				content: {
					title: "Dev",
					company: "Acme",
					start,
					end,
					location: "Paris",
					description: "Desc",
					missions: [
						{
							id: "em1",
							clientKey: "em1",
							order: 1,
							content: { content: "Livré" },
						},
						{
							id: "em2",
							clientKey: "em2",
							order: 2,
							content: { content: "Testé" },
						},
					],
				},
			},
			{
				id: "e2",
				clientKey: "e2",
				order: 2,
				content: {
					title: "Lead",
					company: "Beta",
					start,
					end: null,
					location: null,
					description: null,
					missions: [],
				},
			},
		]);
		expect(input.projects[0]).toEqual({
			id: "pr1",
			clientKey: "pr1",
			order: 1,
			content: {
				title: "App",
				start,
				end,
				location: "Remote",
				technology: "TS",
				description: "D",
				missions: [
					{
						id: "pm1",
						clientKey: "pm1",
						order: 1,
						content: { content: "Ship" },
					},
				],
			},
		});
		expect(input.volunteerings[0]).toEqual({
			id: "v1",
			clientKey: "v1",
			order: 1,
			content: {
				title: "Aide",
				start,
				end: null,
				location: "Lyon",
				description: "Help",
				missions: [
					{
						id: "vm1",
						clientKey: "vm1",
						order: 1,
						content: { content: "Accueil" },
					},
				],
				organisation: "Org",
			},
		});
		expect(profileSaveSchema.safeParse(input).success).toBe(true);
	});

	it("maps remaining list sections and applies fallbacks", () => {
		const input = mapProfileToSaveInput(
			baseProfile({
				achievements: [
					{
						id: "a1",
						profileId: "profile-1",
						title: "Ship",
						description: "Done",
						technology: "Go",
						year: 2024,
						order: 1,
					},
				],
				strengths: [
					{
						id: "st1",
						profileId: "profile-1",
						title: "Focus",
						icon: null,
						description: "Detail",
						order: 1,
					},
				],
				publications: [
					{
						id: "pub1",
						profileId: "profile-1",
						title: "Paper",
						start,
						end: null,
						description: null,
						url: "https://x",
						journalName: "Nature",
						order: 1,
					},
				],
				educations: [
					{
						id: "ed1",
						profileId: "profile-1",
						title: null,
						school: "Uni",
						degree: "Master",
						city: "Paris",
						start,
						end: null,
						obtained: null,
						order: 1,
					},
				],
				languages: [
					{
						id: "l1",
						profileId: "profile-1",
						name: "FR",
						level: Level.Expert,
						order: 1,
					},
				],
				socialMedias: [
					{
						id: "sm1",
						profileId: "profile-1",
						icon: "🌐",
						socialNetwork: "LinkedIn",
						username: "john",
						order: 1,
					},
				],
				expertises: [
					{
						id: "x1",
						profileId: "profile-1",
						title: "TS",
						level: Level.Senior,
						order: 1,
					},
				],
				certifications: [
					{
						id: "c1",
						profileId: "profile-1",
						title: "AWS",
						organismeCertification: null,
						order: 1,
					},
				],
				formations: [
					{
						id: "f1",
						profileId: "profile-1",
						title: "React",
						start,
						end,
						organismeFormation: null,
						status: null,
						order: 1,
					},
				],
				passions: [
					{
						id: "pa1",
						profileId: "profile-1",
						title: "Ski",
						icon: "ski",
						order: 1,
					},
				],
				prizes: [
					{
						id: "z1",
						profileId: "profile-1",
						title: "Oscar",
						icon: "trophy",
						domaine: null,
						order: 1,
					},
				],
			}),
		);

		expect(input.achievements[0]).toEqual({
			id: "a1",
			clientKey: "a1",
			order: 1,
			content: {
				title: "Ship",
				description: "Done",
				technology: "Go",
				year: 2024,
			},
		});
		expect(input.strengths[0]?.content).toEqual({
			title: "Focus",
			icon: "",
			description: "Detail",
		});
		expect(input.publications[0]?.content).toEqual({
			title: "Paper",
			start,
			end: null,
			description: null,
			url: "https://x",
			journalName: "Nature",
		});
		expect(input.educations[0]?.content).toEqual({
			title: "",
			start,
			end: null,
			obtained: "COMPLETED",
			degree: "Master",
			city: "Paris",
			school: "Uni",
		});
		expect(input.languages[0]?.content).toEqual({
			name: "FR",
			level: Level.Expert,
		});
		expect(input.socialMedias[0]?.content).toEqual({
			icon: "🌐",
			socialNetwork: "LinkedIn",
			username: "john",
		});
		expect(input.expertises[0]?.content).toEqual({
			title: "TS",
			level: Level.Senior,
		});
		expect(input.certifications[0]?.content).toEqual({
			title: "AWS",
			organismeCertification: "",
		});
		expect(input.formations[0]?.content).toEqual({
			title: "React",
			start,
			end,
			organismeFormation: "",
			status: "COMPLETED",
		});
		expect(input.passions[0]?.content).toEqual({
			title: "Ski",
			icon: "ski",
		});
		expect(input.prizes[0]?.content).toEqual({
			title: "Oscar",
			icon: "trophy",
			domaine: "",
		});
		expect(profileSaveSchema.safeParse(input).success).toBe(true);
	});

	it("falls back empty strings for null optional fields", () => {
		const input = mapProfileToSaveInput(
			baseProfile({
				socialMedias: [
					{
						id: "sm1",
						profileId: "profile-1",
						icon: "🌐",
						socialNetwork: null,
						username: null,
						order: 1,
					},
				],
				passions: [
					{
						id: "pa1",
						profileId: "profile-1",
						title: "Ski",
						icon: null,
						order: 1,
					},
				],
				prizes: [
					{
						id: "z1",
						profileId: "profile-1",
						title: "Oscar",
						icon: null,
						domaine: null,
						order: 1,
					},
				],
			}),
		);

		expect(input.socialMedias[0]?.content).toEqual({
			icon: "🌐",
			socialNetwork: "",
			username: "",
		});
		expect(input.passions[0]?.content.icon).toBe("");
		expect(input.prizes[0]?.content).toEqual({
			title: "Oscar",
			icon: "",
			domaine: "",
		});
	});

	it("maps skill, tag and competence groups with nested items", () => {
		const input = mapProfileToSaveInput(
			baseProfile({
				skills: [
					{
						id: "sg1",
						profileId: "profile-1",
						title: "Hard",
						order: 1,
						skills: [
							{
								id: "s1",
								groupId: "sg1",
								skillId: "skill-1",
								level: Level.Senior,
								order: 1,
								skill: { id: "skill-1", name: "React" },
							},
							{
								id: "s2",
								groupId: "sg1",
								skillId: "skill-2",
								level: Level.Junior,
								order: 2,
								skill: { id: "skill-2", name: "Vue" },
							},
						],
					},
					{
						id: "sg2",
						profileId: "profile-1",
						title: "Soft",
						order: 2,
					},
				],
				tags: [
					{
						id: "tg1",
						profileId: "profile-1",
						title: "Stack",
						order: 1,
						tags: [
							{
								id: "t1",
								groupId: "tg1",
								tagId: "tag-1",
								order: 1,
								tag: { id: "tag-1", name: "TS" },
							},
						],
					},
				],
				competences: [
					{
						id: "cg1",
						profileId: "profile-1",
						title: "Savoir-faire",
						order: 1,
						competences: [
							{
								id: "c1",
								groupId: "cg1",
								competenceId: "comp-1",
								order: 1,
								competence: { id: "comp-1", name: "Com" },
							},
						],
					},
				],
			}),
		);

		expect(input.skillGroups).toEqual([
			{
				id: "sg1",
				clientKey: "sg1",
				order: 1,
				content: {
					title: "Hard",
					skills: [
						{
							id: "s1",
							clientKey: "s1",
							order: 1,
							content: {
								name: "React",
								skillId: "skill-1",
								level: Level.Senior,
							},
						},
						{
							id: "s2",
							clientKey: "s2",
							order: 2,
							content: {
								name: "Vue",
								skillId: "skill-2",
								level: Level.Junior,
							},
						},
					],
				},
			},
			{
				id: "sg2",
				clientKey: "sg2",
				order: 2,
				content: {
					title: "Soft",
					skills: [],
				},
			},
		]);
		expect(input.tagGroups[0]?.content.tags[0]?.content).toEqual({
			name: "TS",
			tagId: "tag-1",
		});
		expect(input.competenceGroups[0]?.content.competences[0]?.content).toEqual({
			name: "Com",
			competenceId: "comp-1",
		});
		expect(profileSaveSchema.safeParse(input).success).toBe(true);
	});

	it("keeps source order and uses entity ids as clientKeys", () => {
		const input = mapProfileToSaveInput(
			baseProfile({
				experiences: [
					{
						id: "e2",
						profileId: "profile-1",
						title: "Second",
						company: "B",
						start,
						end,
						location: null,
						description: null,
						order: 2,
						missions: [],
					},
					{
						id: "e1",
						profileId: "profile-1",
						title: "First",
						company: "A",
						start,
						end: null,
						location: null,
						description: null,
						order: 1,
						missions: [],
					},
				],
				formations: [
					{
						id: "f1",
						profileId: "profile-1",
						title: "Form",
						start,
						end,
						organismeFormation: "OF",
						status: CvTimelineStatus.COMPLETED,
						order: 1,
					},
				],
			}),
		);

		expect(input.experiences.map((x) => x.id)).toEqual(["e2", "e1"]);
		expect(input.experiences.map((x) => x.clientKey)).toEqual(["e2", "e1"]);
		expect(input.formations[0]?.clientKey).toBe("f1");
		expect(profileSaveSchema.safeParse(input).success).toBe(true);
	});
});
