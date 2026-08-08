import { GetPrimaryColor } from "@/features/cv-editor/utils/utilsCv/color"
import { ChangeSpaceDocument } from "@/features/cv-editor/utils/utilsCv/marge"
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema"
import type { JSX } from "react"

interface SectionTwoContainerProps {
    general: TemplateLayout,
    titleSectionCompo: JSX.Element,
    sectionCompo: JSX.Element
    nbCols: number
  }
  
  export const SectionTwoContainer = ({
    general,
    titleSectionCompo,
    sectionCompo,
    nbCols,
  }: SectionTwoContainerProps) => {
    const gridCols = `grid-cols-${nbCols} gap-0`
    const watchSpace = general.space
    const watchLigneDessus = general.titleSection.withLigneDessus
    const primaryColor = GetPrimaryColor()
  
    // console.log('section-two-container', watchLigneDessus, primaryColor)
    return (
      <div className={`w-full flex gap-2 relative ${ChangeSpaceDocument()}`}>
        {watchLigneDessus && (
          <div
            className={`w-full absolute ${watchSpace === 'sm'
              ? 'top-0'
              : watchSpace === 'lg'
                ? 'top-2'
                : 'top-1'
              }`}
            style={{ backgroundColor: `var(--${primaryColor})`, height: '1px' }}
          ></div>
        )}
        <div className="w-1/5">{titleSectionCompo}</div>
        <div className={`w-4/5 grid mt-4 ${gridCols}`}>{sectionCompo}</div>
      </div>
    )
  }