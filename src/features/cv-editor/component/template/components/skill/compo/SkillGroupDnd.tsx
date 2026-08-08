import type { SkillGroupItemContentInput } from "@/services/schemas/cvSave.schema"
import { useFormContext } from "react-hook-form"
import { FieldNameSkill } from "@/features/cv-editor/utils/fields/fieldNameSkill"
import { SkillGroupElement } from "./SkillGroupElement"
import { ToggleAfficherCacher } from "@/components/input/toggle-button/AfficherCacher"
import { RadioRhf } from "@/components/input/radio/RadioRhf"
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { MdAdd } from "react-icons/md"
import { Button } from "primereact/button"
import type { ListItem } from "@utils/type"

interface SkillGroupDndProps {
    watchSkills: ListItem<SkillGroupItemContentInput>[]
    itemSelected: string
    setItemSelected: (e: string) => void
    createNewItem: () => ListItem<SkillGroupItemContentInput>
    colOfSkill: number
}

//! Penser le composant qui possède plusieurs zones de plusieurs skills qui peuvent dnd entre eux dans la zone
//! Mais ce même composant doit pouvoir dnd les différents zones de skills

export const SkillGroupDnd = ({ 
    watchSkills, 
    itemSelected, 
    setItemSelected, 
    createNewItem,
    colOfSkill
}: SkillGroupDndProps) => {
    const { sectionSelected, setSectionSelected } = useCreateCvContext()
    const { watch, setValue } = useFormContext();

    const itemsMenu = (idx: number) => {
        const watchDesignTag = watch(`datas.skillGroup.content.${idx}.content.settings.design`);
        return [
          {
            label: 'Options',
            items: [
              {
                template: (
                  <div className="flex justify-between py-1 px-4 items-center">
                    <p>Nom du groupe</p>
                    <ToggleAfficherCacher
                      name={`datas.skillGroup.content.${idx}.content.settings.withGroupTitle`}
                    />
                  </div>
                ),
              },
              {
                template: (
                  <div className="flex flex-col py-1 px-4">
                    <p>Style du tag</p>
                    <div className="grid grid-cols-2 gap-2">
                      <RadioRhf
                        name={`datas.skillGroup.content.${idx}.content.settings.design`}
                        label="Stars"
                        value="stars"
                        checked={watchDesignTag === 'stars'}
                      />
                      <RadioRhf
                        name={`datas.skillGroup.content.${idx}.content.settings.design`}
                        label="Dots"
                        value="dots"
                        checked={watchDesignTag === 'dots'}
                      />
                      <RadioRhf
                        name={`datas.skillGroup.content.${idx}.content.settings.design`}
                        label="Bars"
                        value="bars"
                        checked={watchDesignTag === 'bars'}
                      />
                    </div>
                  </div>
                ),
              },
            ],
          },
        ]
    }

    const showAddGroup = sectionSelected === 'section-skill'

    return (
      <SortableContext items={watchSkills.map(s => s.clientKey)} strategy={verticalListSortingStrategy }>
        <div className="skills-grid">
            {watchSkills.map((skill, index) => (
              <div
                  className="skill-group-card" 
                  key={skill.clientKey}
                  onClick={(e) => {
                      e.stopPropagation()
                      setItemSelected(skill.clientKey)
                      setSectionSelected('section-skill')  // global : sa section
                  }} 
              >
                <SkillGroupElement 
                  index={index} 
                  item={skill} 
                  itemSelected={itemSelected}          // local
                  setItemSelected={setItemSelected}    // local
                  itemsMenu={itemsMenu}
                  colOfSkill={colOfSkill}
                />
              </div>
            ))}
            {showAddGroup && <Button
              type="button"
              outlined
              size="small"
              className="flex gap-2"
              onClick={(e) => {
                e.stopPropagation()
                const fresh = createNewItem()
                setValue(FieldNameSkill.content, [
                  ...watchSkills,
                  { ...fresh, order: watchSkills.length + 1 },
                ], { shouldDirty: true })
              }}
            >
              <MdAdd /> <span>Ajouter un groupe</span>
            </Button>}
        </div>
      </SortableContext>
    )
}