import type { TemplateModule } from "@/services/schemas/cvTemplate.schema"
import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { MiniatureRegister as ExperienceMiniatures } from "../template/register/ExperienceRegister"
import { MiniatureRegister as DescriptionMiniatures } from "../template/register/DescriptionRegister"
import { MiniatureRegister as EducationMiniatures } from "../template/register/EducationRegister"
import { MiniatureRegister as SkillMiniatures } from "../template/register/SkillRegister"
import { MiniatureRegister as LanguageMiniatures } from "../template/register/LanguageRegister"
import { MiniatureRegister as ProjectMiniatures } from "../template/register/ProjectRegister"
import { MiniatureRegister as SocialMediaMiniatures } from "../template/register/SocialMediaRegister"

interface SectionNoUseProps {
    itemNoUse: TemplateModule[]
    addItem: (item: TemplateModule) => void
}
  
export const SectionNoUse = ({ itemNoUse, addItem }: SectionNoUseProps) => {
    return (
      <div
        className={'w-full flex flex-col gap-2'}
      >
        <div className="w-full grid grid-flow-row gap-4">
          {itemNoUse.map((item, idx) => {
            return (
              <OneSectionNoUse idx={idx} addItem={addItem} item={item} key={item.type} />
            )
          })}
        </div>
      </div>
    )
}

interface OneSectionNoUseProps {
    idx: number
    addItem: (item: TemplateModule) => void
    item: TemplateModule
}

export const OneSectionNoUse = ({ idx, addItem, item }: OneSectionNoUseProps) => {
    const {watch} = useFormContext()
    const [MiniatureComponent, setMiniatureComponent] = useState<React.ComponentType>()
    const [LabelComponent, setLabelComponent] = useState<string>()
    const watchTemplateConfig = watch('layoutGeneral.defaultStyles')
    useEffect(() => {
        if(item.type === 'experience') {
            const key = watchTemplateConfig?.components?.sectionExperience?.miniature ?? 'MiniExperienceOne'
            // console.log('key => ', key)
            setMiniatureComponent(() => ExperienceMiniatures[key] ?? ExperienceMiniatures.MiniExperienceOne)
            setLabelComponent(watchTemplateConfig?.components?.sectionExperience?.label ?? 'Expérience')
        }
        if(item.type === 'description') {
            const key = watchTemplateConfig?.components?.sectionDescription?.miniature ?? 'MiniDescriptionOne'
            // console.log('key => ', key)
            setMiniatureComponent(() => DescriptionMiniatures[key] ?? DescriptionMiniatures.MiniDescriptionOne)
            setLabelComponent(watchTemplateConfig?.components?.sectionDescription?.label ?? 'Description')
        }
        if(item.type === 'education') {
            const key = watchTemplateConfig?.components?.sectionEducation?.miniature ?? 'MiniEducationOne'
            // console.log('key => ', key)
            setMiniatureComponent(() => EducationMiniatures[key] ?? EducationMiniatures.MiniEducationOne)
            setLabelComponent(watchTemplateConfig?.components?.sectionEducation?.label ?? 'Diplôme')
        }
        if(item.type === 'skill') {
            const key = watchTemplateConfig?.components?.sectionSkill?.miniature ?? 'MiniSkillOne'
            // console.log('key => ', key)
            setMiniatureComponent(() => SkillMiniatures[key] ?? SkillMiniatures.MiniSkillOne)
            setLabelComponent(watchTemplateConfig?.components?.sectionSkill?.label ?? 'Skill')
        }
        if(item.type === 'language') {
            const key = watchTemplateConfig?.components?.sectionLanguage?.miniature ?? 'MiniLanguageOne'
            // console.log('key => ', key)
            setMiniatureComponent(() => LanguageMiniatures[key] ?? LanguageMiniatures.MiniLanguageOne)
            setLabelComponent(watchTemplateConfig?.components?.sectionLanguage?.label ?? 'Langue')
        }
        if(item.type === 'project') {
            const key = watchTemplateConfig?.components?.sectionProject?.miniature ?? 'MiniProjectOne'
            // console.log('key => ', key)
            setMiniatureComponent(() => ProjectMiniatures[key] ?? ProjectMiniatures.MiniProjectOne)
            setLabelComponent(watchTemplateConfig?.components?.sectionProject?.label ?? 'Projet')
        }
        if(item.type === 'socialMedia') {
            const key = watchTemplateConfig?.components?.sectionSocialMedia?.miniature ?? 'MiniSocialMediaOne'
            // console.log('key => ', key)
            setMiniatureComponent(() => SocialMediaMiniatures[key] ?? SocialMediaMiniatures.MiniSocialMediaOne)
            setLabelComponent(watchTemplateConfig?.components?.sectionSocialMedia?.label ?? 'Réseau social')
        }
    }, [item, watchTemplateConfig])
    return (
      <div
        key={idx}
        className={'w-full relative group cursor-pointer'}
        onClick={() => addItem(item)}
      >
        {/* <div className="w-full text-start text-lg font-semibold py-1 group-hover:text-green-400">{LabelComponent}</div> */}
        <div className="w-full p-3 border-1 border-gray-300 group-hover:border-green-400 rounded-md">
          {MiniatureComponent && <MiniatureComponent />}
          {/* Overlay au survol */}
        <div
            className="
                pointer-events-none
                absolute inset-0 rounded-md
                flex items-center justify-center
                bg-black/0 group-hover:bg-black/50
                opacity-0 group-hover:opacity-100
                transition-all duration-300 ease-out
            "
        >
            <span className="text-white text-lg font-semibold px-2 text-center
                translate-y-2 opacity-0
                group-hover:translate-y-0 group-hover:opacity-100
                transition-all duration-300 ease-out delay-75">
            {LabelComponent}
            </span>
        </div>
        </div>
      </div>
    )
}