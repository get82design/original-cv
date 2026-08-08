import { v4 as uuid } from 'uuid';
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext"
import { SkillElement } from "./SkillElement"
import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable"
import { Button } from "primereact/button"
import { useFormContext } from "react-hook-form";
import type { ListItem } from '@utils/type';

interface SkillDndProps {
    skills: ListItem<unknown>[]
    groupIndex: number
    setItemSelected: (e: string) => void
    itemSelected: string
    clientKeyGroup: string
    colOfSkill: number
}

export const SkillDnd = ({ 
    skills, 
    groupIndex, 
    setItemSelected, 
    itemSelected, 
    clientKeyGroup,
    colOfSkill
}: SkillDndProps) => {
    const { sectionSelected, setSectionSelected } = useCreateCvContext()
    const createNewItem = () => {
        return { 
            clientKey: 'skill-' + uuid(), 
            order: skills.length + 1, 
            content: { name: '', level: 'Débutant' } }
    }

    const isThisGroupActive =
        itemSelected === clientKeyGroup ||
        skills.some((s) => s.clientKey === itemSelected)
        
    const showAddSkill =
        sectionSelected === 'section-skill' && isThisGroupActive

    return (
        <SortableContext items={skills.map(s => s.clientKey)} strategy={horizontalListSortingStrategy }>
            {colOfSkill === 4 && <div className={`skill-dnd-grid grid grid-cols-4 gap-x-2 gap-y-0 min-h-[30px]`}>
                <CompoSkillDnd
                    skills={skills}
                    groupIndex={groupIndex}
                    itemSelected={itemSelected}
                    setItemSelected={setItemSelected}
                    setSectionSelected={setSectionSelected}
                    clientKeyGroup={clientKeyGroup}
                    showAddSkill={showAddSkill}
                    createNewItem={createNewItem}
                />
            </div>}
            {colOfSkill === 3 && <div className={`skill-dnd-grid grid grid-cols-3 gap-x-2 gap-y-0 min-h-[30px]`}>
                <CompoSkillDnd
                    skills={skills}
                    groupIndex={groupIndex}
                    itemSelected={itemSelected}
                    setItemSelected={setItemSelected}
                    setSectionSelected={setSectionSelected}
                    clientKeyGroup={clientKeyGroup}
                    showAddSkill={showAddSkill}
                    createNewItem={createNewItem}
                />
            </div>}
        </SortableContext>
    )
}

interface CompoSkillDndProps {
    skills: ListItem<unknown>[]
    groupIndex: number
    itemSelected: string
    setItemSelected: (e: string) => void
    setSectionSelected: (e: string) => void
    clientKeyGroup: string
    showAddSkill: boolean
    createNewItem: () => ListItem<unknown>
}

export const CompoSkillDnd = ({
    skills,
    groupIndex,
    itemSelected,
    setItemSelected,
    setSectionSelected,
    clientKeyGroup,
    showAddSkill,
    createNewItem,
}: CompoSkillDndProps) => {
    const { setValue } = useFormContext()
    return (
        <>
            {skills.map((skill, index) => (
                <div
                    className="skill-card" 
                    key={skill.clientKey}
                    onClick={(e) => {
                        e.stopPropagation()
                        setItemSelected(skill.clientKey)
                        setSectionSelected('section-skill')  // global : sa section
                    }} 
                >
                    <SkillElement 
                        index={index} 
                        item={skill}  
                        groupIndex={groupIndex}
                        itemSelected={itemSelected}          // local
                        setItemSelected={setItemSelected}    // local
                        itemName={`datas.skillGroup.content.${groupIndex}.content.skills`}
                        clientKeyGroup={clientKeyGroup}
                    />
                </div>
                ))}
                {showAddSkill && <Button
                    type="button"
                    outlined
                    icon="pi pi-plus"
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation()
                        const fresh = createNewItem()
                        setValue(`datas.skillGroup.content.${groupIndex}.content.skills`, [
                            ...skills,
                            { ...fresh, order: skills.length + 1 },
                        ], { shouldDirty: true })
                    }}
                />
            }
        </>
    )
}