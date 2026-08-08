import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext"
import { FieldNameLanguage } from "@/features/cv-editor/utils/fields/fieldNameLanguage"
import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable"
import { Button } from "primereact/button"
import { useFormContext } from "react-hook-form"
import type { ListItem } from "@utils/type"
import type { LanguageItemContentInput } from "@/services/schemas/cvSave.schema"
import { LanguageElement } from "./LanguageElement"
import { LanguageSectionMenu } from "./LanguageSectionMenu"

interface LanguageDndProps {
    watchLanguages: ListItem<LanguageItemContentInput>[]
    itemSelected: string
    setItemSelected: (e: string) => void
    createNewItem: () => ListItem<LanguageItemContentInput>
    colOfLanguage: number
}

export const LanguageDnd = ({ 
    watchLanguages, 
    itemSelected, 
    setItemSelected, 
    createNewItem,
    colOfLanguage = 4
}: LanguageDndProps) => {
    const { setSectionSelected, sectionSelected } = useCreateCvContext()
    const showAddLanguage = sectionSelected === 'section-language'
    return (
        <SortableContext 
            items={watchLanguages.map(s => s.clientKey)} 
            strategy={horizontalListSortingStrategy } 
        >
            {colOfLanguage === 4 && <div className={`language-grid grid grid-cols-4 gap-x-2 gap-y-0 min-h-[30px]`}>
                <CompoLanguageDnd
                    languages={watchLanguages}
                    itemSelected={itemSelected}
                    setItemSelected={setItemSelected}
                    setSectionSelected={setSectionSelected}
                    showAddLanguage={showAddLanguage}
                    createNewItem={createNewItem}
                />
            </div>}
            {colOfLanguage === 3 && <div className={`language-grid grid grid-cols-3 gap-x-2 gap-y-0 min-h-[30px]`}>
                <CompoLanguageDnd
                    languages={watchLanguages}
                    itemSelected={itemSelected}
                    setItemSelected={setItemSelected}
                    setSectionSelected={setSectionSelected}
                    showAddLanguage={showAddLanguage}
                    createNewItem={createNewItem}
                />
            </div>}
        </SortableContext>
    )
}

interface CompoLanguageDndProps {
    languages: ListItem<LanguageItemContentInput>[]
    itemSelected: string
    setItemSelected: (e: string) => void
    setSectionSelected: (e: string) => void
    showAddLanguage: boolean
    createNewItem: () => ListItem<LanguageItemContentInput>
}

export const CompoLanguageDnd = ({
    languages,
    itemSelected,
    setItemSelected,
    setSectionSelected,
    showAddLanguage,
    createNewItem,
}: CompoLanguageDndProps) => {
    const { setValue } = useFormContext()
    return (
        <>
            {languages.map((language, index) => (
                <div
                    className="language-card" 
                    key={language.clientKey}
                    onClick={(e) => {
                        e.stopPropagation()
                        setItemSelected(language.clientKey)
                        setSectionSelected('section-language')  // global : sa section
                    }} 
                >
                    <LanguageElement 
                        index={index} 
                        item={language} 
                        itemSelected={itemSelected}          // local
                        setItemSelected={setItemSelected}    // local
                    />
                </div>
            ))}
            {showAddLanguage && <Button
                type="button"
                outlined
                icon="pi pi-plus"
                size="small"
                onClick={(e) => {
                    e.stopPropagation()
                    const fresh = createNewItem()
                    setValue(FieldNameLanguage.content, [
                        ...languages,
                        { ...fresh, order: languages.length + 1 },
                    ], { shouldDirty: true })
                }}
            />}
        </>
    )
}