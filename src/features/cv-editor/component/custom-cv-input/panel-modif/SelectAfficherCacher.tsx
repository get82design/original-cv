import { useEffect, useState } from "react"
import { useCreateCvContext } from "../../context/CreateCvContext"
import { ToggleAfficherCacher } from "@/components/input/toggle-button/AfficherCacher"

interface SelectAfficherCacherProps {
    select: string
  }
  
  export const SelectAfficherCacher = ({ select }: SelectAfficherCacherProps) => {
    const { selectInputForm } = useCreateCvContext()
    const [input, setInput] = useState('')
  
    useEffect(() => {
      if (select) setInput(selectInputForm)
    }, [select, selectInputForm])
  
    return input !== ''
      ? (
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-xs">
            Afficher / cacher{' '}
            {selectInputForm === 'philosophie.content.withAuteur'
              ? 'auteur'
              : selectInputForm.split('.').pop() === 'withIcon'
                ? 'icone'
                : selectInputForm.split('.').pop() === 'withGroupCompetence'
                  ? 'nom groupe'
                  : null}{' '}
            :
          </p>
          <ToggleAfficherCacher name={input} compact />
        </div>
      )
      : null
  }
