import type { PublicationItemContentInput } from "@/services/schemas/cvSave.schema";
import type { PublicationContentSettings } from "@/services/schemas/cvTemplate.schema";
import type { ListItem } from "@utils/type";
import { v4 as uuid } from "uuid";

const defaultSettings: PublicationContentSettings = {
	title: {
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
	journalName: {
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
	url: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	withTitle: true,
	withDescription: true,
	withJournalName: true,
	withUrl: true,
	withPeriode: true,
};

export function createInitPublication(opts?: {
	order?: number;
	settings?: PublicationContentSettings;
}): ListItem<PublicationItemContentInput> {
	return {
		clientKey: `publication-${uuid()}`,
		order: opts?.order ?? 1,
		content: {
			title: "",
			journalName: "",
			description: "",
			url: "",
			start: new Date(),
			end: undefined,
			settings: opts?.settings ?? defaultSettings,
		},
	};
}
