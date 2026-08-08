// src/features/cv-editor/mapCvToSaveInput.ts
import type { inferRouterOutputs } from "@trpc/server";
import type { Prisma } from "../../../generated/prisma/client";
import type { AppRouter } from "../../../server/api/root";
import type { CvSaveInput } from "../../services/schemas/cvSave.schema";
import {
    educationContentSchema, 
    experienceContentSchema, 
    languageContentSchema, 
    projectContentSchema,
    socialMediaContentSchema,
} from "../../services/schemas/cvTemplate.schema";

type RouterOutputs = inferRouterOutputs<AppRouter>;
export type CvFull = RouterOutputs["cv"]["byId"];
type ExperienceSettings = NonNullable<CvSaveInput["datas"]["experience"]>["settings"]
type EducationSettings = NonNullable<CvSaveInput["datas"]["education"]>["settings"]
type SkillGroupSettings = NonNullable<CvSaveInput["datas"]["skillGroup"]>["settings"]
type LanguageSettings = NonNullable<CvSaveInput["datas"]["language"]>["settings"]
type ProjectSettings = NonNullable<CvSaveInput["datas"]["project"]>["settings"]
type SocialMediaSettings = NonNullable<CvSaveInput["datas"]["socialMedia"]>["settings"]

const defaultTitleSettings: ExperienceSettings["title"] = {
    sizeModel: "18px",
    weightModel: 600,
    colorSelect: "black",
    sizeSelect: "md",
    weightSelect: "md",
    withPrimaryColor: false,
    textAlign: "left",
  }

