import type { EducationItemContentInput } from "@/services/schemas/cvSave.schema"
import { ToggleAfficherCacher } from "@/components/input/toggle-button/AfficherCacher"
import { FieldNameEducation } from "@/features/cv-editor/utils/fields/fieldNameEducation"
import { EducationElement } from "./EducationElement"
import { verticalListSortingStrategy , SortableContext } from "@dnd-kit/sortable"
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField"
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext"
import { Button } from "primereact/button"
import { MdAdd } from "react-icons/md"
import { useFormContext } from "react-hook-form"
import type { ListItem } from "@utils/type"

interface EducationDndProps {
    watchEducations: ListItem<EducationItemContentInput>[]
    itemSelected: string
    setItemSelected: (e: string) => void
    createNewItem: () => ListItem<EducationItemContentInput>
  }
  
  export const EducationDnd = ({
    watchEducations,
    itemSelected,
    setItemSelected,
    createNewItem,
  }: EducationDndProps) => {
    const { setSectionSelected, sectionSelected } = useCreateCvContext()
    const { setValue } = useFormContext()
    const itemsMenu = (idx: number) => {
      const pathContent = dataFieldContent('datas.education.content', idx, 'content.settings')
      return [
        {
          label: 'Options',
          items: [
            {
              template: (
                <div className="flex justify-between py-1 px-4 items-center">
                  <p>Année</p>
                  <ToggleAfficherCacher
                    name={`${pathContent}.withYear`}
                  />
                </div>
              ),
            },
            {
              template: (
                <div className="flex justify-between py-1 px-4 items-center">
                  <p>Etablissement</p>
                  <ToggleAfficherCacher
                    name={`${pathContent}.withEtablissement`}
                  />
                </div>
              ),
            },
            {
              template: (
                <div className="flex justify-between py-1 px-4 items-center">
                  <p>Ville</p>
                  <ToggleAfficherCacher
                    name={`${pathContent}.withVille`}
                  />
                </div>
              ),
            },
          ],
        },
      ]
    }

    const showAddEducation = sectionSelected === 'section-education'

    return (
        <SortableContext items={watchEducations.map(s => s.clientKey)} strategy={verticalListSortingStrategy }>
           <div className="educations-grid">
            {watchEducations.map((education, index) => (
                <div
                    className="education-card" 
                    key={education.clientKey}
                    onClick={(e) => {
                        e.stopPropagation()
                        setItemSelected(education.clientKey)
                        setSectionSelected('section-education')  // global : sa section
                    }} 
                >
                    <EducationElement 
                        index={index} 
                        item={education} 
                        itemSelected={itemSelected}          // local
                        setItemSelected={setItemSelected}    // local
                        itemsMenu={itemsMenu}
                    />
                </div>
            ))}
            {showAddEducation && <Button
                type="button"
                outlined
                size="small"
                className="flex gap-2"
                onClick={(e) => {
                    e.stopPropagation()
                    const fresh = createNewItem()
                    setValue(FieldNameEducation.content, [
                        ...watchEducations,
                        { ...fresh, order: watchEducations.length + 1 },
                    ], { shouldDirty: true })
                }}
            >
                <MdAdd /> <span>Ajouter un diplôme</span>
            </Button>}
           </div>
        </SortableContext>
    )
  }