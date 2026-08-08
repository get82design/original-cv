import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext"
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral"
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField"
import { useCallback, useRef, type JSX } from "react"
import { useFormContext } from "react-hook-form"
import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv"
import { ContentExperienceContainer } from "./ContentExperienceContainer"
import { TextareaCv } from "@/components/input-writer/input-textarea-cv/InputTextareaCv"
import type { ExperienceItemContentInput } from "@/services/schemas/cvSave.schema"
import { PeriodeCv } from "@/components/input-writer/calendar/periode-cv"
import { ListInSection } from "../../input-cv/section/ListInSection"
import { ElementList } from "../../input-cv/section/ElementList"
import { FieldNameExperience } from "@/features/cv-editor/utils/fields/fieldNameExperience"
import { CommonListLigne } from "../../common-compo/list/CommonListLigne"
import { Menu } from "primereact/menu"
import type { ListItem } from "@utils/type";
import { SectionItemShell } from "../../common-compo/section/SectionItemShell"

interface ExperienceElementProps {
  index: number
  item: ListItem<ExperienceItemContentInput>
  itemSelected: string
  setItemSelected: (e: string) => void
  itemsMenu: (idx: number) => {
    label: string
    items: {
        template: JSX.Element
    }[]
  }[]
  addElmList: (
    e: ListItem<ExperienceItemContentInput>,
    elm: string,
    index: number
  ) => void
  deleteMission: (index: number, idx: number) => void
}
  
export const ExperienceElement = ({
  index,
  item,
  itemSelected,
  setItemSelected,
  itemsMenu,
  addElmList,
  deleteMission,
}: ExperienceElementProps) => {
  const { watch, setValue, getValues } = useFormContext()
  const { setSelectModifInput, setSelectInputForm}
    = useCreateCvContext()

  const watchGeneral = watch(FieldNameLayoutGeneral.layout)
  const pathContent = dataFieldContent('datas.experience.content', index, 'content')
  const watchWithIcon = watchGeneral?.titleSection.withIcon
  const watchListStyle = watchGeneral?.listStyle
  const menuLeft = useRef<Menu>(null)


  const watchModelTitleOfExperience = watch(
    `${pathContent}.settings.title`
  )
  const watchModelCompanyOfExperience = watch(
    `${pathContent}.settings.company`
  )
  const watchModelPeriodeOfExperience = watch(
    `${pathContent}.settings.periode`
  )
  const watchModelLocationOfExperience = watch(
    `${pathContent}.settings.location`
  )
  const watchModelDescriptionOfExperience = watch(
    `${pathContent}.settings.description`
  )
  const watchModelMissionOfExperience = watch(
    `${pathContent}.settings.missions`
  )

  const deleteExperience = (itemToDelete: ListItem<ExperienceItemContentInput>) => {
    const list = (getValues(FieldNameExperience.content) ?? []) as ListItem<ExperienceItemContentInput>[]
        
    const newList = list
      .filter((entry) => entry.clientKey !== itemToDelete.clientKey)
      .map((entry, i) => ({ ...entry, order: i + 1 }))
    
    setValue(FieldNameExperience.content, newList, {
      shouldDirty: true,
      shouldTouch: true,
    })
    
    // sélection : experience lui-même OU une mission de ce experience
    const deleteMissionKeys = new Set(
      (itemToDelete.content?.missions ?? []).map((s) => s.clientKey)
    )
    const selectionWasInGroup =
      itemSelected === itemToDelete.clientKey ||
      deleteMissionKeys.has(itemSelected)
    
    if (selectionWasInGroup) {
      setItemSelected(newList[0]?.clientKey ?? '')
    }
  }
  
  const elmList = useCallback(
    (_content: ListItem<any>, idx: number) => (
      <ElementList
        key={idx}
        index={index}
        idx={idx}
        itemSelected={itemSelected}
        itemClientKey={item.clientKey}
        deleteMission={deleteMission}
        watchModel={watchModelMissionOfExperience}
        placeholder="quelle est votre réussite qui correspond à l'emploi auquel vous postulez ?"
        pathContent={pathContent}
      />
    ),
    [deleteMission, index, item.clientKey, itemSelected, watchModelMissionOfExperience, pathContent]
  )
    
  return (
    <SectionItemShell
      sectionId="experience"
      clientKey={item.clientKey}
      containerId="experience"
      path={FieldNameExperience.content}
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
      onDelete={() => deleteExperience(item)}
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
      <ContentExperienceContainer
        item={item}
        titleCompo={
          <TextareaCv
            placeholder="Intitulé"
            onClick={() => {
              setSelectModifInput(`${pathContent}.settings.title`)
              setSelectInputForm(
                `${pathContent}.settings.withTitle`
              )
            }}
            name={`${pathContent}.title`}
            textColor={watchModelTitleOfExperience?.colorSelect}
            textAlign="left"
            dataInput={{
              changeSize: '2px',
              model: watchModelTitleOfExperience,
            }}
          />
        }
        companyCompo={
          <InputTextCv
            placeholder="Entreprise"
            onClick={() => {
              setSelectModifInput(`${pathContent}.settings.company`)
              setSelectInputForm(
                `${pathContent}.settings.withCompany`
              )
            }}
            textColor={watchModelCompanyOfExperience?.colorSelect}
            name={`${pathContent}.company`}
            dataInput={{
              changeSize: '2px',
              model: watchModelCompanyOfExperience,
            }}
            className="-mt-1.5"
          />
        }
        periodeCompo={
          <PeriodeCv
            fieldName={`${pathContent}.settings.periode`}
            afficherCacher={`${pathContent}.settings.withPeriode`}
            placeholder="Période"
            textAlign="right"
            textColor={watchModelPeriodeOfExperience?.colorSelect}
            name={`${pathContent}.periode`}
            dataInput={{
              changeSize: '1px',
              model: watchModelPeriodeOfExperience,
            }}
          />
        }
        locationCompo={
          <InputTextCv
            placeholder="Lieu"
            textAlign="right"
            onClick={() => {
              setSelectModifInput(`${pathContent}.settings.location`)
              setSelectInputForm(
                `${pathContent}.settings.withLocation`
              )
            }}
            name={`${pathContent}.location`}
            textColor={watchModelLocationOfExperience?.colorSelect}
            dataInput={{
              changeSize: '1px',
              model: watchModelLocationOfExperience,
            }}
            className="-mt-1"
          />
        }
        descriptionCompo={
          <TextareaCv
            name={`${pathContent}.description`}
            onClick={() => {
              setSelectModifInput(`${pathContent}.settings.description`)
              setSelectInputForm(
                `${pathContent}.settings.withDescription`
              )
            }}
            placeholder="Petite description de votre expérience"
            textColor={watchModelDescriptionOfExperience?.colorSelect}
            textAlign={watchModelDescriptionOfExperience?.textAlign}
            autoResize
            dataInput={{
              changeSize: '1px',
              model: watchModelDescriptionOfExperience,
            }}
          />
        }
        //   {/*
        //   //? Composant pour liste à reporter sur les autres compo
        //   //! Faire attention aux règles withList et missions => mission
        //   */}
        listCompo={
          <ListInSection
            pathContent={pathContent}
            watchIfListAffiche={watch(
              `${pathContent}.settings.withListMissions`
            )}
            item={item}
            index={index}
            itemSelected={itemSelected}
            elmList={elmList}
            addElmList={addElmList}
          />
        }
        general={watchGeneral}
      />
    </SectionItemShell>
  )
}