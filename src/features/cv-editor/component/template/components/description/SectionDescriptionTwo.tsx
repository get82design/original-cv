import { useFormContext } from "react-hook-form"
import { useCreateCvContext } from "../../../context/CreateCvContext"
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral"
import { FieldNameDescription } from "@/features/cv-editor/utils/fields/fieldNameDescription"
import type { BaseTextSettings } from "@/services/schemas/cvTemplate.schema"
import { TitleSection } from "../input-cv/section/TitleSection"
import { SectionTwoContainer } from "../common-compo/section/SectionTwoContainer"
import { MdPerson } from "react-icons/md"
import { CommonListLigne } from "../common-compo/list/CommonListLigne"
import { TextareaCv } from "@/components/input-writer/input-textarea-cv/InputTextareaCv"
import { CommonPointList } from "../common-compo/list/CommonPointList"

export const SectionDescriptionTwo = () => {
    const { watch } = useFormContext()
    const { setSelectModifInput, setSelectInputForm } = useCreateCvContext()
    const watchGeneral = watch(FieldNameLayoutGeneral.layout)
    const watchWithIcon = watchGeneral?.titleSection.withIcon
    const watchListStyle = watchGeneral?.listStyle
    const watchModelDescriptionTitle: BaseTextSettings = watch(
      FieldNameDescription.settingsSectionTitle
    )
    const watchSettingsContent: BaseTextSettings = watch(
      FieldNameDescription.settingsContent
    )
  
    return (
      <SectionTwoContainer
        titleSectionCompo={
          <TitleSection
            fieldName={FieldNameDescription.settingsSectionTitle}
            name={FieldNameDescription.titleSection}
            placeholder={'Présentation'}
            watchInput={watchModelDescriptionTitle}
            icon={<MdPerson style={{ width: '16px', height: '16px' }} />}
          />
        }
        sectionCompo={
          <div className="relative flex gap-2">
            <CommonListLigne
              watchWithIcon={watchWithIcon}
              watchListStyle={watchListStyle}
              color={'gray-500'}
              className="mt-2 -mb-1"
            />
            <div className="w-full flex-1 relative -mt-3">
              <CommonPointList general={watchGeneral} />
              <TextareaCv
                name={FieldNameDescription.description}
                onClick={() => {
                  setSelectModifInput(FieldNameDescription.settingsContent)
                  setSelectInputForm('')
                }}
                placeholder="Laissez une petite description de vous ici"
                textColor={watchSettingsContent?.colorSelect}
                textAlign={watchSettingsContent?.textAlign}
                autoResize
                dataInput={{
                  changeSize: '1px',
                  model: watchSettingsContent,
                }}
              />
            </div>
          </div>
        }
        general={watchGeneral}
        nbCols={1}
      />
    )
  }