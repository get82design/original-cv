import { ChangePaddingDocument } from "@/features/cv-editor/utils/utilsCv/marge";
import { 
    closestCenter,
    DndContext, 
    PointerSensor, 
    pointerWithin, 
    useSensor, 
    useSensors, 
    type CollisionDetection, 
    type DragEndEvent, 
    type DragOverEvent 
} from "@dnd-kit/core"
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { HeaderRegister } from "../../template/register/HeaderRegister";
import { SkillRegister } from "../../template/register/SkillRegister";
import { EducationRegister } from "../../template/register/EducationRegister";
import { ExperienceRegister } from "../../template/register/ExperienceRegister";
import { DescriptionRegister } from "../../template/register/DescriptionRegister";
import { useCreateCvContext } from "../../context/CreateCvContext";
import { SectionSortableContext } from "./SectionSortableContext";
import type { CvModulesInput } from "@/services/schemas/cvSave.schema";
import type { ItemGeneralProps } from "@utils/type";
import { LanguageRegister } from "../../template/register/LanguageRegister";
import { LanguageSectionMenu } from "../../template/components/language/compo/LanguageSectionMenu";
import { ProjectRegister } from "../../template/register/ProjectRegister";
import { SocialMediaRegister } from "../../template/register/SocialMediaRegister";

