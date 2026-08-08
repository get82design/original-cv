import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema"
import type { SocialMediaItemContentInput } from "@/services/schemas/cvSave.schema"
import type { ListItem } from "@utils/type"
import type { JSX } from "react"

interface ContentSocialMediaContainerProps {
    general: TemplateLayout
    item: ListItem<SocialMediaItemContentInput>
    iconCompo: JSX.Element
    socialNetworkCompo: JSX.Element
    userNameCompo: JSX.Element
}

export const ContentSocialMediaContainer = ({ general, item, iconCompo, socialNetworkCompo, userNameCompo }: ContentSocialMediaContainerProps) => {
    return (
        <div className="w-full flex gap-2 px-2 relative items-center">
            {item.content?.settings?.withIcon && iconCompo}
            <div className="flex flex-col">
                {item.content?.settings?.withSocialNetwork && socialNetworkCompo}
                {item.content?.settings?.withUsername && userNameCompo}
            </div>
        </div>
    )
}