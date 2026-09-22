import type {
	Description,
	Profile,
	ProfileSkillGroup,
	ProfileSkill,
	Skill,
	ProfileCompetenceGroup,
	ProfileCompetence,
	Competence,
	Experience,
	MissionExperience,
	Education,
	Achievement,
	Strength,
	Volunteering,
	MissionVolunteering,
	Project,
	MissionProject,
	Publication,
	Language,
	Passion,
	SocialMedia,
	Philosophy,
	Expertise,
	Prize,
	Certification,
	Formation,
	User,
	ProfileTag,
	ProfileTagGroup,
	Tag,
} from "../../generated/prisma/client";
import type { CvTimelineStatus, Level } from "../../generated/prisma/enums";
import { prismaTest } from "../../lib/prismaTest";

export type SkillGroupInput = {
	title: string;
	order: number;
	skills: { name: string; level: Level; order: number }[];
};

export type CompetenceGroupInput = {
	title: string;
	order: number;
	competences: { name: string; order: number }[];
};

export type TagGroupInput = {
	title: string;
	order: number;
	tags: { name: string; order: number }[];
};

type TestUserOptions = {
	description?: string;
	skillGroups?: SkillGroupInput[];
	competenceGroups?: CompetenceGroupInput[];
	tagGroups?: TagGroupInput[];
	experiences?: {
		title: string;
		description: string;
		company: string;
		start: Date;
		end: Date;
		location: string;
		missions: string[];
		order: number;
	}[];
	educations?: {
		title: string;
		school: string;
		degree: string;
		start: Date;
		end?: Date;
		order: number;
		obtained?: CvTimelineStatus | null;
	}[];
	achievements?: {
		title: string;
		description: string;
		year: number;
		technology: string;
		order: number;
	}[];
	strengths?: {
		title: string;
		icon?: string;
		order: number;
	}[];
	volunteerings?: {
		title: string;
		organisation: string;
		description?: string;
		start: Date;
		end?: Date;
		location?: string;
		missions: string[];
		order: number;
	}[];
	projects?: {
		title: String;
		description?: String;
		location?: String;
		start: Date;
		end?: Date;
		technology?: String;
		missions: string[];
		order: number;
	}[];
	publications?: {
		title: String;
		description?: String;
		journalName?: String;
		start: Date;
		end?: Date;
		url?: String;
		order: number;
	}[];
	languages?: {
		name: string;
		level: Level;
		order: number;
	}[];
	passions?: {
		title: string;
		icon?: string;
		order: number;
	}[];
	socialMedias?: {
		socialNetwork?: string;
		username: string;
		icon: string;
		order: number;
	}[];
	philosophy?: {
		citation: string;
		author?: string;
	};
	expertises?: {
		title: string;
		level: Level;
		order: number;
	}[];
	prizes?: {
		title: string;
		domaine: string;
		icon?: string;
		order: number;
	}[];
	certifications?: {
		title: string;
		organismeCertification?: string;
		order: number;
	}[];
	formations?: {
		title: string;
		organismeFormation?: string;
		start: Date;
		end?: Date;
		order: number;
		status?: CvTimelineStatus | null;
	}[];
};

