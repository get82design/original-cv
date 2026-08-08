import { useFormContext } from "react-hook-form"
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext"
import { BreadCrumb } from "primereact/breadcrumb"
import { changeNameSection, changeNameSelectInput } from "@/features/cv-editor/utils/changeName"
import { SelectSize } from "./panel-modif/SelectSize"
import { SelectWeight } from "./panel-modif/SelectHeight"
import { SelectAlign } from "./panel-modif/SelectAlign"
import { SelectColor } from "./panel-modif/SelectColor"
import { SelectAfficherCacher } from "./panel-modif/SelectAfficherCacher"

export const ModifSelectInput = () => {
    const { watch } = useFormContext()
    const { selectModifInput, sectionSelected } = useCreateCvContext()
    const watchSelectInput = watch(selectModifInput)
    const modelBreadCrumb = [
        { label: changeNameSection(sectionSelected) },
        { label: changeNameSelectInput(selectModifInput) },
    ]
    return (
        <div className="w-full flex flex-col gap-2">
            {selectModifInput !== '' ? (
                <>
                    <BreadCrumb model={modelBreadCrumb} className="text-sm mt-2" />
                    <div className="w-full grid grid-cols-1 gap-4">
                        <div className="w-full flex justify-between">
                            {watch(selectModifInput + '.sizeSelect')
                                ? (
                                    <SelectSize
                                        watchSelectInput={watchSelectInput}
                                        select={selectModifInput}
                                    />
                                ) : null}
                            {watch(selectModifInput + '.weightSelect')
                                ? (
                                    <SelectWeight
                                        watchSelectInput={watchSelectInput}
                                        select={selectModifInput}
                                    />
                                ) : null}
                        </div>
                        <div className="w-full flex justify-between gap-2">
                            {watch(selectModifInput + '.textAlign') ? (
                                <SelectAlign
                                    watchSelectInput={watchSelectInput}
                                    select={selectModifInput}
                                />
                            ) : null}
                            {watch(selectModifInput + '.colorSelect') ? (
                                <SelectColor
                                    watchSelectInput={watchSelectInput}
                                    select={selectModifInput}
                                />
                            ) : null}
                            <SelectAfficherCacher select={selectModifInput} />
                        </div>
                    </div>
                </>) : (
                <p className="text-sm text-center mt-2">Aucun élément sélectionné</p>
            )}
        </div>
    )
}