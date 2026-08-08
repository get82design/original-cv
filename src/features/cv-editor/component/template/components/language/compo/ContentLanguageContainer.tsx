import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema"
import type { ListItem } from "@utils/type"
import type { JSX } from "react"

interface ContentLanguageContainerProps {
    general: TemplateLayout
    item: ListItem<unknown>
    nameCompo: JSX.Element
    levelCompo: JSX.Element
}

export const ContentLanguageContainer = ({ general, item, nameCompo, levelCompo }: ContentLanguageContainerProps) => {
    return (
        <div className="w-1/4 flex justify-between items-center gap-2 px-2 relative mt-2 mr-2">
            <div className="min-w-[90px]">
                {nameCompo}
            </div>
            {levelCompo}
        </div>
    )
}