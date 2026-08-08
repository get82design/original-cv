import { MdLanguage } from "react-icons/md"
import { SectionOneContainer } from "../common-compo/section/SectionOneContainer"
import { TitleSection } from "../input-cv/section/TitleSection"
import { FieldNameLanguage } from "@/features/cv-editor/utils/fields/fieldNameLanguage"
import { useFormContext } from "react-hook-form"
import { LanguageDnd } from "./compo/LanguageDnd"
import type { BaseTextSettings, LanguageContentSettings } from "@/services/schemas/cvTemplate.schema"
import type { LanguageItemContentInput } from "@/services/schemas/cvSave.schema"
import { createInitLanguage } from "./initLanguage"
import { useSectionList } from "../../../hooks/useSectionList"

export const SectionLanguageOne = () => {
    const { watch } = useFormContext()
    const watchModelLanguageTitle: BaseTextSettings = watch(
      FieldNameLanguage.settingsSectionTitle
    )

    const {
        items: watchLanguages,
        itemSelected,
        setItemSelected,
        createNewItem,
      } = useSectionList<LanguageItemContentInput, LanguageContentSettings>({
        contentField: FieldNameLanguage.content,
        moduleType: "language",
        createInit: createInitLanguage,
      })
    
    return (
        <SectionOneContainer
            titleOfSectionCompo={
                <TitleSection
                    fieldName={FieldNameLanguage.settingsSectionTitle}
                    name={FieldNameLanguage.titleSection}
                    placeholder={'Langues'}
                    watchInput={watchModelLanguageTitle}
                    icon={<MdLanguage style={{ width: '16px', height: '16px' }} />}
                    setSectionSelected={setItemSelected}
                />
            }
            sectionCompo={
                <LanguageDnd
                    watchLanguages={watchLanguages}
                    itemSelected={itemSelected}
                    setItemSelected={setItemSelected}
                    createNewItem={createNewItem}
                    colOfLanguage={4}
                />
            }
            nbCols={1}
        />
    )
}