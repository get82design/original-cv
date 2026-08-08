import { useFormContext } from "react-hook-form"
import { GeneralMarge } from "./mise-en-page/GeneralMarge"
import { GeneralSpace } from "./mise-en-page/GeneralSpace"
import { TitleSectionTextTranform } from "./mise-en-page/TitleSectionTextTransform"
import { TitleSectionIcon } from "./mise-en-page/TitleSectionIcon"
import { TitleSectionLigne } from "./mise-en-page/TitleSectionLigne"
import { GeneralPhoto } from "./mise-en-page/GeneralPhoto"

export const ModifMiseEnPage = () => {
    const { watch } = useFormContext()
    const watchMarge = watch('layoutGeneral.layout.marge')
    const watchSpace = watch('layoutGeneral.layout.space')
    // const primaryColor = PrimaryTextColorStyle()
    const watchWithIcon = watch('layoutGeneral.layout.titleSection.withIcon')
    const watchIconStyle = watch('layoutGeneral.layout.titleSection.iconStyle')
    const watchLigneDessous = watch('layoutGeneral.layout.titleSection.withLigneDessous')
    const watchLigneDessus = watch('layoutGeneral.layout.titleSection.withLigneDessus')
    const watchTitleSectionTextTransform = watch('layoutGeneral.layout.titleSection.textTransform')
    const watchWithPhoto = watch('layoutGeneral.layout.withPhoto')
    const watchStylePhoto = watch('layoutGeneral.layout.stylePhoto')
    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-center gap-8">
                <GeneralMarge watchMarge={watchMarge} />
                <GeneralSpace watchSpace={watchSpace} />
            </div>
            <div className='flex justify-center'>
                <TitleSectionTextTranform watchTitleSectionTextTransform={watchTitleSectionTextTransform} />
            </div>
            {watchWithIcon
                ? (
                    <div className='w-full flex justify-center'>
                        <TitleSectionIcon watchIconStyle={watchIconStyle} />
                    </div>
                )
                : watchLigneDessus
                    || watchLigneDessus === false
                    || watchLigneDessous
                    || watchLigneDessous === false
                    ? (

                        <div className='flex justify-center'>
                            <TitleSectionLigne watchLigneDessus={watchLigneDessus} watchLigneDessous={watchLigneDessous} />
                        </div>
                    )
                    : null}
            <div className='w-full flex justify-center'>
                <GeneralPhoto watchWithPhoto={watchWithPhoto} watchStylePhoto={watchStylePhoto} />
            </div>
        </div>
    )
}