import { FieldNameExperience } from "@/features/cv-editor/utils/fields/fieldNameExperience"
import type { BaseTextSettings, ExperienceContentSettings } from "@/services/schemas/cvTemplate.schema"
import { useFormContext } from "react-hook-form"
import { BsListCheck } from "react-icons/bs"
import { SectionOneContainer } from "../common-compo/section/SectionOneContainer"
import type { ExperienceItemContentInput } from "@/services/schemas/cvSave.schema"
import { TitleSection } from "../input-cv/section/TitleSection"
import { createInitExperience } from "./initExperience"
import { ExperiencesDnd } from "./compo/ExperienceDnD"
import { useSectionList } from "../../../hooks/useSectionList"

export const SectionExperienceOne = () => {
    const { watch } = useFormContext()
    const watchModelExperienceTitle: BaseTextSettings = watch(
      FieldNameExperience.settingsSectionTitle
    )

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
      <SectionOneContainer
        titleOfSectionCompo={
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
          <ExperiencesDnd
            watchExperiences={watchExperiences}
            itemSelected={itemSelected}
            setItemSelected={setItemSelected}
            createNewItem={createNewItem}
          />
        }
        nbCols={1}
      />
    )
  }
