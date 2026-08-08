import type { CvSaveInput } from "@/services/schemas/cvSave.schema"
import { templateDefaultStylesSchema, templateStructureSchema } from "@/services/schemas/cvTemplate.schema"
import type { TemplateCv } from "@utils/trpc.types"

export function applyTemplateToForm(
    current: CvSaveInput,
    model: TemplateCv,
    options?: { updateModules?: boolean }
  ): CvSaveInput {
    const structure = templateStructureSchema.parse(model.structure)
    const defaultStyles = templateDefaultStylesSchema.parse(model.defaultStyles)

    const experienceFromModel = structure.modules.find(
        (m): m is Extract<typeof m, { type: "experience" }> => m.type === "experience",
      )
    const educationFromModel = structure.modules.find(
        (m): m is Extract<typeof m, { type: "education" }> => m.type === "education",
      )
    const descriptionFromModel = structure.modules.find(
        (m): m is Extract<typeof m, { type: "description" }> => m.type === "description",
      )
    const skillGroupFromModel = structure.modules.find(
        (m): m is Extract<typeof m, { type: "skill" }> => m.type === "skill",
      )
    const languageFromModel = structure.modules.find(
        (m): m is Extract<typeof m, { type: "language" }> => m.type === "language",
      )
    const projectFromModel = structure.modules.find(
        (m): m is Extract<typeof m, { type: "project" }> => m.type === "project",
      )
    const socialMediaFromModel = structure.modules.find(
        (m): m is Extract<typeof m, { type: "socialMedia" }> => m.type === "socialMedia",
      )
    return {
      ...current,
      templateId: model.id,
      layoutGeneral: {
        layout: structure.layout,
        defaultStyles,
        // slugTemplate: defaultStyles.slugTemplate,
        // components: defaultStyles.components,
      },
      datas: {
        ...current.datas,
        header: {
          ...current.datas?.header,
        //   settings: current.datas?.header?.settings ?? structure.header.settings, // ← styles du template
          settings: structure.header.settings, // ← styles du template
        },
        ...(experienceFromModel || current.datas?.experience
            ? {
                experience: {
                  title: current.datas?.experience?.title ?? experienceFromModel!.title,
                  content: current.datas?.experience?.content ?? [],
                  settings:
                    current.datas?.experience?.settings ?? {
                      title: experienceFromModel!.settings.title,
                    },
                },
              }
            : {}
        ),
        ...(educationFromModel || current.datas?.education
            ? {
                education: {
                  title: current.datas?.education?.title ?? educationFromModel!.title,
                  content: current.datas?.education?.content ?? [],
                  settings: current.datas?.education?.settings ?? {
                    title: educationFromModel!.settings.title,
                  },
                },
              }
            : {}),
        ...(descriptionFromModel || current.datas?.description
            ? {
                description: {
                  title: current.datas?.description?.title ?? descriptionFromModel!.title,
                  content: current.datas?.description?.content ?? { description: '' },
                  settings: current.datas?.description?.settings ?? {
                    title: descriptionFromModel!.settings.title,
                    content: descriptionFromModel!.settings.content.description,
                  },
                },
              }
            : {}),
        ...(skillGroupFromModel || current.datas?.skillGroup
            ? {
                skillGroup: {
                  title: current.datas?.skillGroup?.title ?? skillGroupFromModel!.title,
                  content: current.datas?.skillGroup?.content ?? [],
                  settings: current.datas?.skillGroup?.settings ?? {
                    title: skillGroupFromModel!.settings.title,
                  },
                },
              }
            : {}),
        ...(languageFromModel || current.datas?.language
            ? {
                language: {
                  title: current.datas?.language?.title ?? languageFromModel!.title,
                  content: current.datas?.language?.content ?? [],
                  settings: current.datas?.language?.settings ?? {
                    title: languageFromModel!.settings.title,
                  },
                },
              }
            : {}),
        ...(projectFromModel || current.datas?.project
            ? {
                project: {
                  title: current.datas?.project?.title ?? projectFromModel!.title,
                  content: current.datas?.project?.content ?? [],
                  settings: current.datas?.project?.settings ?? {
                    title: projectFromModel!.settings.title,
                  },
                },
              }
            : {}),
        ...(socialMediaFromModel || current.datas?.socialMedia
            ? {
                socialMedia: {
                  title: current.datas?.socialMedia?.title ?? socialMediaFromModel!.title,
                  content: current.datas?.socialMedia?.content ?? [],
                  settings: current.datas?.socialMedia?.settings ?? {
                    title: socialMediaFromModel!.settings.title,
                  },
                },
              }
            : {}),
      },
      ...(options?.updateModules
        ? { modules: structure.modules.map((module) => ({
            ...module,
            settings: {
              ...structure.modules[module.order - 1]?.settings
            }
          }))}
        : {modules: current.modules.map((module) => {
            const fromModel = structure.modules.find((m) => m.type === module.type)
            return {
                ...module,
                settings: fromModel?.settings ?? module.settings,
        }
      })}),
      //! penser à changer sizeModel, weightModel, colorSelect, withPrimaryColor, textAlign directement dans le settings des datas
    }
  }