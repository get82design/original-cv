import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext"
import { FieldNameSocialMedia } from "@/features/cv-editor/utils/fields/fieldNameSocialMedia"
import type { SocialMediaItemContentInput } from "@/services/schemas/cvSave.schema"
import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable"
import type { ListItem } from "@utils/type"
import { Button } from "primereact/button"
import { useFormContext } from "react-hook-form"
import { SocialMediaElement } from "./SocialMediaElement"
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField"
import { ToggleAfficherCacher } from "@/components/input/toggle-button/AfficherCacher"

interface SocialMediaDndProps {
    watchSocialMedias: ListItem<SocialMediaItemContentInput>[]
    itemSelected: string
    setItemSelected: (sectionSelected: string) => void
    createNewItem: () => ListItem<SocialMediaItemContentInput>
    colOfSocialMedia: number
}

export const SocialMediaDnd = ({
    watchSocialMedias,
    itemSelected,
    setItemSelected,
    createNewItem,
    colOfSocialMedia,
}: SocialMediaDndProps) => {
    const { setSectionSelected, sectionSelected } = useCreateCvContext()
    const showAddSocialMedia = sectionSelected === 'section-socialMedia'
    return (
        <SortableContext 
            items={watchSocialMedias.map(s => s.clientKey)} 
            strategy={horizontalListSortingStrategy } 
        >
            {colOfSocialMedia === 4 && <div className={`social-media-grid grid grid-cols-4 gap-x-2 gap-y-0 min-h-[30px]`}>
                <CompoSocialMediaDnd
                    socialMedias={watchSocialMedias}
                    itemSelected={itemSelected}
                    setItemSelected={setItemSelected}
                    setSectionSelected={setSectionSelected}
                    showAddSocialMedia={showAddSocialMedia}
                    createNewItem={createNewItem}
                />
            </div>}
            {colOfSocialMedia === 3 && <div className={`social-media-grid grid grid-cols-3 gap-x-2 gap-y-0 min-h-[30px]`}>
                <CompoSocialMediaDnd
                    socialMedias={watchSocialMedias}
                    itemSelected={itemSelected}
                    setItemSelected={setItemSelected}
                    setSectionSelected={setSectionSelected}
                    showAddSocialMedia={showAddSocialMedia}
                    createNewItem={createNewItem}
                />
            </div>}
        </SortableContext>
    )
}

interface CompoSocialMediaDndProps {
    socialMedias: ListItem<SocialMediaItemContentInput>[]
    itemSelected: string
    setItemSelected: (e: string) => void
    setSectionSelected: (e: string) => void
    showAddSocialMedia: boolean
    createNewItem: () => ListItem<SocialMediaItemContentInput>
}

export const CompoSocialMediaDnd = ({
    socialMedias,
    itemSelected,
    setItemSelected,
    setSectionSelected,
    showAddSocialMedia,
    createNewItem,
}: CompoSocialMediaDndProps) => {
    const { setValue } = useFormContext()
    const itemsMenu = (idx: number) => {
        const pathContent = dataFieldContent('datas.socialMedia.content', idx, 'content.settings')
        return [
            {
                label: 'Options',
                items: [
                    { template: (
                        <div className="flex justify-between py-1 px-4 items-center">
                          <p>Réseau social</p>
                          <ToggleAfficherCacher
                            name={`${pathContent}.withSocialNetwork`}
                          />
                        </div>
                    )},
                    { template: (
                        <div className="flex justify-between py-1 px-4 items-center">
                          <p>Nom d'utilisateur</p>
                          <ToggleAfficherCacher
                            name={`${pathContent}.withUsername`}
                          />
                        </div>
                    )},
                    { template: (
                        <div className="flex justify-between py-1 px-4 items-center">
                          <p>Taille</p>
                          <ToggleAfficherCacher
                            name={`${pathContent}.withIcon`}
                          />
                        </div>
                    )},
                ]
            }
        ]
    }
    return (
        <>
            {socialMedias.map((socialMedia, index) => (
                <div
                    className="socialMedia-card" 
                    key={socialMedia.clientKey}
                    onClick={(e) => {
                        e.stopPropagation()
                        setItemSelected(socialMedia.clientKey)
                        setSectionSelected('section-socialMedia')  // global : sa section
                    }} 
                >
                    <SocialMediaElement 
                        index={index} 
                        item={socialMedia} 
                        itemSelected={itemSelected}          // local
                        setItemSelected={setItemSelected}    // local
                        itemsMenu={itemsMenu}
                    />
                </div>
            ))}
            {showAddSocialMedia && <Button
                type="button"
                outlined
                icon="pi pi-plus"
                size="small"
                onClick={(e) => {
                    e.stopPropagation()
                    const fresh = createNewItem()
                    setValue(FieldNameSocialMedia.content, [
                        ...socialMedias,
                        { ...fresh, order: socialMedias.length + 1 },
                    ], { shouldDirty: true })
                }}
            />}
        </>
    )
}