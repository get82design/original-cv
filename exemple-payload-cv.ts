import { CVModuleType } from "./generated/prisma/client";
import type { CvSaveInput } from "./src/services/schemas/cvSave.schema";

const cv: CvSaveInput = {
    templateId: "…",
    title: "CV Lucie",
    layoutGeneral: { marge: "lg", withPhoto: true },
    datas: {
      header: { title: "Lucie Martie", prenom: "Lucie", nom: "Martie" },
      description: {
        title: "Description",
        content: { description: "Révision…" },
      },
      experience: {
        title: "Expérience professionnelle",
        content: [
          {
            clientKey: "experience-1",
            order: 1,
            content: {
              title: "Assistant",
              company: "Deloitte",
              start: new Date("2022-01-01"),
              end: new Date("2024-02-01"),
              missions: [
                { clientKey: "m1", content: { content: "Révision…" } },
              ],
              settings: { withDescription: true, withList: true },
            },
          },
        ],
      },
    },
    modules: [
      { type: CVModuleType.description, order: 1, isActive: true, settings: {} },
      { type: CVModuleType.experience, order: 2, isActive: true, title: "Expérience professionnelle", settings: {} },
      { type: CVModuleType.project, order: 3, isActive: false, settings: {} },
    ],
  }