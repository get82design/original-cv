import { SelectButtonRhf } from "@/components/input/select-button/SelectButton"
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral"
import { Tooltip } from "primereact/tooltip"
import { MdInfo } from "react-icons/md"

interface TitleSectionTextTranformProps {
    watchTitleSectionTextTransform: 'capitalize' | 'uppercase'
}
interface TitlTransformOption {
    name: string
    value: string
}

export const TitleSectionTextTranform = ({ watchTitleSectionTextTransform }: TitleSectionTextTranformProps) => {
    // const primaryColor = PrimaryTextColorStyle()
    const titleTransformOptions: TitlTransformOption[] = [
        { name: 'Normales', value: 'capitalize' },
        { name: 'Majuscules', value: 'uppercase' }
    ]
    const titleTransformTemplate = (option: TitlTransformOption) => {
        return <div className='text-sm'>{option.name}</div>
    }
    return (
        <div className='flex flex-col gap-1'>
            <div className="flex gap-2 items-center">
                <p className="my-0 font-semibold text-sm">Titres des sections</p>
                <MdInfo className="infoTitleSection" /*style={primaryColor}*/ />
                <Tooltip
                    target=".infoTitleSection"
                    content={'Modifier l\'ensemble des titres'}
                />
            </div>
            <SelectButtonRhf
                className='shadow-none panel-modification'
                value={watchTitleSectionTextTransform}
                name={FieldNameLayoutGeneral.textTransform}
                itemTemplate={titleTransformTemplate}
                optionLabel={'name'}
                optionValue='value'
                options={titleTransformOptions}
                unselectable={false}
            />
        </div>
    )
}