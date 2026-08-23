import type { VolunteeringItemContentInput } from "@/services/schemas/cvSave.schema";
import type { VolunteeringContentSettings } from "@/services/schemas/cvTemplate.schema";
import type { ListItem } from "@utils/type";
import { v4 as uuid } from "uuid";

const defaultSettings: VolunteeringContentSettings = {
	title: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	organisation: {
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
	missions: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	withTitle: true,
	withOrganisation: true,
	withDescription: true,
	withPeriode: true,
	withLocation: true,
	withMissions: true,
};

export function createInitVolunteering(opts?: {
	order?: number;
	settings?: VolunteeringContentSettings;
}): ListItem<VolunteeringItemContentInput> {
	return {
		clientKey: "volunteering-" + uuid(),
		order: opts?.order ?? 1,
		content: {
			title: "",
			organisation: "",
			description: "",
			start: new Date(),
			end: undefined,
			location: "",
			missions: [],
			settings: opts?.settings ?? defaultSettings,
		},
	};
}
