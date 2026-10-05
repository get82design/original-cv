import type { CvFull } from "@utils/trpc.types";
import { v4 as uuid } from "uuid";
import type { ProfileSaveInput } from "@/services/schemas/profileSave.schema";

type NonNullCv = NonNullable<CvFull>;

/**
 * Mappe un CV complet vers les valeurs du formulaire profil (remplacement intégral).
 * Les listes sont recréées avec de nouveaux clientKey (sans id) : le save remplacera le contenu.
 */
export function mapCvToProfileFormValues(cv: NonNullCv): Omit<ProfileSaveInput, never> {
	const header = cv.headerCv;

	return {
		firstName: header?.prenom ?? "",
		lastName: header?.nom ?? "",
		email: header?.email ?? null,
		phone: header?.phone ?? null,
		location: header?.location ?? null,
		photo: cv.photo ?? null,
		drivingLicenses: header?.drivingLicenses ?? [],
		hasVehicle: header?.hasVehicle ?? false,
		...(cv.description?.description?.trim()
			? {
					description: {
						description: cv.description.description,
					},
				}
			: { description: null }),
		...(cv.philosophy?.citation?.trim()
			? {
					philosophy: {
						citation: cv.philosophy.citation,
						author: cv.philosophy.author ?? null,
					},
				}
			: { philosophy: null }),
		experiences: (cv.experiences ?? []).map((exp) => ({
			clientKey: `experience-${uuid()}`,
			order: exp.order,
			content: {
				title: exp.title,
				start: exp.start,
				end: exp.end,
				location: exp.location,
				description: exp.description,
				company: exp.company,
				missions:
					exp.cvMissions?.map((m) => ({
						clientKey: `mission-${uuid()}`,
						order: m.order,
						content: { content: m.content },
					})) ?? [],
			},
		})),
		strengths: (cv.strengths ?? []).map((exp) => ({
			clientKey: `strength-${uuid()}`,
			order: exp.order,
			content: {
				title: exp.title,
				icon: exp.icon,
				description: exp.description,
			},
		})),
		stats: (cv.stats ?? []).map((stat) => ({
			clientKey: `stat-${uuid()}`,
			order: stat.order,
			content: {
				label: stat.label,
				value: stat.value,
			},
		})),
		projects: (cv.projects ?? []).map((exp) => ({
			clientKey: `project-${uuid()}`,
			order: exp.order,
			content: {
				title: exp.title,
				start: exp.start,
				end: exp.end,
				location: exp.location,
				technology: exp.technology,
				description: exp.description,
				result: exp.result,
				missions:
					exp.cvMissions?.map((m) => ({
						clientKey: `mission-${uuid()}`,
						order: m.order,
						content: { content: m.content },
					})) ?? [],
			},
		})),
		publications: (cv.publications ?? []).map((exp) => ({
			clientKey: `publication-${uuid()}`,
			order: exp.order,
			content: {
				title: exp.title,
				start: exp.start,
				end: exp.end,
				journalName: exp.journalName,
				description: exp.description,
				url: exp.url,
			},
		})),
		achievements: (cv.achievements ?? []).map((exp) => ({
			clientKey: `achievement-${uuid()}`,
			order: exp.order,
			content: {
				title: exp.title,
				description: exp.description,
				technology: exp.technology,
				year: exp.year,
			},
		})),
		volunteerings: (cv.volunteerings ?? []).map((exp) => ({
			clientKey: `volunteering-${uuid()}`,
			order: exp.order,
			content: {
				title: exp.title,
				start: exp.start,
				end: exp.end,
				location: exp.location,
				description: exp.description,
				organisation: exp.organisation,
				missions:
					exp.cvMissions?.map((m) => ({
						clientKey: `mission-${uuid()}`,
						order: m.order,
						content: { content: m.content },
					})) ?? [],
			},
		})),
		educations: (cv.educations ?? []).map((exp) => ({
			clientKey: `education-${uuid()}`,
			order: exp.order,
			content: {
				title: exp.title,
				start: exp.start,
				end: exp.end,
				school: exp.school,
				degree: exp.degree,
				city: exp.city,
				obtained: exp.obtained ?? "COMPLETED",
			},
		})),
		skillGroups: (cv.skillGroups ?? []).map((exp) => ({
			clientKey: `skillGroup-${uuid()}`,
			order: exp.order,
			content: {
				title: exp.title,
				skills: (exp.skills ?? []).map((s) => ({
					clientKey: `skill-${uuid()}`,
					order: s.order,
					content: {
						name: s.skill.name,
						skillId: s.skillId,
						level: s.level,
					},
				})),
			},
		})),
		languages: (cv.languages ?? []).map((exp) => ({
			clientKey: `language-${uuid()}`,
			order: exp.order,
			content: {
				name: exp.name,
				level: exp.level,
			},
		})),
		tagGroups: (cv.tagGroups ?? []).map((exp) => ({
			clientKey: `tagGroup-${uuid()}`,
			order: exp.order,
			content: {
				title: exp.title,
				tags: (exp.tags ?? []).map((t) => ({
					clientKey: `tag-${uuid()}`,
					order: t.order,
					content: { name: t.tag.name, tagId: t.tagId },
				})),
			},
		})),
		competenceGroups: (cv.competences ?? []).map((exp) => ({
			clientKey: `competenceGroup-${uuid()}`,
			order: exp.order,
			content: {
				title: exp.title,
				competences:
					exp.cvCompetences?.map((c) => ({
						clientKey: `competence-${uuid()}`,
						order: c.order,
						content: {
							name: c.competence.name,
							competenceId: c.competenceId,
						},
					})) ?? [],
			},
		})),
		socialMedias: (cv.socialMedias ?? []).map((exp) => ({
			clientKey: `socialMedia-${uuid()}`,
			order: exp.order,
			content: {
				icon: exp.icon,
				socialNetwork: exp.socialNetwork ?? "",
				username: exp.username ?? "",
			},
		})),
		expertises: (cv.expertises ?? []).map((exp) => ({
			clientKey: `expertise-${uuid()}`,
			order: exp.order,
			content: {
				title: exp.title,
				level: exp.level,
			},
		})),
		certifications: (cv.certifications ?? []).map((exp) => ({
			clientKey: `certification-${uuid()}`,
			order: exp.order,
			content: {
				title: exp.title,
				organismeCertification: exp.organismeCertification ?? "",
			},
		})),
		formations: (cv.formations ?? []).map((exp) => ({
			clientKey: `formation-${uuid()}`,
			order: exp.order,
			content: {
				title: exp.title,
				start: exp.start,
				end: exp.end,
				organismeFormation: exp.organismeFormation ?? "",
				status: exp.status ?? "COMPLETED",
			},
		})),
		passions: (cv.passions ?? []).map((exp) => ({
			clientKey: `passion-${uuid()}`,
			order: exp.order,
			content: {
				title: exp.title,
				icon: exp.icon,
			},
		})),
		prizes: (cv.prizes ?? []).map((exp) => ({
			clientKey: `prize-${uuid()}`,
			order: exp.order,
			content: {
				title: exp.title,
				icon: exp.icon ?? "faTrophy",
				domaine: exp.domaine,
			},
		})),
	};
}
