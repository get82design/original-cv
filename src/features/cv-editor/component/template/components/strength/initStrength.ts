import type { StrengthItemContentInput } from "@/services/schemas/cvSave.schema";
import type { StrengthContentSettings } from "@/services/schemas/cvTemplate.schema";
import type { ListItem } from "@utils/type";
import { v4 as uuid } from 'uuid';

const defaultSettings: StrengthContentSettings = {
    strength: {
        sizeModel: '18px',
        weightModel: 600,
        colorSelect: 'primaryColor',
        sizeSelect: 'md',
        weightSelect: 'md',
        withPrimaryColor: true,
        textAlign: 'left',
    },
    description: {
        sizeModel: '18px',
        weightModel: 600,
        colorSelect: 'primaryColor',
        sizeSelect: 'md',
        weightSelect: 'md',
        withPrimaryColor: true,
        textAlign: 'left',
    },
    withStrength: true,
    withIcon: true,
    iconColor: 'primaryColor',
    withDescription: true,
}

export function createInitStrength(
    opts?: {
        order?: number
        settings?: StrengthContentSettings
    },
): ListItem<StrengthItemContentInput> {
    return {
        clientKey: 'strength-' + uuid(),
        order: opts?.order ?? 1,
        content: {
            title: '',
            description: '',
            icon: 'FaThumbsUp',
            settings: opts?.settings ?? defaultSettings,
        },
    }
}