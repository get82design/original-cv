import type { AppRouter } from "@server/api/root";
import type { inferRouterOutputs } from "@trpc/server";
import type { ProfileSaveInput } from "@/services/schemas/profileSave.schema";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type ProfileComplete = NonNullable<RouterOutputs["profile"]["completeMe"]>;
type ProfileSaved = NonNullable<RouterOutputs["profile"]["save"]>;
export type ProfileMapperInput = ProfileComplete | ProfileSaved;

export function mapProfileToSaveInput(
	profile: ProfileMapperInput,
): ProfileSaveInput & { id: string } {
	return {
		id: profile.id,
		firstName: profile.firstName,
		lastName: profile.lastName,
		phone: profile.phone,
		location: profile.location,
		email: profile.email,
		photo: profile.photo,
		drivingLicenses: profile.drivingLicenses ?? [],
		hasVehicle: profile.hasVehicle ?? false,
		description: profile.description
			? {
					id: profile.description.id,
					description: profile.description.description,
				}
			: undefined,
		philosophy: profile.philosophy
			? {
					id: profile.philosophy.id,
					citation: profile.philosophy.citation,
					author: profile.philosophy.author,
				}
			: undefined,
		experiences: profile.experiences.map((exp) => ({
			id: exp.id,
			clientKey: exp.id, // stable après save
			order: exp.order,
			content: {
				title: exp.title,
				company: exp.company,
				start: exp.start,
				end: exp.end,
				location: exp.location,
				description: exp.description,
				missions: (exp.missions ?? []).map((m) => ({
					id: m.id,
					clientKey: m.id,
					order: m.order,
					content: { content: m.content },
				})),
			},
		})),
		achievements: profile.achievements.map((achievement) => ({
			id: achievement.id,
			clientKey: achievement.id,
			order: achievement.order,
			content: {
				title: achievement.title,
				description: achievement.description,
				technology: achievement.technology,
				year: achievement.year,
			},
		})),
		strengths: profile.strengths.map((strength) => ({
			id: strength.id,
			clientKey: strength.id,
			order: strength.order,
			content: {
				title: strength.title,
				icon: strength.icon ?? "",
				description: strength.description,
			},
		})),
		stats: (profile.stats ?? []).map((stat) => ({
			id: stat.id,
			clientKey: stat.id,
			order: stat.order,
			content: {
				label: stat.label,
				value: stat.value,
			},
		})),
		projects: profile.projects.map((project) => ({
			id: project.id,
			clientKey: project.id,
			order: project.order,
			content: {
				title: project.title,
				start: project.start,
				end: project.end,
				location: project.location,
				technology: project.technology,
				description: project.description,
				result: project.result,
				missions: (project.missions ?? []).map((p) => ({
					id: p.id,
					clientKey: p.id,
					order: p.order,
					content: { content: p.content },
				})),
			},
		})),
		publications: profile.publications.map((publication) => ({
			id: publication.id,
			clientKey: publication.id,
			order: publication.order,
			content: {
				title: publication.title,
				start: publication.start,
				end: publication.end,
				description: publication.description,
				url: publication.url,
				journalName: publication.journalName,
			},
		})),
		volunteerings: profile.volunteerings.map((volunteering) => ({
			id: volunteering.id,
			clientKey: volunteering.id,
			order: volunteering.order,
			content: {
				title: volunteering.title,
				start: volunteering.start,
				end: volunteering.end,
				location: volunteering.location,
				description: volunteering.description,
				missions: (volunteering.missions ?? []).map((v) => ({
					id: v.id,
					clientKey: v.id,
					order: v.order,
					content: { content: v.content },
				})),
				organisation: volunteering.organisation,
			},
		})),
		skillGroups: profile.skills.map((group) => ({
			id: group.id,
			clientKey: group.id,
			order: group.order,
			content: {
				title: group.title,
				skills: (group.skills ?? []).map((s) => ({
					id: s.id,
					clientKey: s.id,
					order: s.order,
					content: {
						name: s.skill.name,
						skillId: s.skillId,
						level: s.level,
					},
				})),
			},
		})),
		tagGroups: profile.tags.map((group) => ({
			id: group.id,
			clientKey: group.id,
			order: group.order,
			content: {
				title: group.title,
				tags: (group.tags ?? []).map((t) => ({
					id: t.id,
					clientKey: t.id,
					order: t.order,
					content: { name: t.tag.name, tagId: t.tagId },
				})),
			},
		})),
		competenceGroups: profile.competences.map((group) => ({
			id: group.id,
			clientKey: group.id,
			order: group.order,
			content: {
				title: group.title,
				competences: (group.competences ?? []).map((c) => ({
					id: c.id,
					clientKey: c.id,
					order: c.order,
					content: { name: c.competence.name, competenceId: c.competenceId },
				})),
			},
		})),
		educations: profile.educations.map((education) => ({
			id: education.id,
			clientKey: education.id,
			order: education.order,
			content: {
				title: education.title ?? "",
				start: education.start,
				end: education.end,
				obtained: education.obtained ?? "COMPLETED",
				degree: education.degree,
				city: education.city,
				school: education.school,
			},
		})),
		languages: profile.languages.map((language) => ({
			id: language.id,
			clientKey: language.id,
			order: language.order,
			content: {
				name: language.name,
				level: language.level,
			},
		})),
		socialMedias: profile.socialMedias.map((socialMedia) => ({
			id: socialMedia.id,
			clientKey: socialMedia.id,
			order: socialMedia.order,
			content: {
				icon: socialMedia.icon,
				socialNetwork: socialMedia.socialNetwork ?? "",
				username: socialMedia.username ?? "",
			},
		})),
		expertises: profile.expertises.map((expertise) => ({
			id: expertise.id,
			clientKey: expertise.id,
			order: expertise.order,
			content: { title: expertise.title, level: expertise.level },
		})),
		certifications: profile.certifications.map((certification) => ({
			id: certification.id,
			clientKey: certification.id,
			order: certification.order,
			content: {
				title: certification.title,
				organismeCertification: certification.organismeCertification ?? "",
			},
		})),
		formations: profile.formations.map((formation) => ({
			id: formation.id,
			clientKey: formation.id,
			order: formation.order,
			content: {
				title: formation.title,
				start: formation.start,
				end: formation.end,
				organismeFormation: formation.organismeFormation ?? "",
				status: formation.status ?? "COMPLETED",
			},
		})),
		passions: profile.passions.map((passion) => ({
			id: passion.id,
			clientKey: passion.id,
			order: passion.order,
			content: {
				title: passion.title,
				icon: passion.icon ?? "",
			},
		})),
		prizes: profile.prizes.map((prize) => ({
			id: prize.id,
			clientKey: prize.id,
			order: prize.order,
			content: {
				title: prize.title,
				icon: prize.icon ?? "",
				domaine: prize.domaine ?? "",
			},
		})),
	};
}
