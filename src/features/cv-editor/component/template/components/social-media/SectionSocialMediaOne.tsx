import { FieldNameSocialMedia } from "@/features/cv-editor/utils/fields/fieldNameSocialMedia"
import { SectionOneContainer } from "../common-compo/section/SectionOneContainer"
import { TitleSection } from "../input-cv/section/TitleSection"
import { FaGlobe } from "react-icons/fa"
import { useFormContext } from "react-hook-form"
import type { BaseTextSettings, SocialMediaContentSettings } from "@/services/schemas/cvTemplate.schema"
import type { SocialMediaItemContentInput } from "@/services/schemas/cvSave.schema"
import { createInitSocialMedia } from "./initSocialMedia"
import { SocialMediaDnd } from "./compo/SocialMediaDnd"
import { useSectionList } from "../../../hooks/useSectionList"

export const SectionSocialMediaOne = () => {
    const { watch } = useFormContext()
    const watchModelSocialMediaTitle: BaseTextSettings = watch(
      FieldNameSocialMedia.settingsSectionTitle
    )

    const {
        items: watchSocialMedias,
        itemSelected,
        setItemSelected,
        createNewItem,
      } = useSectionList<SocialMediaItemContentInput, SocialMediaContentSettings>({
        contentField: FieldNameSocialMedia.content,
        moduleType: "socialMedia",
        createInit: createInitSocialMedia,
      })
    
    return (
        <SectionOneContainer
            titleOfSectionCompo={
                <TitleSection
                    fieldName={FieldNameSocialMedia.settingsSectionTitle}
                    name={FieldNameSocialMedia.titleSection}
                    placeholder={'Réseaux sociaux'}
                    watchInput={watchModelSocialMediaTitle}
                    icon={<FaGlobe style={{ width: '16px', height: '16px' }} />}
                    setSectionSelected={setItemSelected}
                />
            }
            sectionCompo={
                <SocialMediaDnd
                    watchSocialMedias={watchSocialMedias}
                    itemSelected={itemSelected}
                    setItemSelected={setItemSelected}
                    createNewItem={createNewItem}
                    colOfSocialMedia={4}
                />
            }
            nbCols={1}
        />
    )
}