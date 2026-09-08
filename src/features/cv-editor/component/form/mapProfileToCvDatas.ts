import { templateStructureSchema, type TemplateModule } from "@/services/schemas/cvTemplate.schema";
import type { TemplateCv } from "@utils/trpc.types";
import type { CvFormValues } from "@/services/schemas/cvSave.schema";
import type { ProfileComplete } from "./FormCv";

function getModule<T extends TemplateModule["type"]>(
    modules: TemplateModule[],
    type: T,
): Extract<TemplateModule, { type: T }> | undefined {
    return modules.find(
      (m): m is Extract<TemplateModule, { type: T }> => m.type === type,
    );
}

export function mapProfileToCvDatas(
  profile: ProfileComplete,
  model: TemplateCv,
): Partial<CvFormValues["datas"]> {
  const { modules, header } = templateStructureSchema.parse(model.structure);
  const byType = Object.fromEntries(modules.map((m) => [m.type, m]));

  const exp = getModule(modules, "experience");
  const edu = getModule(modules, "education");
  const strength = getModule(modules, "strength");
  const language = getModule(modules, "language");
  const description = getModule(modules, "description");
  const philosophy = getModule(modules, "philosophy");
  const publication = getModule(modules, "publication");
  const volunteering = getModule(modules, "volunteering");
  const achievement = getModule(modules, "achievement");
  const project = getModule(modules, "project");
  const passion = getModule(modules, "passion");
  const expertise = getModule(modules, "expertise");
  const certification = getModule(modules, "certification");
  const prize = getModule(modules, "prize");
  const socialMedia = getModule(modules, "socialMedia");
  const formation = getModule(modules, "formation");
  const skill = getModule(modules, "skill");
  const tag = getModule(modules, "tag");
  const competence = getModule(modules, "competence");

  // idem education, strength, …

  return {
    header: {
      prenom: profile.firstName,
      nom: profile.lastName,
      title: `${profile.firstName} ${profile.lastName}`,
      subtitle: "",
      phone: profile.phone ?? "",
      email: profile.email ?? "",
      location: profile.location ?? "",
      portfolio: "",
      settings: header.settings, // si tu veux aussi le header template
    },
    ...(exp
      ? {
          experience: {
            title: exp.title,
            settings: { title: exp.settings.title },
            content: profile.experiences.map((e) => ({
              clientKey: e.id,
              order: e.order,
              content: {
                title: e.title,
                company: e.company,
                start: e.start,
                end: e.end,
                description: e.description ?? undefined,
                location: e.location ?? undefined,
                missions: (e.missions ?? []).map((m) => ({
                  clientKey: m.id,
                  order: m.order,
                  content: { content: m.content },
                })),
                settings: exp.settings.content, // withTitle, styles…
              },
            })),
          },
        }
      : {}),
    ...(edu
      ? {
          education: {
            title: edu.title,
            settings: { title: edu.settings.title },
            content: profile.educations.map((e) => ({
              clientKey: e.id,
              order: e.order,
              content: {
                title: e.title ?? "",
                school: e.school,
                degree: e.degree ?? "",
                start: e.start,
                end: e.end ?? undefined,
                obtained: e.obtained,
                city: e.city ?? undefined,
                settings: edu.settings.content, // withTitle, styles…
              },
            })),
          },
        }
      : {}),
      ...(strength
        ? {
            strength: {
              title: strength.title,
              settings: { title: strength.settings.title },
              content: profile.strengths.map((s) => ({
                clientKey: s.id,
                order: s.order,
                content: { 
                    title: s.title, 
                    description: s.description ?? undefined, 
                    icon: s.icon ?? undefined,
                    settings: strength.settings.content, // withTitle, styles…
                },
              })),
            },
          }
        : {}),
    ...(language
      ? {
          language: {
            title: language.title,
            settings: { title: language.settings.title },
            content: profile.languages.map((l) => ({
              clientKey: l.id,
              order: l.order,
              content: {
                level: l.level,
                name: l.name,
                settings: language.settings.content, // withTitle, styles…
              },
            })),
          },
        }
      : {}),
    ...(achievement
      ? {
          achievement: {
            title: achievement.title,
            settings: { title: achievement.settings.title },
            content: profile.achievements.map((a) => ({
              clientKey: a.id,
              order: a.order,
              content: { 
                title: a.title, 
                description: a.description ?? undefined, 
                technology: a.technology ?? undefined, 
                year: a.year ?? undefined,
                settings: achievement.settings.content, // withTitle, styles…
              },
            })),
          },
        }
      : {}),
    ...(project
      ? {
          project: {
            title: project.title,
            settings: { title: project.settings.title },
            content: profile.projects.map((p) => ({
              clientKey: p.id,
              order: p.order,
              content: { 
                title: p.title, 
                description: p.description ?? undefined, 
                technology: p.technology ?? undefined, 
                start: p.start ?? undefined,
                end: p.end ?? undefined,
                location: p.location ?? undefined,
                missions: (p.missions ?? []).map((m) => ({
                  clientKey: m.id,
                  order: m.order,
                  content: { content: m.content },
                })),
                settings: project.settings.content, // withTitle, styles…
              },
            })),
          },
        }
      : {}),
    ...(passion
      ? {
          passion: {
            title: passion.title,
            settings: { title: passion.settings.title },
            content: profile.passions.map((p) => ({
              clientKey: p.id,
              order: p.order,
              content: { 
                title: p.title, 
                icon: p.icon ?? undefined,
                settings: passion.settings.content, // withTitle, styles…
              },
            })),
          },
        }
      : {}),
    ...(expertise
      ? {
          expertise: {
            title: expertise.title,
            settings: { title: expertise.settings.title },
            content: profile.expertises.map((e) => ({
              clientKey: e.id,
              order: e.order,
              content: { 
                title: e.title, 
                level: e.level,
                settings: expertise.settings.content, // withTitle, styles…
              },
            })),
          },
        }
      : {}),
    ...(certification
      ? {
          certification: {
            title: certification.title,
            settings: { title: certification.settings.title },
            content: profile.certifications.map((c) => ({
              clientKey: c.id,
              order: c.order,
              content: { 
                title: c.title, 
                organismeCertification: c.organismeCertification ?? "",
                settings: certification.settings.content, // withTitle, styles…
              },
            })),
          },
        }
      : {}),
    ...(prize
      ? {
          prize: {
            title: prize.title,
            settings: { title: prize.settings.title },
            content: profile.prizes.map((p) => ({
              clientKey: p.id,
              order: p.order,
              content: { 
                title: p.title, 
                domaine: p.domaine,
                icon: p.icon ?? undefined, 
                settings: prize.settings.content, // withTitle, styles…
              },
            })),
          },
        }
      : {}),
    ...(publication
      ? {
          publication: {
            title: publication.title,
            settings: { title: publication.settings.title },
            content: profile.publications.map((p) => ({
              clientKey: p.id,
              order: p.order,
              content: { 
                title: p.title, 
                description: p.description ?? undefined, 
                start: p.start ?? undefined,
                end: p.end ?? undefined,
                url: p.url ?? undefined,
                journalName: p.journalName ?? undefined,
                settings: publication.settings.content, // withTitle, styles…
              },
            })),
          },
        }
      : {}),
    ...(volunteering
      ? {
          volunteering: {
            title: volunteering.title,
            settings: { title: volunteering.settings.title },
            content: profile.volunteerings.map((v) => ({
              clientKey: v.id,
              order: v.order,
              content: { 
                title: v.title, 
                organisation: v.organisation,
                start: v.start ?? undefined,
                end: v.end ?? undefined,
                location: v.location ?? undefined,
                description: v.description ?? undefined, 
                missions: (v.missions ?? []).map((m) => ({
                  clientKey: m.id,
                  order: m.order,
                  content: { content: m.content },
                })),
                settings: volunteering.settings.content, // withTitle, styles…
              },
            })),
          },
        }
      : {}),
    ...(socialMedia
      ? {
          socialMedia: {
            title: socialMedia.title,
            settings: { title: socialMedia.settings.title },
            content: profile.socialMedias.map((s) => ({
              clientKey: s.id,
              order: s.order,
              content: { 
                socialNetwork: s.socialNetwork ?? undefined, 
                username: s.username, 
                icon: s.icon ?? "",
                settings: socialMedia.settings.content, // withTitle, styles…
            },
            })),
          },
        }
      : {}),
    ...(formation
      ? {
          formation: {
            title: formation.title,
            settings: { title: formation.settings.title },
            content: profile.formations.map((f) => ({
              clientKey: f.id,
              order: f.order,
              content: { 
                title: f.title, 
                organismeFormation: f.organismeFormation ?? "", 
                status: f.status, 
                start: f.start, 
                end: f.end ?? undefined,
                settings: formation.settings.content, // withTitle, styles…
              },
            })),
          },
        }
      : {}),
    ...(skill
      ? {
          skillGroup: {
            title: skill.title,
            settings: { title: skill.settings.title },
            content: profile.skills.map((s) => ({
              clientKey: s.id,
              order: s.order,
              content: { title: s.title ?? "", skills: s.skills.map((s) => ({
                clientKey: s.id,
                order: s.order,
                content: {
                    name: s.skill.name,
                    skillId: s.skillId,
                    level: s.level,
                  },
              })), settings: skill.settings.content, // withTitle, styles…
              },
            })),
          },
        }
      : {}),
    ...(competence
      ? {
          competenceGroup: {
            title: competence.title,
            settings: { title: competence.settings.title },
            content: profile.competences.map((c) => ({
              clientKey: c.id,
              order: c.order,
              content: { title: c.title ?? "", competences: c.competences.map((c) => ({
                clientKey: c.id,
                order: c.order,
                content: {
                    name: c.competence.name,
                    competenceId: c.competenceId,
                  },
              })), settings: competence.settings.content, // withTitle, styles…
              },
            })),
          },
        }
      : {}),
    ...(tag
      ? {
          tagGroup: {
            title: tag.title,
            settings: { title: tag.settings.title },
            content: profile.tags.map((t) => ({
              clientKey: t.id,
              order: t.order,
              content: {
                title: t.title ?? "",
                tags: (t.tags ?? []).map((tg) => ({
                  clientKey: tg.id,
                  order: tg.order,
                  content: { name: tg.tag.name, tagId: tg.tagId },
                })),
                settings: tag.settings.content,
              },
            })),
          },
        }
      : {}),
    ...(description
      ? {
          description: {
            title: description.title,
            settings: { 
                title: description.settings.title, 
                content: description.settings.content.description 
            },
            content: { description: profile.description?.description ?? "" },
          },
        }
      : {}),
    ...(philosophy
      ? {
          philosophy: {
            title: philosophy.title,
            settings: { title: philosophy.settings.title, content: philosophy.settings.content },
            content: { citation: profile.philosophy?.citation ?? "", author: profile.philosophy?.author ?? "" },
          },
        }
      : {}),
    // …mêmes blocs pour education, strength, etc.
  };
}