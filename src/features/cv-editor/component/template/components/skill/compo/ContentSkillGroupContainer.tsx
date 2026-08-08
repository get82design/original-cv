import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema"
import type { SkillGroupItemContentInput, SkillItemContentInput } from "@/services/schemas/cvSave.schema"
import type { JSX } from "react"
import { CommonPointList } from "../../common-compo/list/CommonPointList"
import type { ListItem } from "@utils/type"

interface ContentSkillGroupContainerProps {
    general: TemplateLayout
    item: ListItem<SkillGroupItemContentInput>
    titleGroupCompo: JSX.Element
    skillsCompo: JSX.Element
  }
  
  export const ContentSkillGroupContainer = ({
    general,
    item,
    titleGroupCompo,
    skillsCompo,
  }: ContentSkillGroupContainerProps) => {
    return (
        <div className="w-full flex flex-col gap-1 pb-1 mt-2">
            <div className="w-full flex justify-between items-center relative -mb-2">
                <CommonPointList general={general} />
                <div className="w-4/5">{item?.content?.settings?.withGroupTitle && titleGroupCompo}</div>
            </div>
            <div className="w-full flex flex-col gap-0">
                {skillsCompo}
            </div>
        </div>
    )
}