export async function createTestUserWithProfile(options?: TestUserOptions) {
	const user = await prismaTest.user.create({
		data: {
			name: "Bob",
			email: `bob-${Date.now()}@test.com`,
			password: "123",

			profile: {
				// @ts-expect-error
				create: {
					firstName: "Bob",
					lastName: "Martin",
					phone: "1234567890",
					location: "Paris",

					// DESCRIPTION
					...(options?.description && {
						description: {
							create: { description: options.description },
						},
					}),

					// SKILL GROUPS
					...(options?.skillGroups && {
						skills: {
							create: options.skillGroups.map((group) => ({
								title: group.title,
								order: group.order,
								skills: {
									create: group.skills.map((s) => ({
										level: s.level,
										order: s.order,
										skill: {
											connectOrCreate: {
												where: { name: s.name.toLowerCase() },
												create: { name: s.name.toLowerCase() },
											},
										},
									})),
								},
							})),
						},
					}),

					// COMPETENCE GROUPS
					...(options?.competenceGroups && {
						competences: {
							create: options.competenceGroups.map((group) => ({
								title: group.title,
								order: group.order,
								competences: {
									create: group.competences.map((c) => ({
										order: c.order,
										competence: {
											connectOrCreate: {
												where: { name: c.name },
												create: { name: c.name },
											},
										},
									})),
								},
							})),
						},
					}),

					// TAG GROUPS
					...(options?.tagGroups && {
						tags: {
							create: options.tagGroups.map((group) => ({
								title: group.title,
								order: group.order,
								tags: {
									create: group.tags.map((t) => ({
										order: t.order,
										tag: {
											connectOrCreate: {
												where: { name: t.name },
												create: { name: t.name },
											},
										},
									})),
								},
							})),
						},
					}),

					// EXPERIENCES
					...(options?.experiences && {
						experiences: {
							create: options.experiences.map((e) => ({
								title: e.title,
								description: e.description,
								company: e.company,
								start: e.start,
								end: e.end,
								location: e.location,
								order: e.order,
								...(e.missions && {
									missions: {
										create: e.missions.map((m, index) => ({
											content: m,
											order: index + 1,
										})),
									},
								}),
							})),
						},
					}),

					// EDUCATIONS
					...(options?.educations && {
						educations: {
							create: options.educations.map((e) => ({
								title: e.title,
								school: e.school,
								degree: e.degree,
								start: e.start,
								end: e.end,
								order: e.order,
								obtained: e.obtained ?? null,
							})),
						},
					}),

					// ACHIEVEMENTS
					...(options?.achievements && {
						achievements: {
							create: options.achievements.map((a) => ({
								title: a.title,
								description: a.description,
								year: a.year,
								technology: a.technology,
								order: a.order,
							})),
						},
					}),

					// STRENGTHS
					...(options?.strengths && {
						strengths: {
							create: options.strengths.map((s) => ({
								title: s.title,
								icon: s.icon,
								order: s.order,
							})),
						},
					}),

					// Volunteering
					...(options?.volunteerings && {
						volunteerings: {
							create: options.volunteerings.map((v) => ({
								title: v.title,
								organisation: v.organisation,
								description: v.description,
								start: v.start,
								end: v.end,
								location: v.location,
								...(v.missions && {
									missions: {
										create: v.missions.map((m, index) => ({
											content: m,
											order: index + 1,
										})),
									},
								}),
								order: v.order,
							})),
						},
					}),

					// PROJECTS
					...(options?.projects && {
						projects: {
							create: options.projects.map((p) => ({
								title: p.title,
								description: p.description,
								location: p.location,
								start: p.start,
								end: p.end,
								technology: p.technology,
								...(p.missions && {
									missions: {
										create: p.missions.map((m, index) => ({
											content: m,
											order: index + 1,
										})),
									},
								}),
								order: p.order,
							})),
						},
					}),

					//PUBLICATIONS
					...(options?.publications && {
						publications: {
							create: options.publications.map((p) => ({
								title: p.title,
								description: p.description,
								journalName: p.journalName,
								start: p.start,
								end: p.end,
								url: p.url,
								order: p.order,
							})),
						},
					}),

					// LANGUAGES
					...(options?.languages && {
						languages: {
							create: options.languages.map((l) => ({
								name: l.name,
								level: l.level,
								order: l.order,
							})),
						},
					}),

					// PASSIONS
					...(options?.passions && {
						passions: {
							create: options.passions.map((o) => ({
								title: o.title,
								icon: o.icon,
								order: o.order,
							})),
						},
					}),

					// SOCIAL MEDIA
					...(options?.socialMedias && {
						socialMedias: {
							create: options.socialMedias.map((s) => ({
								socialNetwork: s.socialNetwork,
								username: s.username,
								icon: s.icon,
								order: s.order,
							})),
						},
					}),

					// PHILOSOPHY
					...(options?.philosophy && {
						philosophy: {
							create: {
								citation: options.philosophy.citation,
								author: options.philosophy.author,
							},
						},
					}),

					// EXPERTISES
					...(options?.expertises && {
						expertises: {
							create: options.expertises.map((e) => ({
								title: e.title,
								level: e.level,
								order: e.order,
							})),
						},
					}),

					// PRIzES
					...(options?.prizes && {
						prizes: {
							create: options.prizes.map((p) => ({
								title: p.title,
								domaine: p.domaine,
								icon: p.icon,
								order: p.order,
							})),
						},
					}),

					// CERTIFICATIONS
					...(options?.certifications && {
						certifications: {
							create: options.certifications.map((c) => ({
								title: c.title,
								organismeCertification: c.organismeCertification,
								order: c.order,
							})),
						},
					}),

					// FORMATIONS
					...(options?.formations && {
						formations: {
							create: options.formations.map((f) => ({
								title: f.title,
								organismeFormation: f.organismeFormation,
								start: f.start,
								end: f.end,
								order: f.order,
							})),
						},
					}),
				},
			},
		},

		include: {
			profile: {
				include: {
					description: true,
					skills: {
						include: {
							skills: {
								include: { skill: true },
							},
						},
					},
					competences: {
						include: {
							competences: {
								include: { competence: true },
							},
						},
					},
					tags: {
						include: {
							tags: {
								include: { tag: true },
							},
						},
					},
					experiences: {
						include: {
							missions: true,
						},
					},
					educations: true,
					achievements: true,
					strengths: true,
					volunteerings: {
						include: {
							missions: true,
						},
					},
					projects: {
						include: {
							missions: true,
						},
					},
					publications: true,
					languages: true,
					passions: true,
					socialMedias: true,
					philosophy: true,
					expertises: true,
					prizes: true,
					certifications: true,
					formations: true,
				},
			},
		},
	});

	return user as User & {
		profile: Profile & {
			description: Description | null;
			skills: (ProfileSkillGroup & {
				skills: (ProfileSkill & { skill: Skill })[];
			})[];
			competences: (ProfileCompetenceGroup & {
				competences: (ProfileCompetence & { competence: Competence })[];
			})[];
			tags: (ProfileTagGroup & {
				tags: (ProfileTag & { tag: Tag })[];
			})[];
			experiences: (Experience & {
				missions: MissionExperience[];
			})[];
			educations: Education[];
			achievements: Achievement[];
			strengths: Strength[];
			volunteerings: (Volunteering & {
				missions: MissionVolunteering[];
			})[];
			projects: (Project & {
				missions: MissionProject[];
			})[];
			publications: Publication[];
			languages: Language[];
			passions: Passion[];
			socialMedias: SocialMedia[];
			philosophy: Philosophy;
			expertises: Expertise[];
			prizes: Prize[];
			certifications: Certification[];
			formations: Formation[];
		};
	};
}

