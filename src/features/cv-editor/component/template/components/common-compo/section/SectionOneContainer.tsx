import { ChangeSpaceDocument, ChangeSpaceDocumentApercu } from "@/features/cv-editor/utils/utilsCv/marge"
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema"
import type { JSX } from 'react'

interface SectionOneContainerProps {
    titleOfSectionCompo: JSX.Element,
    sectionCompo: JSX.Element,
    nbCols: number,
    modelGeneral?: TemplateLayout
  }
  
  export const SectionOneContainer = ({
    titleOfSectionCompo,
    sectionCompo,
    nbCols,
    modelGeneral
  }: SectionOneContainerProps) => {
    const gridCols = `grid-cols-${nbCols} gap-0`
    return (
      <div
        className={`w-full flex flex-col gap-0 px-1 mb-2 ${modelGeneral
          ? ChangeSpaceDocumentApercu(modelGeneral.space)
          : ChangeSpaceDocument()}`}
      >
        {titleOfSectionCompo}
        <div className={`w-full grid ${gridCols}`}>{sectionCompo}</div>
      </div>
    )
  }