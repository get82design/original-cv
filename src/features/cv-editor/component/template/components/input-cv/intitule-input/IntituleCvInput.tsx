import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv"
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext"
import { FieldNameHeader } from "@/features/cv-editor/utils/fields/fieldNameHeader"
import type { BaseTextSettings } from "@/services/schemas/cvTemplate.schema"
import { useFormContext } from "react-hook-form"

interface IntituleCvInputProps {
    forceWidthFull?: boolean
  }
  
  export const IntituleCvInput = ({ forceWidthFull = false, }: IntituleCvInputProps) => {
    const { watch } = useFormContext()
    const watchModelHeaderSubTitle: BaseTextSettings = watch(
      FieldNameHeader.settingsSubTitle
    )
    const { setSelectModifInput, setSelectInputForm } = useCreateCvContext()
    return (
      <InputTextCv
        placeholder="Role que vous souhaitez intégrer"
        name={FieldNameHeader.subTitle}
        onClick={() => {
          setSelectModifInput(FieldNameHeader.settingsSubTitle)
          setSelectInputForm('')
        }}
        textColor={watchModelHeaderSubTitle?.colorSelect}
        textAlign={watchModelHeaderSubTitle?.textAlign || 'left'}
        className={`w-full ${watchModelHeaderSubTitle?.textAlign === 'center'
          ? 'justify-center'
          : watchModelHeaderSubTitle?.textAlign === 'right'
            ? 'justify-end'
            : 'justify-start'
          }`}
        forceWidthFull={forceWidthFull}
        dataInput={{
          changeSize: '2px',
          model: watchModelHeaderSubTitle,
        }}
      />
    )
  }