export function mapCvToSaveInput(cv: CvFull): CvSaveInput {
    const experienceModule = cv.modules.find((m) => m.type === "experience")
    const descriptionModule = cv.modules.find((m) => m.type === "description")
    const educationModule = cv.modules.find((m) => m.type === "education")
    const skillModule = cv.modules.find((m) => m.type === "skill")
    const languageModule = cv.modules.find((m) => m.type === "language")
    const projectModule = cv.modules.find((m) => m.type === "project")
    const socialMediaModule = cv.modules.find((m) => m.type === "socialMedia")
	return {
		cvId: cv.id,
		templateId: cv.templateId,
		title: cv.title,
		...(cv.photo !== undefined ? { photo: cv.photo } : {}),
        ...(cv.layoutGeneral != null &&
            Object.keys(cv.layoutGeneral as object).length > 0
                ? { layoutGeneral: cv.layoutGeneral as NonNullable<CvSaveInput["layoutGeneral"]> }
                : {}),
		datas: {
			...(cv.headerCv
				? {
						header: {
							id: cv.headerCv.id,
							title: cv.headerCv.title,
							...(cv.headerCv.subtitle != null
								? { subtitle: cv.headerCv.subtitle }
								: {}),
							...(cv.headerCv.phone != null
								? { phone: cv.headerCv.phone }
								: {}),
							...(cv.headerCv.email != null
								? { email: cv.headerCv.email }
								: {}),
							...(cv.headerCv.location != null
								? { location: cv.headerCv.location }
								: {}),
							...(cv.headerCv.portfolio != null
								? { portfolio: cv.headerCv.portfolio }
								: {}),
							...(cv.headerCv.nom != null ? { nom: cv.headerCv.nom } : {}),
							...(cv.headerCv.prenom != null
								? { prenom: cv.headerCv.prenom }
								: {}),
						},
					}
				: {}),
			...(cv.description
				? {
						description: {
							id: cv.description.id,
							content: { description: cv.description.description },
                            settings: {
                                title:
                                  (descriptionModule?.settings as { title?: typeof defaultTitleSettings } | null)
                                    ?.title ?? defaultTitleSettings,
                                content: defaultTitleSettings, // ou un default un peu plus "body"
                            },
						},
					}
				: {}),
			experience: {
				content: [...cv.experiences]
					.sort((a, b) => a.order - b.order)
					.map((exp) => ({
						id: exp.id,
						clientKey: exp.id,
						order: exp.order,
						content: {
							title: exp.title,
							company: exp.company,
							start: exp.start,
							...(exp.end !== undefined ? { end: exp.end } : {}),
							...(exp.location != null ? { location: exp.location } : {}),
							...(exp.description != null
								? { description: exp.description }
								: {}),
							...(exp.settings != null
								? {
										settings: experienceContentSchema.parse(exp.settings),
									}
								: {}),
							missions: [...exp.cvMissions]
								.sort((a, b) => a.order - b.order)
								.map((m) => ({
									id: m.id,
									clientKey: m.id,
									order: m.order,
									content: { content: m.content },
								})),
						},
					})),
                settings: {
                    title:
                        (experienceModule?.settings as { title?: ExperienceSettings["title"] } | null)
                        ?.title ?? defaultTitleSettings,
                    },
			},
            project: {
				content: [...cv.projects]
					.sort((a, b) => a.order - b.order)
					.map((project) => ({
						id: project.id,
						clientKey: project.id,
						order: project.order,
						content: {
							title: project.title,
							start: project.start,
							...(project.end !== undefined ? { end: project.end } : {}),
							...(project.location != null ? { location: project.location } : {}),
							...(project.description != null
								? { description: project.description }
								: {}),
                            ...(project.technology != null ? { technology: project.technology } : {}),
                            ...(project.status != null ? { status: project.status } : {}),
							missions: [...project.cvMissions]
								.sort((a, b) => a.order - b.order)
								.map((m) => ({
									id: m.id,
									clientKey: m.id,
									order: m.order,
									content: { content: m.content },
								})),
                            ...(project.settings != null
                                ? {
                                        settings: projectContentSchema.parse(project.settings),
                                    }
                                : {}),
						},
					})),
                settings: {
                    title:
                        (projectModule?.settings as { title?: ProjectSettings["title"] } | null)
                        ?.title ?? defaultTitleSettings,
                    },
			},
            volunteering: {
				content: [...cv.volunteerings]
					.sort((a, b) => a.order - b.order)
					.map((volunteering) => ({
						id: volunteering.id,
						clientKey: volunteering.id,
						order: volunteering.order,
						content: {
							title: volunteering.title,
							organisation: volunteering.organisation,
							start: volunteering.start,
							...(volunteering.end !== undefined ? { end: volunteering.end } : {}),
							...(volunteering.location != null ? { location: volunteering.location } : {}),
							...(volunteering.description != null
								? { description: volunteering.description }
								: {}),
                            ...(volunteering.settings != null
                                ? {
                                        settings: volunteering.settings as Record<string, boolean>,
                                    }
                                : {}),
							missions: [...volunteering.cvMissions]
								.sort((a, b) => a.order - b.order)
								.map((m) => ({
									id: m.id,
									clientKey: m.id,
									order: m.order,
									content: { content: m.content },
								})),
						},
					})),
			},
            formation: {
                content: [...cv.formations]
                    .sort((a, b) => a.order - b.order)
                    .map((formation) => ({
                        id: formation.id,
                        clientKey: formation.id,
                        order: formation.order,
                        content: {
                            title: formation.title,
                            start: formation.start,
                            ...(formation.organismeFormation != null
                                ? { organismeFormation: formation.organismeFormation }
                                : {}),
                            ...(formation.end !== undefined ? { end: formation.end } : {}),
                            ...(formation.status != null ? { status: formation.status } : {}),
                            ...(formation.settings != null
                                ? { settings: formation.settings as Record<string, boolean>,
                                }
                            : {}),
                        },
                    })),
            },
            certification: {
                content: [...cv.certifications]
                    .sort((a, b) => a.order - b.order)
                    .map((certification) => ({
                        id: certification.id,
                        clientKey: certification.id,
                        order: certification.order,
                        content: {
                            title: certification.title,
                            organismeCertification: certification.organismeCertification ?? "",
                            ...(certification.settings != null
                                ? { settings: certification.settings as Record<string, boolean>,
                                }
                            : {}),
                        },
                    })),
            },
            prize: {
                content: [...cv.prizes]
                    .sort((a, b) => a.order - b.order)
                    .map((prize) => ({
                        id: prize.id,
                        clientKey: prize.id,
                        order: prize.order,
                        content: {
                            title: prize.title,
                            domaine: prize.domaine ?? "",
                            ...(prize.settings != null
                                ? { settings: prize.settings as Record<string, boolean>,
                                }
                            : {}),
                        },
                    })),
            },
            expertise: {
                content: [...cv.expertises]
                    .sort((a, b) => a.order - b.order)
                    .map((expertise) => ({
                        id: expertise.id,
                        clientKey: expertise.id,
                        order: expertise.order,
                        content: {
                            title: expertise.title,
                            level: expertise.level,
                            ...(expertise.settings != null
                                ? { settings: expertise.settings as Record<string, boolean>,
                                }
                            : {}),
                        },
                    })),
            },
            ...(cv.philosophy
				? {
						philosophy: {
							id: cv.philosophy.id,
							content: { 
                                citation: cv.philosophy.citation, 
                                author: cv.philosophy.author ?? undefined,
                                ...(cv.philosophy.settings != null
                                    ? { settings: cv.philosophy.settings as Record<string, boolean>,
                                    }
                                : {})},
						},
					}
				: {}),
            socialMedia: {
                content: [...cv.socialMedias]
                    .sort((a, b) => a.order - b.order)
                    .map((socialMedia) => ({
                        id: socialMedia.id,
                        clientKey: socialMedia.id,
                        order: socialMedia.order,
                        content: { 
                            socialNetwork: socialMedia.socialNetwork ?? undefined, 
                            username: socialMedia.username,
                            icon: socialMedia.icon,
                            ...(socialMedia.settings != null
                                ? { settings: socialMediaContentSchema.parse(socialMedia.settings)
                                }
                            : {})},
                    })),
                settings: {
                    title:
                        (socialMediaModule?.settings as { title?: SocialMediaSettings["title"] } | null)
                        ?.title ?? defaultTitleSettings,
                    },
            },
            passion: {
                content: [...cv.passions]
                    .sort((a, b) => a.order - b.order)
                    .map((passion) => ({
                        id: passion.id,
                        clientKey: passion.id,
                        order: passion.order,
                        content: { title: passion.title, icon: passion.icon,
                            ...(passion.settings != null
                                ? { settings: passion.settings as Record<string, boolean>,
                                }
                            : {})},
                    })),
            },
            language: {
                content: [...cv.languages]
                    .sort((a, b) => a.order - b.order)
                    .map((language) => ({
                        id: language.id,
                        clientKey: language.id,
                        order: language.order,
                        content: { name: language.name, level: language.level,
                            ...(language.settings != null
                                ? { settings: languageContentSchema.parse(language.settings),
                                }
                            : {})},
                    })),
                settings: {
                    title:
                        (languageModule?.settings as { title?: LanguageSettings["title"] } | null)
                        ?.title ?? defaultTitleSettings,
                    },
            },
            publication: {
                content: [...cv.publications]
                    .sort((a, b) => a.order - b.order)
                    .map((publication) => ({
                        id: publication.id,
                        clientKey: publication.id,
                        order: publication.order,
                        content: { 
                            title: publication.title, 
                            start: publication.start, 
                            ...(publication.end !== undefined ? { end: publication.end } : {}), 
                            ...(publication.journalName != null ? { journalName: publication.journalName } : {}),
                            ...(publication.description != null ? { description: publication.description } : {}),
                            ...(publication.url != null ? { url: publication.url } : {}),
                            ...(publication.settings != null
                            ? { settings: publication.settings as Record<string, boolean>,
                            }
                        : {})},
                    })),
            },
            strength: {
                content: [...cv.strengths]
                    .sort((a, b) => a.order - b.order)
                    .map((strength) => ({
                        id: strength.id,
                        clientKey: strength.id,
                        order: strength.order,
                        content: { title: strength.title, icon: strength.icon ?? undefined,
                            ...(strength.settings != null
                                ? { settings: strength.settings as Record<string, boolean>,
                                }
                            : {})},
                    })),
            },
            achievement: {
                content: [...cv.achievements]
                    .sort((a, b) => a.order - b.order)
                    .map((achievement) => ({
                        id: achievement.id,
                        clientKey: achievement.id,
                        order: achievement.order,
                        content: { title: achievement.title, description: achievement.description ?? undefined,
                            ...(achievement.settings != null
                                ? { settings: achievement.settings as Record<string, boolean>,
                                }
                            : {})},
                    })),
            },
            education: {
                content: [...cv.educations]
                    .sort((a, b) => a.order - b.order)
                    .map((education) => ({
                        id: education.id,
                        clientKey: education.id,
                        order: education.order,
                        content: { 
                            title: education.title ?? "",
                            school: education.school,
                            degree: education.degree,
                            city: education.city ?? undefined,
                            start: education.start,
                            end: education.end ?? undefined,
                            obtained: education.obtained ?? undefined,
                            ...(education.settings != null
                                ? {
                                    settings: educationContentSchema.parse(education.settings),
                                  }
                                : {}),
                        },
                    })),
                settings: {
                    title:
                        (educationModule?.settings as { title?: EducationSettings["title"] } | null)
                        ?.title ?? defaultTitleSettings,
                    },
            },
            skillGroup: {
                content: [...cv.skillGroups]
                    .sort((a, b) => a.order - b.order)
                    .map((g) => ({
                        id: g.id,
                        clientKey: g.id,
                        order: g.order,
                        content: {
                        title: g.title ?? "",
                        skills: [...g.skills] // ou g.skills selon l'include findById
                            .sort((a, b) => a.order - b.order)
                            .map((s) => ({
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
                settings: {
                    title:
                        (skillModule?.settings as { title?: SkillGroupSettings["title"] } | null)
                        ?.title ?? defaultTitleSettings,
                    },
              },
            competenceGroup: {
                content: [...cv.competences]
                    .sort((a, b) => a.order - b.order)
                    .map((g) => ({
                        id: g.id,
                        clientKey: g.id,
                        order: g.order,
                        content: {
                            title: g.title ?? "",
                            competences: [...g.cvCompetences]
                                .sort((a, b) => a.order - b.order)
                                .map((c) => ({
                                    id: c.id,
                                    clientKey: c.id,
                                    order: c.order,
                                    content: {
                                        competenceId: c.competenceId,
                                    },
                                })),
                        },
                    })),
            },
		},
		modules: [...cv.modules]
			.sort((a, b) => a.order - b.order)
			.map((m) => ({
				id: m.id,
				type: m.type,
				order: m.order,
				isActive: m.isActive,
				...(m.title != null ? { title: m.title } : {}),
				settings: (m.settings ?? {}) as Prisma.InputJsonValue,
			})),
	};
}