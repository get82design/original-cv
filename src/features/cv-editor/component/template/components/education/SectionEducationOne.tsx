import { FieldNameEducation } from "@/features/cv-editor/utils/fields/fieldNameEducation"
import type { BaseTextSettings, EducationContentSettings } from "@/services/schemas/cvTemplate.schema"
import { useFormContext } from "react-hook-form"
import type { EducationItemContentInput } from "@/services/schemas/cvSave.schema"
import { SectionOneContainer } from "../common-compo/section/SectionOneContainer"
import { TitleSection } from "../input-cv/section/TitleSection"
import { MdSchool } from "react-icons/md"
import { createInitEducation } from "./initEducation"
import { EducationDnd } from "./compo/EducationDnd"
import { useSectionList } from "../../../hooks/useSectionList"

export const SectionEducationOne = () => {
    const { watch } = useFormContext()
    const watchModelEducationTitle: BaseTextSettings = watch(
      FieldNameEducation.settingsSectionTitle
    )

    const {
      items: watchEducations,
      itemSelected,
      setItemSelected,
      createNewItem,
    } = useSectionList<EducationItemContentInput, EducationContentSettings>({
      contentField: FieldNameEducation.content,
      moduleType: "education",
      createInit: createInitEducation,
    })

    return (
      <SectionOneContainer
        titleOfSectionCompo={
          <TitleSection
            fieldName={FieldNameEducation.settingsSectionTitle}
            name={FieldNameEducation.titleSection}
            placeholder={'Education'}
            watchInput={watchModelEducationTitle}
            icon={<MdSchool style={{ width: '16px', height: '16px' }} />}
            setSectionSelected={setItemSelected}
          />
        }
        sectionCompo={
          <EducationDnd
            watchEducations={watchEducations}
            itemSelected={itemSelected}
            setItemSelected={setItemSelected}
            createNewItem={createNewItem}
          />
        }
        nbCols={1}
      />
    )
  }