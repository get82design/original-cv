import { FieldNameSkill } from "@/features/cv-editor/utils/fields/fieldNameSkill"
import type { BaseTextSettings, SkillContentSettings } from "@/services/schemas/cvTemplate.schema"
import { useFormContext } from "react-hook-form"
import type { SkillGroupItemContentInput } from "@/services/schemas/cvSave.schema"
import { SectionOneContainer } from "../common-compo/section/SectionOneContainer"
import { TitleSection } from "../input-cv/section/TitleSection"
import { MdTag } from "react-icons/md"
import { createInitSkill } from "./initSkill"
import { SkillGroupDnd } from "./compo/SkillGroupDnd"
import { useSectionList } from "../../../hooks/useSectionList"

export const SectionSkillOne = () => {
    const { watch } = useFormContext()
    const watchModelSkillTitle: BaseTextSettings = watch(
        FieldNameSkill.settingsSectionTitle
    )

    const {
      items: watchSkills,
      itemSelected,
      setItemSelected,
      createNewItem,
    } = useSectionList<SkillGroupItemContentInput, SkillContentSettings>({
      contentField: FieldNameSkill.content,
      moduleType: "skill",
      createInit: createInitSkill,
    })
    
    return (
      <SectionOneContainer
        titleOfSectionCompo={
          <TitleSection
            fieldName={FieldNameSkill.settingsSectionTitle}
            name={FieldNameSkill.titleSection}
            placeholder={'Skill'}
            watchInput={watchModelSkillTitle}
            icon={<MdTag style={{ width: '16px', height: '16px' }} />}
            setSectionSelected={setItemSelected}
          />
        }
        sectionCompo={
          <SkillGroupDnd
            watchSkills={watchSkills}
            itemSelected={itemSelected}
            setItemSelected={setItemSelected}
            createNewItem={createNewItem}
            colOfSkill={4}
          />
        }
        // nbCols={watchSkills?.length >= 2
        //   ? 2
        //   : 1}
        nbCols={1}
      />
    )
  }