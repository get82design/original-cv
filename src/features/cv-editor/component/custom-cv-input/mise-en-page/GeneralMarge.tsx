import { SelectButtonRhf } from "@/components/input/select-button/SelectButton"
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral"
import { Tooltip } from "primereact/tooltip"
import { MdInfo } from "react-icons/md"

interface GeneralMargeProps {
    watchMarge: 'sm' | 'md' | 'lg'
}

export const GeneralMarge = ({ watchMarge }: GeneralMargeProps) => {
    // const primaryColor = PrimaryTextColorStyle()
    const margeOptions: string[] = ['sm', 'md', 'lg']
    const margeTemplate = (option: string) => {
        return <div className='text-sm'>{option}</div>
    }
    return (
        <div className="flex flex-col gap-1">
            <div className="flex w-1/4 gap-2">
                <p className="my-0 font-semibold text-sm">Marges</p>
                <MdInfo className="infoMargeGeneral" /*style={primaryColor}*/ />
                <Tooltip
                    target=".infoMargeGeneral"
                    content={'Marges extérieures du Cv'}
                />
            </div>
            <div className="w-full flex justify-around">
                <SelectButtonRhf
                    className='shadow-none panel-modification'
                    value={watchMarge}
                    name={FieldNameLayoutGeneral.marge}
                    itemTemplate={margeTemplate}
                    options={margeOptions}
                    unselectable={false}
                />
            </div>
        </div>
    )
}