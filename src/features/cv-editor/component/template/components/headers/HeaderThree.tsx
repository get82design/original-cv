import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv"
import { useFormContext } from "react-hook-form"
import { IntituleCvInput } from "../input-cv/intitule-input/IntituleCvInput"
import { EmailInput } from "../input-cv/email-input/EmailCvInput"
import { PhoneInput } from "../input-cv/phone-input/PhoneCvInput"
import { LocationInput } from "../input-cv/location-input/LocationCvInput"
import { HeaderThreeContainer } from "./content/HeaderThreeContainer"
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral"
import { FieldNameHeader } from "@/features/cv-editor/utils/fields/fieldNameHeader"
import { useCreateCvContext } from "../../../context/CreateCvContext"

export const HeaderThree = () => {
    const { watch } = useFormContext()
    const watchGeneral = watch(FieldNameLayoutGeneral.layout)
    const { setSelectModifInput } = useCreateCvContext()
    const watchModelHeaderNom = watch(FieldNameHeader.settingsNom)
    const watchModelHeaderPrenom = watch(FieldNameHeader.settingsPrenom)
    return (
      <HeaderThreeContainer
        modelGeneral={watchGeneral}
        nomCompo={
          <InputTextCv
            placeholder="Prenom"
            className="w-full"
            name={FieldNameHeader.prenom}
            onClick={() => setSelectModifInput(FieldNameHeader.settingsPrenom)}
            textColor={watchModelHeaderPrenom?.colorSelect}
            textAlign={watchModelHeaderPrenom?.textAlign || 'left'}
            dataInput={{
              changeSize: '4px',
              model: watchModelHeaderPrenom,
            }}
            forceWidthFull={true}
          />
        }
        prenomCompo={
          <InputTextCv
            className="-mt-4 -mb-1 w-full"
            placeholder="Nom"
            name={FieldNameHeader.nom}
            onClick={() => setSelectModifInput(FieldNameHeader.settingsNom)}
            textColor={watchModelHeaderNom?.colorSelect}
            textAlign={watchModelHeaderNom?.textAlign || 'left'}
            dataInput={{
              changeSize: '4px',
              model: watchModelHeaderNom,
            }}
            forceWidthFull={true}
          />
        }
        subTitleCompo={<IntituleCvInput forceWidthFull />}
        emailCompo={<EmailInput withIcon colorIcon="000000" />}
        phoneCompo={<PhoneInput withIcon colorIcon="000000" />}
        locationCompo={<LocationInput withIcon colorIcon="000000" />}
      />
    )
  }
  