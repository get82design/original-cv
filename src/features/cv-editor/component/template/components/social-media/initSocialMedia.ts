import type { SocialMediaItemContentInput } from "@/services/schemas/cvSave.schema"
import type { SocialMediaContentSettings } from "@/services/schemas/cvTemplate.schema"
import type { ListItem } from "@utils/type"
import { v4 as uuid } from "uuid"

const defaultSettings: SocialMediaContentSettings = {
    socialNetwork: {
        sizeModel: '18px',
        weightModel: 600,
        colorSelect: 'primaryColor',
        sizeSelect: 'md',
        weightSelect: 'md',
        withPrimaryColor: true,
        textAlign: 'left',
    },
    username: {
        sizeModel: '18px',
        weightModel: 600,
        colorSelect: 'primaryColor',
        sizeSelect: 'md',
        weightSelect: 'md',
        withPrimaryColor: true,
        textAlign: 'left',
    },
    withSocialNetwork: true,
    withUsername: true,
    withIcon: true,
    columns: 1
}

export function createInitSocialMedia(
    opts?: {
        order?: number
        settings?: SocialMediaContentSettings
    },
): ListItem<SocialMediaItemContentInput> {
    return {
        clientKey: 'socialMedia-' + uuid(),
        order: opts?.order ?? 1,
        content: {
            socialNetwork: '',
            username: '',
            icon: '',
            settings: opts?.settings ?? defaultSettings,
        },
    }
}