export const OneColumnModel = ({ deleteSection }: { deleteSection: (item: ItemGeneralProps) => void }) => {
    const paddingDoc = ChangePaddingDocument()
    const refTaille = useRef<HTMLDivElement>(null)

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: { distance: 6 }, // drag après 6px
      }));

    const [HeaderComponent, setHeaderComponent] = useState<React.ComponentType>()

    const {watch, setValue, getValues} = useFormContext()
    const watchTemplateConfig = watch('layoutGeneral.defaultStyles')
    const watchModules = watch('modules')

    const {
        // setListItemsUse,
        // setListItemsNoUse,
        // listItemsUse,
        // sectionSelected,
        setSectionSelected,
      } = useCreateCvContext()

    useEffect(() => {
        const key  = watchTemplateConfig?.components?.sectionHeader ?? 'HeaderOne'
        setHeaderComponent(() => HeaderRegister[key] ?? HeaderRegister.HeaderOne)
    }, [watchTemplateConfig?.components?.sectionHeader])

    const itemUse = useMemo(() => {
        if (!watchModules) return []
        const items: any[] = []
            for (const mod of watchModules) {
          if (!mod.isActive) continue
          if (mod.type === 'experience') {
            const key = watchTemplateConfig?.components?.sectionExperience?.component ?? 'SectionExperienceOne'
            items.push({ id: 'section-experience', order: mod.order, content: ExperienceRegister[key] ?? ExperienceRegister.SectionExperienceOne })
          }
          if (mod.type === 'description') {
            const key = watchTemplateConfig?.components?.sectionDescription?.component ?? 'SectionDescriptionOne'
            items.push({ id: 'section-description', order: mod.order, content: DescriptionRegister[key] ?? DescriptionRegister.SectionDescriptionOne })
          }
          if (mod.type === 'education') {
            const key = watchTemplateConfig?.components?.sectionEducation?.component ?? 'SectionEducationOne'
            items.push({ id: 'section-education', order: mod.order, content: EducationRegister[key] ?? EducationRegister.SectionEducationOne })
          }
          if (mod.type === 'skill') {
            const key = watchTemplateConfig?.components?.sectionSkill?.component ?? 'SectionSkillOne'
            items.push({ id: 'section-skill', order: mod.order, content: SkillRegister[key] ?? SkillRegister.SectionSkillOne })
          }
          if (mod.type === 'language') {
            const key = watchTemplateConfig?.components?.sectionLanguage?.component ?? 'SectionLanguageOne'
            items.push({ 
                id: 'section-language', 
                order: mod.order, 
                content: LanguageRegister[key] ?? LanguageRegister.SectionLanguageOne,
                sectionMenu: <LanguageSectionMenu />
            })
          }
          if (mod.type === 'project') {
            const key = watchTemplateConfig?.components?.sectionProject?.component ?? 'SectionProjectOne'
            items.push({ id: 'section-project', order: mod.order, content: ProjectRegister[key] ?? ProjectRegister.SectionProjectOne })
          }
          if (mod.type === 'socialMedia') {
            const key = watchTemplateConfig?.components?.sectionSocialMedia?.component ?? 'SectionSocialMediaOne'
            items.push({ id: 'section-socialMedia', order: mod.order, content: SocialMediaRegister[key] ?? SocialMediaRegister.SectionSocialMediaOne })
          }
        }
        return items.sort((a, b) => a.order - b.order)
    }, [watchModules, watchTemplateConfig])

    const reorderByClientKey = (
        path: string,
        activeId: string | number,
        overId: string | number,
      ) => {
        const list = (getValues(path) ?? []) as Array<{ clientKey: string; order?: number }>
        const oldIndex = list.findIndex((i) => i.clientKey === String(activeId))
        const newIndex = list.findIndex((i) => i.clientKey === String(overId))
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return
        setValue(
          path,
          arrayMove(list, oldIndex, newIndex).map((item, index) => ({
            ...item,
            order: index + 1,
          })),
          { shouldDirty: true },
        )
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const activeData = active.data.current
        const overData = over.data.current

        if (!activeData) return

        // ——— Niveau 1 : sections ———
        if (activeData.type === 'section') {
            const sorted = [...itemUse]
            const oldIndex = sorted.findIndex((i) => i.id === active.id)
            const newIndex = sorted.findIndex((i) => i.id === over.id)

            if (oldIndex === -1 || newIndex === -1) return
            
            const reordered = arrayMove(sorted, oldIndex, newIndex)
            const orderByType = Object.fromEntries(
                reordered.map((item, index) => [item.id.replace('section-', ''), index + 1])
            )

            setValue(
                'modules',
                watchModules.map((mod: CvModulesInput) =>
                    orderByType[mod.type] != null ? { ...mod, order: orderByType[mod.type] } : mod
                )
            )
            return
        }
        // ——— Niveau 2 : cards (même conteneur) ———
        if (activeData.type === 'card') {
            if (
                overData?.type !== 'card' ||
                overData.containerId !== activeData.containerId
            ) {
                console.warn('drop ignoré, over =', over.id, overData)
                return
            }

            const path = activeData.path as string
            const list = (getValues(path) ?? []) as Array<{ clientKey: string; order?: number }>

            const oldIndex = list.findIndex((i) => i.clientKey === String(active.id))
            const newIndex = list.findIndex((i) => i.clientKey === String(over.id))
            if (oldIndex === -1 || newIndex === -1) return
            
            setValue(
                path,
                arrayMove(list, oldIndex, newIndex).map((item, index) => ({
                    ...item,
                    order: index + 1,
                })),
                { shouldDirty: true },
            )
            return
        }
        // // ——— Niveau 2 : cards education ———
        // if (activeData.type === 'card' && activeData.containerId === 'education') {
        //     // on ne reorder que si on drop sur une autre card du même conteneur
        //     if (overData?.type !== 'card' || overData.containerId !== 'education') {
        //         console.warn('drop ignoré, over =', over.id, overData)
        //         return
        //     }

        //     const path = activeData.path as string // FieldNameEducation.content
        //     const list = getValues(path) as Array<{ clientKey: string; order?: number }>

        //     const oldIndex = list.findIndex((i) => i.clientKey === String(active.id))
        //     const newIndex = list.findIndex((i) => i.clientKey === String(over.id))
        //     if (oldIndex === -1 || newIndex === -1) return

        //     const reordered = arrayMove(list, oldIndex, newIndex).map((item, index) => ({
        //         ...item,
        //         order: index + 1,
        //     }))
        //     setValue(path, reordered, { shouldDirty: true })
        // }
        // // ——— Niveau 2 : cards experience ———
        // if (activeData.type === 'card' && activeData.containerId === 'experience') {
        //     // on ne reorder que si on drop sur une autre card du même conteneur
        //     if (overData?.type !== 'card' || overData.containerId !== 'experience') {
        //         console.warn('drop ignoré, over =', over.id, overData)
        //         return
        //     }

        //     const path = activeData.path as string // FieldNameExperience.content
        //     const list = getValues(path) as Array<{ clientKey: string; order?: number }>

        //     const oldIndex = list.findIndex((i) => i.clientKey === String(active.id))
        //     const newIndex = list.findIndex((i) => i.clientKey === String(over.id))
        //     if (oldIndex === -1 || newIndex === -1) return

        //     const reordered = arrayMove(list, oldIndex, newIndex).map((item, index) => ({
        //         ...item,
        //         order: index + 1,
        //     }))
        //     setValue(path, reordered, { shouldDirty: true })
        // }
        // // ——— Niveau 2 : cards language ———
        // if (activeData.type === 'card' && activeData.containerId === 'language') {
        //     // on ne reorder que si on drop sur une autre card du même conteneur
        //     if (overData?.type !== 'card' || overData.containerId !== 'language') {
        //         console.warn('drop ignoré, over =', over.id, overData)
        //         return
        //     }

        //     const path = activeData.path as string // FieldNameLanguage.content
        //     const list = getValues(path) as Array<{ clientKey: string; order?: number }>

        //     const oldIndex = list.findIndex((i) => i.clientKey === String(active.id))
        //     const newIndex = list.findIndex((i) => i.clientKey === String(over.id))
        //     if (oldIndex === -1 || newIndex === -1) return

        //     const reordered = arrayMove(list, oldIndex, newIndex).map((item, index) => ({
        //         ...item,
        //         order: index + 1,
        //     }))
        //     setValue(path, reordered, { shouldDirty: true })
        // }
        // // ——— Niveau 2 : cards skillGroup ———
        // if (activeData.type === 'card' && activeData.containerId === 'skillGroup') {
        //     // on ne reorder que si on drop sur une autre card du même conteneur
        //     if (overData?.type !== 'card' || overData.containerId !== 'skillGroup') {
        //         console.warn('drop ignoré, over =', over.id, overData)
        //         return
        //     }

        //     const path = activeData.path as string // FieldNameSkill.content
        //     const list = getValues(path) as Array<{ clientKey: string; order?: number }>

        //     const oldIndex = list.findIndex((i) => i.clientKey === String(active.id))
        //     const newIndex = list.findIndex((i) => i.clientKey === String(over.id))
        //     if (oldIndex === -1 || newIndex === -1) return

        //     const reordered = arrayMove(list, oldIndex, newIndex).map((item, index) => ({
        //         ...item,
        //         order: index + 1,
        //     }))
        //     setValue(path, reordered, { shouldDirty: true })
        // }
        // ——— Niveau 3 : skills (subcard) ———
        if (activeData.type === 'subcard') {
            if (overData?.type !== 'subcard') return
            if (activeData.containerId !== overData.containerId) return
            reorderByClientKey(activeData.path as string, active.id, over.id)
            return
        }
        // if (activeData.type === 'subcard') {
        //     // drop sur un autre skill
        //     if (overData?.type !== 'subcard') return

        //     // même groupe uniquement ici (le cross est dans dragOver)
        //     if (activeData.containerId !== overData.containerId) return

        //     const path = activeData.path as string
        //     const list = getValues(path) as Array<{ clientKey: string; order?: number }>
        //     if (!list) return

        //     const oldIndex = list.findIndex((i) => i.clientKey === String(active.id))
        //     const newIndex = list.findIndex((i) => i.clientKey === String(over.id))
        //     if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return
            
        //     const reordered = arrayMove(list, oldIndex, newIndex).map((item, index) => ({
        //         ...item,
        //         order: index + 1,
        //     }))
        //     setValue(path, reordered, { shouldDirty: true })
        //     return
        // }
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const activeData = active.data.current
        const overData = over.data.current
        if (!activeData || !overData) return
        if (activeData.type !== 'subcard') return

        const activeContainer = activeData.containerId as string
        const activePath = activeData.path as string

        let overContainer: string
        let overPath: string
        let insertIndex: number

        if (overData.type === 'subcard') {
            // drop sur un skill d'un autre groupe
            overContainer = overData.containerId as string
            overPath = overData.path as string
            if (activeContainer === overContainer) return

            const overList = [...(getValues(overPath) ?? [])]
            const overIndex = overList.findIndex((i) => i.clientKey === String(over.id))
            insertIndex = overIndex === -1 ? overList.length : overIndex
        } else if (overData.type === 'card' && overData.containerId === 'skillGroup') {
            // drop sur le groupe lui-même (vide ou zone libre)
            overContainer = String(over.id) // clientKey du groupe
            if (activeContainer === overContainer) return

            // préférer skillsPath si tu l'as mis dans data
            overPath =
              (overData.skillsPath as string) ??
              (() => {
                const groups = getValues('datas.skillGroup.content') ?? []
                const gi = groups.findIndex((g: any) => g.clientKey === String(over.id))
                return gi === -1 ? null : `datas.skillGroup.content.${gi}.content.skills`
              })()
            if (!overPath) return
            insertIndex = (getValues(overPath) ?? []).length // à la fin
        } else {
            return
        }

        const activeList = [...(getValues(activePath) ?? [])]
        const overList = [...(getValues(overPath) ?? [])]

        const activeIndex = activeList.findIndex((i) => i.clientKey === String(active.id))
        if (activeIndex === -1) return
        
        // déjà présent dans la cible (dragOver répété) → ne rien refaire
        if (overList.some((i) => i.clientKey === String(active.id))) return
        
        const [moved] = activeList.splice(activeIndex, 1)
        if (!moved) return
        overList.splice(insertIndex, 0, moved)
        
        setValue(
            activePath,
            activeList.map((item, i) => ({ ...item, order: i + 1 })),
            { shouldDirty: true },
        )
        setValue(
            overPath,
            overList.map((item, i) => ({ ...item, order: i + 1 })),
            { shouldDirty: true },
        )
    }

    const collisionDetection: CollisionDetection = (args) => {
        const activeType = args.active?.data.current?.type
        const collisions = pointerWithin(args)
        const list = collisions.length ? collisions : closestCenter(args)

        const findByType = (type: string) =>
            list.find((collision) => {
                const container = args.droppableContainers.find((c) => c.id === collision.id)
                return container?.data.current?.type === type
            })

        // On ne “voit” que les cibles du même niveau
        if (activeType === 'section') {
            const section = findByType('section')
            return section ? [section] : list
        }

        if (activeType === 'card') {
            const card = findByType('card')
            return card ? [card] : list
        }

        if (activeType === 'subcard') {
            const subcard = findByType('subcard')
            if (subcard) return [subcard]

            // fallback : drop sur un groupe de skills (y compris vide)
            const groupCard = list.find((collision) => {
                const container = args.droppableContainers.find((c) => c.id === collision.id)
                const data = container?.data.current
                return data?.type === 'card' && data?.containerId === 'skillGroup'
            })
            if (groupCard) return [groupCard]

            return list
        }

        return list
      }

    return (
        <DndContext 
            sensors={sensors} 
            collisionDetection={collisionDetection}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
        >
            <div
                //   key={idx}
                style={{
                width: '940px',
                height: '1300px',
                }}
                // id={`impression-cv-${idx + 1}`}
                className={`shadow-lg relative bg-white ${paddingDoc}`}
            >
                <div className="absolute bottom-6 right-8 z-10">
                    Test signature
                </div>
                <SortableContext 
                    items={itemUse.map(item => item.id)} 
                    strategy={verticalListSortingStrategy}
                >
                    <div ref={refTaille}>
                        {/* {idx === 0 && ( */}
                        <div onClick={() => setSectionSelected('header')}>
                            {HeaderComponent && <HeaderComponent />}
                        </div>
                        {itemUse?.sort((a, b) => a.order - b.order).map((item, index: number) => {
                            return (
                                <div 
                                    className="sections-container" 
                                    key={item.id}
                                    onClick={() => setSectionSelected(item.id)} 
                                >
                                    <SectionSortableContext 
                                        item={item} 
                                        deleteSection={deleteSection} 
                                        sectionMenu={item.sectionMenu}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </SortableContext>
            </div>
        </DndContext>
    )
}