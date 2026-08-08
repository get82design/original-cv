import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";
import type { JSX } from "react";
import { ChangeSpaceDocumentApercu } from "../../../../../utils/utilsCv/marge";

interface HeaderContentProps {
    modelGeneral: TemplateLayout
    titleCompo: JSX.Element,
    subTitleCompo: JSX.Element,
    emailCompo: JSX.Element,
    phoneCompo: JSX.Element,
    locationCompo: JSX.Element,
    photo: JSX.Element
  }
  
  export const HeaderOneContainer = ({
    modelGeneral,
    titleCompo,
    subTitleCompo,
    emailCompo,
    phoneCompo,
    locationCompo,
    photo
  }: HeaderContentProps) => {
    return (
      <div className={`w-full flex flex-col gap-3 px-1 ${ChangeSpaceDocumentApercu(modelGeneral?.space)}`}>
        <div className="w-full flex gap-4">
          {modelGeneral?.withPhoto && (
            // <Image
            //   alt=""
            //   src={photo && photo !== '' ? photo : "/assets/img/User-avatar.svg.png"}
            //   width="130"
            //   height="130"
            //   imageClassName={
            //     modelGeneral.stylePhoto && modelGeneral.stylePhoto === 'circle'
            //       ? 'rounded-full'
            //       : 'rounded'
            //   }
            // />
            photo
          )}
          <div className="header-content w-full flex flex-col gap-3">
            {titleCompo}
            {subTitleCompo}
            <div className="w-full grid grid-cols-3">
              {emailCompo}
              {phoneCompo}
              {locationCompo}
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-400 my-2" style={{ height: '1px' }} />
      </div>
    )
  }