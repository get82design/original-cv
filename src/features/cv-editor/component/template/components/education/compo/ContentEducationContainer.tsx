import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema"
import type { EducationItemContentInput } from "@/services/schemas/cvSave.schema"
import { CommonPointList } from "../../common-compo/list/CommonPointList"
import type { JSX } from "react"
import type { ListItem } from "@utils/type"

interface ContentEducationContainerProps {
    general: TemplateLayout
    item: ListItem<EducationItemContentInput>
    educationNameCompo: JSX.Element
    educationYearCompo: JSX.Element
    educationEtablissementCompo: JSX.Element
    educationVilleCompo: JSX.Element
  }
  
  export const ContentEducationContainer = ({
    general,
    item,
    educationNameCompo,
    educationYearCompo,
    educationEtablissementCompo,
    educationVilleCompo,
  }: ContentEducationContainerProps) => {
    return (
      <div className="w-full flex flex-col gap-0 pb-1 mt-2">
        <div className="w-full flex justify-between items-center relative -mb-2">
          <CommonPointList general={general} />
          <div className="w-4/5">{educationNameCompo}</div>
          <div className="w=1/5">{item?.content?.settings?.withYear && educationYearCompo}</div>
        </div>
        <div className="flex gap-1 items-end">
          {item?.content?.settings?.withEtablissement && educationEtablissementCompo}
          {item?.content?.settings?.withVille && item?.content?.settings?.withEtablissement && <p>/</p>}
          {item?.content?.settings?.withVille && educationVilleCompo}
        </div>
      </div>
    )
  }