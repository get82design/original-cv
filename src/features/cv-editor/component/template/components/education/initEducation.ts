import type { EducationItemContentInput } from "@/services/schemas/cvSave.schema";
import type { EducationContentSettings } from "@/services/schemas/cvTemplate.schema";
import type { ListItem } from "@utils/type";
import { v4 as uuid } from "uuid";

const defaultSettings: EducationContentSettings = {
	diplome: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	etablissement: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	year: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	ville: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	withEtablissement: true,
	withYear: true,
	withVille: true,
	columns: 1,
};

/** Crée une expérience neuve à chaque appel (clientKey unique). */
export function createInitEducation(opts?: {
	order?: number;
	settings?: EducationContentSettings;
}): ListItem<EducationItemContentInput> {
	return {
		clientKey: "education-" + uuid(),
		order: opts?.order ?? 1,
		content: {
			title: "",
			school: "",
			degree: "",
			start: new Date(),
			end: undefined,
			city: "",
			obtained: "COMPLETED",
			settings: opts?.settings ?? defaultSettings,
		},
	};
}
