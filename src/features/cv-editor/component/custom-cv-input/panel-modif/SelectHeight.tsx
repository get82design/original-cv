import { SelectButtonRhf } from "@/components/input/select-button/SelectButton"
import { Tooltip } from "primereact/tooltip"
import { MdInfo } from "react-icons/md"

interface SelectWeightProps {
    watchSelectInput: { weightSelect: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }
    select: string
  }
  
  export const SelectWeight = ({
    watchSelectInput,
    select,
  }: SelectWeightProps) => {
    const weightOptions: string[] = ['xs', 'sm', 'md', 'lg', 'xl']
    const weightTemplate = (option: string) => {
      return <div className='text-sm'>{option}</div>
    }
    return (
      <div className="flex flex-col gap-1">
        <div className="w-full flex gap-2 items-center">
          <p className="font-semibold text-sm">Epaisseur :</p>
          <MdInfo className="infoTextWeight text-primary dark:text-primary-dark" />
          <Tooltip
            target=".infoTextWeight"
            content={'Epaisseur du texte sélectionné'}
          />
        </div>
        <SelectButtonRhf
          className='shadow-none panel-modification'
          value={watchSelectInput?.weightSelect}
          name={select + '.weightSelect'}
          itemTemplate={weightTemplate}
          options={weightOptions}
        />
      </div>
    )
  }