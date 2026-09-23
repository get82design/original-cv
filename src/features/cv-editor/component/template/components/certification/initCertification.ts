import type { CertificationItemContentInput } from "@/services/schemas/cvSave.schema";
import type { CertificationContentSettings } from "@/services/schemas/cvTemplate.schema";
import type { ListItem } from "@utils/type";
import { v4 as uuid } from "uuid";

const defaultSettings: CertificationContentSettings = {
	title: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	organismeCertification: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	withTitle: true,
	withOrganismeCertification: true,
	columns: 1,
};

export function createInitCertification(opts?: {
	order?: number;
	settings?: CertificationContentSettings;
}): ListItem<CertificationItemContentInput> {
	return {
		clientKey: `certification-${uuid()}`,
		order: opts?.order ?? 1,
		content: {
			title: "",
			organismeCertification: "",
			settings: opts?.settings ?? defaultSettings,
		},
	};
}
