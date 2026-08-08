import type { ProjectItemContentInput } from "@/services/schemas/cvSave.schema"
import type { ListItem } from "@utils/type"
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema"
import type { JSX } from "react"
import { CommonPointList } from "../../common-compo/list/CommonPointList"

interface ContentProjetContainerProps {
    item: ListItem<ProjectItemContentInput>
    general: TemplateLayout
    projetNameCompo: JSX.Element
    periodeCompo: JSX.Element
    locationCompo: JSX.Element
    descriptionCompo: JSX.Element
    technologyCompo: JSX.Element
    missionsCompo: JSX.Element
}

export const ContentProjetContainer = ({
    general,
    projetNameCompo,
    item,
    periodeCompo,
    locationCompo,
    descriptionCompo,
    technologyCompo,
    missionsCompo
}: ContentProjetContainerProps) => {
    //! PLACER TECHNOLOGY COMPO
    return (
        <div className="w-full flex flex-col gap-1 mt-2">
        <div className="w-full flex justify-between">
          <div className="flex flex-col gap-0 w-2/3 relative">
            <CommonPointList general={general} />
            {item?.content?.settings?.withTitle && projetNameCompo}
            <div className="w-full -mt-0.5">
              {item?.content?.settings?.withTechnology && technologyCompo}
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
          {item?.content?.settings?.withMissions && missionsCompo}
        </div>
      </div>
    )
}