// === ACHIEVEMENT ===
export async function createAchievement(
	profileId: string,
	title: string,
	order: number,
	technology?: string | null,
	description?: string | null,
	year?: number | null,
) {
	return prismaTest.achievement.create({
		data: {
			profileId,
			title,
			technology: technology ?? null,
			description: description ?? null,
			year: year ?? null,
			order,
		},
	});
}

// === CERTIFICATION ===
export async function createCertification(
	profileId: string,
	title: string,
	order: number,
	organismeCertification?: string | null,
) {
	return prismaTest.certification.create({
		data: {
			profileId,
			title,
			organismeCertification: organismeCertification ?? null,
			order,
		},
	});
}

// === COMPETENCES ===
export async function createCompetence(name: string) {
	return prismaTest.competence.create({ data: { name } });
}

export async function createProfileCompetenceGroup(
	profileId: string,
	title: string,
	order: number,
) {
	return prismaTest.profileCompetenceGroup.create({
		data: { profileId, title, order },
	});
}

export async function createProfileCompetence(competenceId: string, groupId: string) {
	return prismaTest.profileCompetence.create({
		data: { competenceId, groupId },
	});
}

// === TAG ===
export async function createTag(name: string) {
	return prismaTest.tag.create({ data: { name } });
}

export async function createProfileTagGroup(profileId: string, title: string, order: number) {
	return prismaTest.profileTagGroup.create({
		data: { profileId, title, order },
	});
}

export async function createProfileTag(tagId: string, groupId: string) {
	return prismaTest.profileTag.create({
		data: { tagId, groupId },
	});
}

// === DESCRIPTION ===
export async function createDescription(profileId: string, description: string) {
	return prismaTest.description.create({ data: { profileId, description } });
}

// === EDUCATION ===
export async function createEducation(
	profileId: string,
	title: string,
	school: string,
	degree: string,
	start: Date,
	end: Date,
	order: number,
	obtained: CvTimelineStatus | null,
) {
	return prismaTest.education.create({
		data: { profileId, title, school, degree, start, end, order, obtained },
	});
}

