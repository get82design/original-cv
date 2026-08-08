import { useFormContext } from "react-hook-form"
import type { SkillGroupItemContentInput } from "@/services/schemas/cvSave.schema"
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral"
import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv"
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField"
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext"
import { ContentSkillGroupContainer } from "./ContentSkillGroupContainer"
import { SkillDnd } from "./SkillDnd"
import { useRef, type JSX } from "react"
import { FieldNameSkill } from "@/features/cv-editor/utils/fields/fieldNameSkill"
import { CommonListLigne } from "../../common-compo/list/CommonListLigne"
import { Menu } from "primereact/menu"
import type { ListItem } from "@utils/type"
import { SectionItemShell } from "../../common-compo/section/SectionItemShell"

interface SkillGroupElementProps {
    index: number
    item: ListItem<SkillGroupItemContentInput>
    itemSelected: string
    setItemSelected: (e: string) => void
    itemsMenu: (idx: number) => {
      label: string
      items: {
          template: JSX.Element
      }[]
    }[]
    colOfSkill: number
}

export const SkillGroupElement = ({ 
    index, 
    item, 
    itemSelected, 
    setItemSelected, 
    itemsMenu, 
    colOfSkill
}: SkillGroupElementProps) => {
    const { setSelectModifInput, setSelectInputForm }
      = useCreateCvContext()
    const { watch, getValues, setValue } = useFormContext();
    const watchGeneral = watch(FieldNameLayoutGeneral.layout);
    const pathContent = dataFieldContent('datas.skillGroup.content', index, 'content')
    const watchWithIcon = watchGeneral?.titleSection.withIcon
    const watchListStyle = watchGeneral?.listStyle
    const menuLeft = useRef<Menu>(null)
    
    const watchModelTitleOfGroup = watch(
        `${pathContent}.settings.groupTitle`
      )

    const deleteGroup = (itemToDelete: ListItem<SkillGroupItemContentInput>) => {
        const list = (getValues(FieldNameSkill.content) ?? []) as ListItem<SkillGroupItemContentInput>[]
        
        const newList = list
            .filter((entry) => entry.clientKey !== itemToDelete.clientKey)
            .map((entry, i) => ({ ...entry, order: i + 1 }))
        
            setValue(FieldNameSkill.content, newList, {
            shouldDirty: true,
            shouldTouch: true,
        })
        
        // sélection : groupe lui-même OU un skill de ce groupe
        const deletedSkillKeys = new Set(
            (itemToDelete.content?.skills ?? []).map((s) => s.clientKey)
        )
        const selectionWasInGroup =
            itemSelected === itemToDelete.clientKey ||
            deletedSkillKeys.has(itemSelected)
        
            if (selectionWasInGroup) {
            setItemSelected(newList[0]?.clientKey ?? '')
        }
    }

    return (
        <SectionItemShell
            clientKey={item.clientKey}
            sectionId="skill"                    // → section-skill (comme aujourd'hui)
            containerId="skillGroup"             // important pour OneColumnModel
            path={FieldNameSkill.content}
            sortableType="card"
            sortableData={{
                skillsPath: `datas.skillGroup.content.${index}.content.skills`,
            }}
            itemSelected={itemSelected}
            setItemSelected={setItemSelected}
            modifMatch="skill"                   // paths contiennent skillGroup → ok
            className="flex gap-2"
            leading={
                <CommonListLigne
                    watchWithIcon={watchWithIcon}
                    watchListStyle={watchListStyle}
                    color="gray-500"
                />
            }
            onDelete={() => deleteGroup(item)}
            toolbarExtra={
                itemsMenu ? (
                <>
                    <div
                        className="p-2 cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation()
                            menuLeft.current?.toggle(e)
                        }}
                    >
                        options
                    </div>
                    <Menu
                        model={itemsMenu(index)}
                        popup
                        ref={menuLeft}
                        style={{ width: 300 }}
                    />
                </>
                ) : null
            }
        >
            <ContentSkillGroupContainer
                general={watchGeneral}
                item={item}
                titleGroupCompo={
                    <InputTextCv
                        placeholder="Nom du group de skill"
                        onClick={() => {
                            setSelectModifInput(`${pathContent}.settings.groupTitle`)
                            setSelectInputForm(`${pathContent}.settings.withGroupTitle`)
                        }}
                        name={`${pathContent}.title`}
                        textColor={watchModelTitleOfGroup?.colorSelect}
                        dataInput={{
                            changeSize: '2px',
                            model: watchModelTitleOfGroup,
                        }}
                        textAlign={'left'}
                    />
                }
                skillsCompo={
                    <SkillDnd 
                        skills={item?.content?.skills as ListItem<unknown>[]} 
                        groupIndex={index} 
                        setItemSelected={setItemSelected}
                        itemSelected={itemSelected}
                        clientKeyGroup={item.clientKey}
                        colOfSkill={colOfSkill}
                    />
                }
            />
        </SectionItemShell>
    )
}