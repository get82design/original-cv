import type { CvSaveInput } from "@/services/schemas/cvSave.schema";

export const formCvDefaultValue: CvSaveInput = {
    cvId: '0',
    templateId: '',
    title: '',
    photo: null,
    layoutGeneral: undefined,
    datas: {},
    modules: []
}