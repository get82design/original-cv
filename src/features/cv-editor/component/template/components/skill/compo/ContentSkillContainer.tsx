import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema"
import type { ListItem } from "@utils/type"
import type { JSX } from "react"

interface ContentSkillContainerProps {
    general: TemplateLayout
    item: ListItem<unknown>
    skillCompo: JSX.Element
    levelCompo: JSX.Element
}

export const ContentSkillContainer = ({ general, item, skillCompo, levelCompo }: ContentSkillContainerProps) => {
    return (
        <div className="w-1/4 flex justify-between items-center gap-2 px-2 relative mt-2 mr-2">
            <div className="min-w-[90px]">
                {skillCompo}
            </div>
            {levelCompo}
        </div>
    )
}