import { SelectButtonRhf } from "@/components/input/select-button/SelectButton"
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral"
import { Tooltip } from "primereact/tooltip"
import { MdInfo } from "react-icons/md"

interface GeneralSpaceProps {
    watchSpace: 'sm' | 'md' | 'lg'
}

export const GeneralSpace = ({ watchSpace }: GeneralSpaceProps) => {
    // const primaryColor = PrimaryTextColorStyle()
    const spaceOptions: string[] = ['sm', 'md', 'lg']
    const spaceTemplate = (option: string) => {
        return <div className='text-sm'>{option}</div>
    }
    return (
        <div className="flex flex-col gap-1">
            <div className="flex w-1/4 gap-2">
                <p className="my-0 font-semibold text-sm">Espaces</p>
                <MdInfo className="infoEspaceGeneral" /*style={primaryColor}*/ />
                <Tooltip
                    target=".infoEspaceGeneral"
                    content={'Espaces entre les sections'}
                />
            </div>
            <div className="w-full flex justify-around">
                <SelectButtonRhf
                    className='shadow-none panel-modification'
                    value={watchSpace}
                    name={FieldNameLayoutGeneral.space}
                    itemTemplate={spaceTemplate}
                    options={spaceOptions}
                    unselectable={false}
                />
            </div>
        </div>
    )
}