// === EXPERIENCE ===
export async function createExperience(
	profileId: string,
	title: string,
	description: string,
	company: string,
	start: Date,
	end: Date,
	location: string,
	missions: string[],
	order: number,
) {
	return prismaTest.experience.create({
		data: {
			profileId,
			title,
			description,
			company,
			start,
			end,
			location,
			missions: { create: missions.map((m) => ({ content: m })) },
			order,
		},
	});
}

// === EXPERTISE ===
export async function createExpertise(
	profileId: string,
	title: string,
	level: Level,
	order: number,
) {
	return prismaTest.expertise.create({
		data: { profileId, title, level, order },
	});
}

// === FORMATION ===
export async function createFormation(
	profileId: string,
	title: string,
	organismeFormation: string,
	start: Date,
	end: Date,
	order: number,
) {
	return prismaTest.formation.create({
		data: { profileId, title, organismeFormation, start, end, order },
	});
}

// === LANGUAGE ===
export async function createLanguage(profileId: string, name: string, level: Level, order: number) {
	return prismaTest.language.create({
		data: { profileId, name, level, order },
	});
}

// === PASSION ===
export async function createPassion(profileId: string, title: string, icon: string, order: number) {
	return prismaTest.passion.create({ data: { profileId, title, icon, order } });
}

// === PHILOSOPHY ===
export async function createPhilosophy(
	profileId: string,
	citation: string,
	author?: string | null,
) {
	return prismaTest.philosophy.create({
		data: { profileId, citation, author: author ?? null },
	});
}

// === PRIzE ===
export async function createPrize(
	profileId: string,
	title: string,
	domaine: string,
	order: number,
	icon?: string | null,
) {
	return prismaTest.prize.create({
		data: { profileId, title, domaine, icon: icon ?? null, order },
	});
}

// === PROJECT ===
export async function createProject(
	profileId: string,
	title: string,
	start: Date,
	missions: string[],
	order: number,
	description?: string | null,
	location?: string | null,
	end?: Date,
	technology?: string | null,
) {
	return prismaTest.project.create({
		data: {
			profileId,
			title,
			start,
			description: description ?? null,
			location: location ?? null,
			end: end ?? null,
			technology: technology ?? null,
			missions: {
				create: missions.map((m, index) => ({
					content: m,
					order: index + 1,
				})),
			},
			order,
		},
	});
}

// === PUBLICATION ===
export async function createPublication(
	profileId: string,
	title: string,
	start: Date,
	order: number,
	description?: string | null,
	journalName?: string | null,
	end?: Date,
	url?: string | null,
) {
	return prismaTest.publication.create({
		data: {
			profileId,
			title,
			description: description ?? null,
			journalName: journalName ?? null,
			start,
			end: end ?? null,
			url: url ?? null,
			order,
		},
	});
}

// === SKILL ===
export async function createSkill(name: string) {
	return prismaTest.skill.create({ data: { name } });
}

export async function createProfileSkillGroup(profileId: string, title: string, order: number) {
	return prismaTest.profileSkillGroup.create({
		data: { profileId, title, order },
	});
}

export async function createProfileSkill(skillId: string, groupId: string, level: Level) {
	return prismaTest.profileSkill.create({ data: { skillId, groupId, level } });
}

// === SOCIAL MEDIA ===
export async function createSocialMedia(
	profileId: string,
	socialNetwork: string,
	username: string,
	icon: string,
	order: number,
) {
	return prismaTest.socialMedia.create({
		data: { profileId, socialNetwork, username, icon, order },
	});
}

// === STRENGTH ===
export async function createStrength(
	profileId: string,
	title: string,
	icon: string,
	order: number,
) {
	return prismaTest.strength.create({
		data: { profileId, title, icon, order },
	});
}

// === VOLUNTEERING ===
export async function createVolunteering(
	profileId: string,
	title: string,
	organisation: string,
	start: Date,
	missions: string[],
	order: number,
	description?: string | null,
	end?: Date,
	location?: string | null,
) {
	return prismaTest.volunteering.create({
		data: {
			profileId,
			title,
			organisation,
			description: description ?? null,
			start,
			end: end ?? null,
			location: location ?? null,
			missions: { create: missions.map((m) => ({ content: m })) },
			order,
		},
	});
}
