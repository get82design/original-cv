import { FieldNameExperience } from "@/features/cv-editor/utils/fields/fieldNameExperience"
import type { ExperienceItemContentInput } from "@/services/schemas/cvSave.schema"
import type { BaseTextSettings, ExperienceContentSettings } from "@/services/schemas/cvTemplate.schema"
import { useFormContext } from "react-hook-form"
import { createInitExperience} from "./initExperience"
import { BsListCheck } from "react-icons/bs"
import { ExperiencesDnd } from "./compo/ExperienceDnD"
import { TitleSection } from "../input-cv/section/TitleSection"
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral"
import { SectionTwoContainer } from "../common-compo/section/SectionTwoContainer"
import { useSectionList } from "../../../hooks/useSectionList"

export const SectionExperienceTwo = () => {
    const { watch } = useFormContext()
    const watchModelExperienceTitle: BaseTextSettings = watch(
      FieldNameExperience.settingsSectionTitle
    )
    
    const watchGeneral = watch(FieldNameLayoutGeneral.layout)

    const {
      items: watchExperiences,
      itemSelected,
      setItemSelected,
      createNewItem,
    } = useSectionList<ExperienceItemContentInput, ExperienceContentSettings>({
      contentField: FieldNameExperience.content,
      moduleType: "experience",
      createInit: createInitExperience,
    })
  
    return (
      <SectionTwoContainer
        general={watchGeneral}
        titleSectionCompo={
          <TitleSection
            fieldName={FieldNameExperience.settingsSectionTitle}
            name={FieldNameExperience.titleSection}
            placeholder={'Expérience'}
            watchInput={watchModelExperienceTitle}
            icon={<BsListCheck style={{ width: '16px', height: '16px' }} />}
            setSectionSelected={setItemSelected}
          />
        }
        sectionCompo={
          <div className="-mt-5">
            <ExperiencesDnd
              watchExperiences={watchExperiences}
              itemSelected={itemSelected}
              setItemSelected={setItemSelected}
              createNewItem={createNewItem}
            />
          </div>
        }
        nbCols={1}
      />
    )
  }