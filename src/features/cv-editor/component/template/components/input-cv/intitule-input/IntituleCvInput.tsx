import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv"
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext"
import { FieldNameHeader } from "@/features/cv-editor/utils/fields/fieldNameHeader"
import type { BaseTextSettings } from "@/services/schemas/cvTemplate.schema"
import { useFormContext } from "react-hook-form"

interface IntituleCvInputProps {
    forceWidthFull?: boolean
    textAlign?: "left" | "right" | "center" | "justify" | undefined
  }
  
  export const IntituleCvInput = ({ forceWidthFull = false, textAlign = 'left' }: IntituleCvInputProps) => {
    const { watch } = useFormContext()
    const watchModelHeaderSubTitle: BaseTextSettings = watch(
      FieldNameHeader.settingsSubTitle
    )
    const { setSelectModifInput, setSelectInputForm } = useCreateCvContext()
    return (
      <InputTextCv
        className="w-full"
        placeholder="Role que vous souhaitez intégrer"
        name={FieldNameHeader.subTitle}
        onClick={() => {
          setSelectModifInput(FieldNameHeader.settingsSubTitle)
          setSelectInputForm('')
        }}
        textColor={watchModelHeaderSubTitle?.colorSelect}
        textAlign={textAlign ?? watchModelHeaderSubTitle?.textAlign ?? "left"}
        forceWidthFull={forceWidthFull}
        dataInput={{
          changeSize: '2px',
          model: watchModelHeaderSubTitle,
        }}
      />
    )
  }