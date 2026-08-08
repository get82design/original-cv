import { MdInfo } from "react-icons/md"
import { useModelAndColorContext } from "@/features/cv-editor/component/context/ModelAndColorContext"
import { Tooltip } from "primereact/tooltip"
import type { Color } from "@utils/trpc.types"
import { RadioColorRhf } from "@/components/input/radio/RadioColorRhf"
import { FieldNameLayoutGeneral } from "../../utils/fields/fieldNameLayoutGeneral"

export const GeneralColor = () => {
    const { colors } = useModelAndColorContext()
    return (
        <div className='w-full flex flex-col gap-1'>
            <div className="flex gap-1 items-center">
                <p className="my-0 font-semibold text-sm">Couleur Principale</p>
                <MdInfo
                    className="infoColorPrincipale"
                />
                <Tooltip target={'.infoColorPrincipale'} content={'Couleur du thème de votre cv'} />
            </div>
            <div className="grid grid-cols-10 gap-1">
                {colors && colors.length > 0
                    ? colors.map((color: Color, index) => {
                        return (
                            <RadioColorRhf
                                index={index}
                                general={true}
                                className="col"
                                key={color.name}
                                //! penser à remettre le bon fieldName
                                name={FieldNameLayoutGeneral.primaryColor}
                                color={'--' + color.name + color.primary}
                                value={color}
                            />
                        )
                    })
                    : null}
            </div>
        </div>
    )
}