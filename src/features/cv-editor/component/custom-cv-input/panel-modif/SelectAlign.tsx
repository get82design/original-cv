import { SelectButtonRhf } from "@/components/input/select-button/SelectButton";

interface SelectAlignProps {
    watchSelectInput: { textAlign: 'left' | 'center' | 'right' | 'justify' };
    select: string;
  }
  
  interface JustifyOption {
    icon: string;
    value: string;
  }
  
  export const SelectAlign = ({
    watchSelectInput,
    select,
  }: SelectAlignProps) => {
    const justifyOptions: JustifyOption[] = [
      { icon: 'pi pi-align-left', value: 'left' },
      { icon: 'pi pi-align-center', value: 'center' },
      { icon: 'pi pi-align-right', value: 'right' },
      { icon: 'pi pi-align-justify', value: 'justify' }
    ]
    const justifyTemplate = (option: JustifyOption) => {
      return <i className={option.icon}></i>
    }
    return (
      <div className="flex flex-col gap-1">
        <p className="font-semibold text-sm">Alignement :</p>
        <SelectButtonRhf
          className='shadow-none panel-modification'
          value={watchSelectInput?.textAlign}
          name={select + '.textAlign'}
          itemTemplate={justifyTemplate}
          optionLabel={'value'}
          options={justifyOptions}
        />
      </div>
    )
}