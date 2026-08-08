import type { JSX } from "react"
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema"
import type { ExperienceItemContentInput } from "@/services/schemas/cvSave.schema"
import { CommonPointList } from "../../common-compo/list/CommonPointList"
import type { ListItem } from "@utils/type"

interface ContentExperienceContainerProps {
    item: ListItem<ExperienceItemContentInput>
    general: TemplateLayout
    titleCompo: JSX.Element
    companyCompo: JSX.Element
    periodeCompo: JSX.Element
    locationCompo: JSX.Element
    descriptionCompo: JSX.Element
    listCompo: JSX.Element
  }
  
  export const ContentExperienceContainer = ({
    item,
    titleCompo,
    companyCompo,
    periodeCompo,
    locationCompo,
    descriptionCompo,
    listCompo,
    general,
  }: ContentExperienceContainerProps) => {
    // console.log('item => ', item)
    return (
      <div className="w-full flex flex-col gap-1 mt-2">
        <div className="w-full flex justify-between">
          <div className="flex flex-col gap-0 w-2/3 relative">
            <CommonPointList general={general} />
            {item?.content?.settings?.withTitle && titleCompo}
            <div className="w-full -mt-0.5">
              {item?.content?.settings?.withCompany && companyCompo}
            </div>
          </div>
          <div className="flex flex-col items-end gap-0 w-1/3">
            {item?.content?.settings?.withPeriode && periodeCompo}
            <div className="w-full flex flex-col items-end -mt-0.5">
              {item?.content?.settings?.withLocation && locationCompo}
            </div>
          </div>
        </div>
        <div className="w-full -mt-1">
            {item?.content?.settings?.withDescription && descriptionCompo}
        </div>
        <div className="w-full -mt-1">
          {item?.content?.settings?.withListMissions && listCompo}
        </div>
      </div>
    )
  }