import type { ExperienceItemContentInput } from "@/services/schemas/cvSave.schema";
import type { ExperienceContentSettings } from "@/services/schemas/cvTemplate.schema";
import { v4 as uuid } from "uuid";
import type { ListItem } from "@utils/type";

const defaultSettings: ExperienceContentSettings = {
	title: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	company: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	periode: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	location: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	description: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	missions: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	withDescription: true,
	withListMissions: true,
	withLocation: true,
	withPeriode: true,
	withTitle: true,
	withCompany: true,
};

/** Crée une expérience neuve à chaque appel (clientKey unique). */
export function createInitExperience(opts?: {
	order?: number;
	settings?: ExperienceContentSettings;
}): ListItem<ExperienceItemContentInput> {
	return {
		clientKey: `experience-${uuid()}`,
		order: opts?.order ?? 1,
		content: {
			title: "",
			company: "",
			start: new Date(),
			end: null,
			location: "",
			description: "",
			missions: [],
			settings: opts?.settings ?? defaultSettings,
		},
	};
}
