import { useRef } from 'react'
import { Menu } from 'primereact/menu'
import { useFormContext } from 'react-hook-form'
import { RadioRhf } from '@/components/input/radio/RadioRhf'
import { moduleField } from '@/features/cv-editor/utils/fields/moduleField'

export const LanguageSectionMenu = () => {
  const menuRef = useRef<Menu>(null)
  const { watch } = useFormContext()
  const modules = watch('modules')
  const pathDesign = moduleField(modules, 'language', 'settings', 'content')
  
  // → modules.{i}.settings.content
  const designPath = `${pathDesign}.design`
  const watchDesign = watch(designPath)
  const items = [
    {
      label: 'Options',
      items: [
        {
          template: (
            <div className="flex flex-col py-1 px-4 gap-2">
              <p>Affichage du niveau</p>
              <div className="grid grid-cols-2 gap-2">
                <RadioRhf name={designPath} label="Stars" value="stars" checked={watchDesign === 'stars'} />
                <RadioRhf name={designPath} label="Dots" value="dots" checked={watchDesign === 'dots'} />
                <RadioRhf name={designPath} label="Bars" value="bars" checked={watchDesign === 'bars'} />
              </div>
            </div>
          ),
        },
      ],
    },
  ]
  return (
    <>
      <div
        className="p-2 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          menuRef.current?.toggle(e)
        }}
      >
        options
      </div>
      <Menu model={items} popup ref={menuRef} style={{ width: 300 }} />
    </>
  )
}