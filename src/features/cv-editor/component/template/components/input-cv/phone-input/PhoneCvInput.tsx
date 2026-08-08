import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv"
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext"
import { FieldNameHeader } from "@/features/cv-editor/utils/fields/fieldNameHeader"
import { GetPrimaryColor } from "@/features/cv-editor/utils/utilsCv/color"
import { GetAlignementHeader } from "@/features/cv-editor/utils/utilsCv/marge"
import type { BaseTextSettings } from "@/services/schemas/cvTemplate.schema"
import { useFormContext } from "react-hook-form"
import { MdPhone } from "react-icons/md"

interface PhoneInputProps {
    withIcon?: boolean
    colorIcon?: string
    textAlign?: 'left' | 'center' | 'right'
  }
  
  export const PhoneInput = ({
    withIcon,
    colorIcon,
    textAlign = 'left',
  }: PhoneInputProps) => {
    const { watch } = useFormContext()
    const { setSelectModifInput, setSelectInputForm } = useCreateCvContext()
    const watchModelHeaderContent: BaseTextSettings = watch(
      FieldNameHeader.settingsContent
    )
    const primaryColor = GetPrimaryColor()
    return (
      <div
        className={`flex ${GetAlignementHeader(textAlign)} gap-2 items-center`}
      >
        {withIcon && (
          <MdPhone
            style={{
              color: `#${colorIcon
                ? colorIcon
                : primaryColor}`,
            }}
          />
        )}
        <InputTextCv
          placeholder="Téléphone"
          name={FieldNameHeader.phone}
            onClick={() => {
                setSelectModifInput(FieldNameHeader.settingsContent)
                setSelectInputForm('')
            }}
          textColor={watchModelHeaderContent?.colorSelect}
          textAlign={textAlign}
          dataInput={{
            changeSize: '1px',
            model: watchModelHeaderContent,
          }}
        />
      </div>
    )
  }