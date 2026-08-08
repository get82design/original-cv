import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv"
import { TextareaCv } from "@/components/input-writer/input-textarea-cv/InputTextareaCv"
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext"
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral"
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField"
import { useFormContext } from "react-hook-form"
import { ContentEducationContainer } from "./ContentEducationContainer"
import type { EducationItemContentInput } from "@/services/schemas/cvSave.schema"
import { CommonListLigne } from "../../common-compo/list/CommonListLigne"
import { useRef, type JSX } from "react"
import { Menu } from "primereact/menu"
import { FieldNameEducation } from "@/features/cv-editor/utils/fields/fieldNameEducation"
import type { ListItem } from "@utils/type"
import { SectionItemShell } from "../../common-compo/section/SectionItemShell"

interface EducationElementProps {
    index: number
    item: ListItem<EducationItemContentInput>
    itemSelected: string
    setItemSelected: (e: string) => void
    itemsMenu: (idx: number) => {
        label: string
        items: {
            template: JSX.Element
        }[]
    }[]
  }
  
  export const EducationElement = ({ 
    index, 
    item,  
    itemSelected, 
    setItemSelected, 
    itemsMenu, 
}: EducationElementProps) => {
    const { watch, setValue, getValues } = useFormContext()
    const { 
        setSelectModifInput, 
        setSelectInputForm, 
    } = useCreateCvContext()
  
    const watchGeneral = watch(FieldNameLayoutGeneral.layout)
    const pathContent = dataFieldContent('datas.education.content', index, 'content')
    const watchWithIcon = watchGeneral?.titleSection.withIcon
    const watchListStyle = watchGeneral?.listStyle
    const menuLeft = useRef<Menu>(null)
  

    const watchModelTitleOfEducation = watch(
        `${pathContent}.settings.diplome`
    )
    const watchModelSchoolOfEducation = watch(
        `${pathContent}.settings.etablissement`
    )
    const watchModelYearOfEducation = watch(
        `${pathContent}.settings.year`
    )
    const watchModelCityOfEducation = watch(
        `${pathContent}.settings.ville`
    )

    const deleteEducation = (itemToDelete: ListItem<EducationItemContentInput>) => {
        const list = (getValues(FieldNameEducation.content) ?? []) as ListItem<EducationItemContentInput>[]
            
        const newList = list
          .filter((entry) => entry.clientKey !== itemToDelete.clientKey)
          .map((entry, i) => ({ ...entry, order: i + 1 }))
        
        setValue(FieldNameEducation.content, newList, {
          shouldDirty: true,
          shouldTouch: true,
        })

        const selectionWasInGroup =
          itemSelected === itemToDelete.clientKey
        
        if (selectionWasInGroup) {
          setItemSelected(newList[0]?.clientKey ?? '')
        }
    }

    return (
        <SectionItemShell
            sectionId="education"
            clientKey={item.clientKey}
            containerId="education"
            path={FieldNameEducation.content}
            itemSelected={itemSelected}
            setItemSelected={setItemSelected}
            className="flex gap-2"
            sortableType="card"
            leading={
                <CommonListLigne
                    watchWithIcon={watchWithIcon}
                    watchListStyle={watchListStyle}
                    color="gray-500"
                />
            }
            onDelete={() => deleteEducation(item)}
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
            <ContentEducationContainer
                general={watchGeneral}
                item={item}
                educationNameCompo={
                    <TextareaCv
                        placeholder="Nom et niveau du diplôme"
                        onClick={() => {
                            setSelectModifInput(`${pathContent}.settings.diplome`)
                            setSelectInputForm('')
                        }}
                        name={`${pathContent}.diplome`}
                        textColor={watchModelTitleOfEducation?.colorSelect}
                        dataInput={{
                            changeSize: '2px',
                            model: watchModelTitleOfEducation,
                        }}
                        textAlign={'left'}
                    />
                }
                educationYearCompo={
                    <InputTextCv
                        placeholder="Année"
                        keyfilter={'int'}
                        onClick={() => {
                            setSelectModifInput(`${pathContent}.settings.year`)
                            setSelectInputForm(
                                `${pathContent}.settings.withYear`
                            )
                        }}
                        name={`${pathContent}.year`}
                        textAlign="right"
                        textColor={watchModelYearOfEducation?.colorSelect}
                        dataInput={{
                            changeSize: '2px',
                            model: watchModelYearOfEducation,
                        }}
                    />
                }
                educationEtablissementCompo={
                    <InputTextCv
                        placeholder="Etablissement"
                        onClick={() => {
                            setSelectModifInput(`${pathContent}.settings.etablissement`)
                            setSelectInputForm(
                                `${pathContent}.settings.withEtablissement`
                            )
                        }}
                        name={`${pathContent}.etablissement`}
                        textColor={watchModelSchoolOfEducation?.colorSelect}
                        dataInput={{
                            changeSize: '1px',
                            model: watchModelSchoolOfEducation,
                        }}
                    />
                }
                educationVilleCompo={
                    <InputTextCv
                        placeholder="Ville"
                        onClick={() => {
                            setSelectModifInput(`${pathContent}.settings.ville`)
                            setSelectInputForm(`${pathContent}.settings.withVille`)
                        }}
                        name={`${pathContent}.ville`}
                        textColor={watchModelCityOfEducation?.colorSelect}
                        dataInput={{
                            changeSize: '1px',
                            model: watchModelCityOfEducation,
                        }}
                    />
                }
            />
        </SectionItemShell>
    )
  }