import type { CvFormValues } from "@/services/schemas/cvSave.schema";

export const formCvDefaultValue: CvFormValues = {
	templateId: "",
	title: "",
	photo: null,
	layoutGeneral: undefined,
	datas: {},
	modules: [],
};
