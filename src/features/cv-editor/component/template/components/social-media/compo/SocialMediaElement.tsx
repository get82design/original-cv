import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext"
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral"
import { FieldNameSocialMedia } from "@/features/cv-editor/utils/fields/fieldNameSocialMedia"
import type { SocialMediaItemContentInput } from "@/services/schemas/cvSave.schema"
import type { ListItem } from "@utils/type"
import { useFormContext } from "react-hook-form"
import { ContentSocialMediaContainer } from "./ContentSocialMediaContainer"
import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv"
import { SelectSocialIcon } from "@/components/icon/SelectSocialIcon"
import { SectionItemShell } from "../../common-compo/section/SectionItemShell"
import { Menu } from "primereact/menu"
import { useRef, type JSX } from "react"

interface SocialMediaElementProps {
    item: ListItem<SocialMediaItemContentInput>
    index: number
    itemSelected: string
    setItemSelected: (sectionSelected: string) => void
    itemsMenu: (idx: number) => {
        label: string
        items: {
            template: JSX.Element
        }[]
    }[]
}

export const SocialMediaElement = ({ item, index, itemSelected, setItemSelected, itemsMenu }: SocialMediaElementProps) => {
    const { watch, setValue, getValues } = useFormContext()
    const menuLeft = useRef<Menu>(null)
    const { 
        setSelectModifInput, 
        setSelectInputForm, 
    } = useCreateCvContext()
    
    const watchGeneral = watch(FieldNameLayoutGeneral.layout);
    const pathContent = `datas.socialMedia.content.${index}.content`
    const watchModelSocialMedia = watch(`${pathContent}.settings.socialMedia`)
    const watchModelUsername = watch(`${pathContent}.settings.username`)

    const deleteSocialMedia = (itemToDelete: ListItem<SocialMediaItemContentInput>) => {
        const list = (getValues(FieldNameSocialMedia.content) ?? []) as ListItem<SocialMediaItemContentInput>[]
            
        const newList = list
            .filter((entry) => entry.clientKey !== itemToDelete.clientKey)
            .map((entry, i) => ({ ...entry, order: i + 1 }))
        
        setValue(FieldNameSocialMedia.content, newList, {
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
            clientKey={item.clientKey}
            sectionId="socialMedia"
            containerId="socialMedia"
            path={FieldNameSocialMedia.content}
            itemSelected={itemSelected}
            setItemSelected={setItemSelected}
            sortableType="card"
            onDelete={() => deleteSocialMedia(item)}
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
            <ContentSocialMediaContainer 
                general={watchGeneral}
                item={item}
                iconCompo={
                    <SelectSocialIcon
                        icon={item.content.icon}
                        color={item.content?.settings?.iconColor ?? "primaryColor"}
                        setIcon={(icon) => {
                            setValue(`${pathContent}.icon`, icon)
                        }}
                        fieldName={`${pathContent}.icon`}
                        afficherCacher={`${pathContent}.settings.withIcon`}
                    />
                }
                socialNetworkCompo={
                    <InputTextCv 
                        placeholder="Réseaux social"
                        onClick={() => {
                            setSelectModifInput(`${pathContent}.settings.socialNetwork`)
                            setSelectInputForm(
                                `${pathContent}.settings.withSocialNetwork`
                            )
                        }}
                        name={`${pathContent}.socialNetwork`}
                        textColor={watchModelSocialMedia?.colorSelect}
                        textAlign="left"
                        dataInput={{
                            changeSize: '2px',
                            model: watchModelSocialMedia,
                        }}
                    />
                }
                userNameCompo={
                    <InputTextCv 
                        placeholder="Nom d'utilisateur"
                        onClick={() => {
                            setSelectModifInput(`${pathContent}.settings.username`)
                            setSelectInputForm(
                                `${pathContent}.settings.withUsername`
                            )
                        }}
                        name={`${pathContent}.username`}
                        textColor={watchModelUsername?.colorSelect}
                        textAlign="left"
                        dataInput={{
                            changeSize: '2px',
                            model: watchModelUsername,
                        }}
                    />
                }
            />
        </SectionItemShell>
    )
}