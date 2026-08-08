import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv"
import { useChangeTextFormat } from "@/features/cv-editor/utils/utilsCv/font"
import type { BaseTextSettings } from "@/services/schemas/cvTemplate.schema"
import { useFormContext } from "react-hook-form"
import { FieldNameHeader } from "@/features/cv-editor/utils/fields/fieldNameHeader"
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext"

interface NomPrenomInputProps {
    forceWidthFull?: boolean
  }
  
  export const NomPrenomInput = ({ forceWidthFull = false, }: NomPrenomInputProps) => {
    const { watch } = useFormContext()
    const { setSelectModifInput, setSelectInputForm } = useCreateCvContext()
    const watchDataHeaderTitleSettings: BaseTextSettings = watch(
      FieldNameHeader.settingsTitle
    )
  
    return (
      <InputTextCv
        placeholder="Votre nom"
        className="resume-first-and-last-name w-full"
        name={FieldNameHeader.title}
        onClick={() => {
          setSelectModifInput(FieldNameHeader.settingsTitle)
          setSelectInputForm('')
        }}
        forceWidthFull={forceWidthFull}
        textColor={watchDataHeaderTitleSettings?.colorSelect}
        textAlign={watchDataHeaderTitleSettings?.textAlign || 'left'}
        dataInput={{
          changeSize: '4px',
          model: watchDataHeaderTitleSettings,
        }}
      />
    )
  }