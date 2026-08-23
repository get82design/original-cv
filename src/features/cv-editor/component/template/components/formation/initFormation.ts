import type { FormationItemContentInput } from "@/services/schemas/cvSave.schema";
import type { ListItem } from "@utils/type";
import type { FormationContentSettings } from "@/services/schemas/cvTemplate.schema";
import { v4 as uuid } from 'uuid';

const defaultSettings: FormationContentSettings = {
    title: {
        sizeModel: '18px',
        weightModel: 600,
        colorSelect: 'primaryColor',
        sizeSelect: 'md',
        weightSelect: 'md',
        withPrimaryColor: true,
        textAlign: 'left',
    },
    organismeFormation: {
        sizeModel: '18px',
        weightModel: 600,
        colorSelect: 'primaryColor',
        sizeSelect: 'md',
        weightSelect: 'md',
        withPrimaryColor: true,
        textAlign: 'left',
    },
    periode: {
        sizeModel: '18px',
        weightModel: 600,
        colorSelect: 'primaryColor',
        sizeSelect: 'md',
        weightSelect: 'md',
        withPrimaryColor: true,
        textAlign: 'left',
    },
    status: {
        sizeModel: '18px',
        weightModel: 600,
        colorSelect: 'primaryColor',
        sizeSelect: 'md',
        weightSelect: 'md',
        withPrimaryColor: true,
        textAlign: 'left',
    },
    withTitle: true,
    withOrganismeFormation: true,
    withPeriode: true,
    withStatus: true,
}

export function createInitFormation(
    opts?: {
        order?: number
        settings?: FormationContentSettings
    },
): ListItem<FormationItemContentInput> {
    return {
        clientKey: 'formation-' + uuid(),
        order: opts?.order ?? 1,
        content: {
            title: '',
            organismeFormation: '',
            start: new Date(),
            end: undefined,
            status: 'COMPLETED',
            settings: opts?.settings ?? defaultSettings,
        },
    }
}