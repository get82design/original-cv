import type { Color, TemplateCv } from "@utils/trpc.types"
import { Dialog, type DialogProps } from "primereact/dialog"
import { useEffect, useState, type Dispatch, type SetStateAction } from "react"
import { useModelAndColorContext } from "../context/ModelAndColorContext"
import { Button } from "primereact/button"
import { RadioColorRhf } from "@/components/input/radio/RadioColorRhf"
import { RadioButton } from "primereact/radiobutton"
import { trpc } from "@utils/trpc"
import { InputTextRhf } from "@/components/input/input-text/InputTextRhf"
import type { CvFormValues } from "@/services/schemas/cvSave.schema"
import { SelectButton } from "primereact/selectbutton"
import { FieldNameLayoutGeneral } from "../../utils/fields/fieldNameLayoutGeneral"

interface DialogSelectModelProp extends DialogProps {
    modelSelect: TemplateCv | undefined
    setModelSelect: Dispatch<SetStateAction<TemplateCv | undefined>>
    onSelectModel: () => void
    draft: CvFormValues | undefined
    onResumeDraft: () => void
  }
  
  export const DialogSelectModel = ({
    visible,
    onHide,
    modelSelect,
    setModelSelect,
    onSelectModel,
    draft,
    onResumeDraft,
  }: DialogSelectModelProp) => {
    const { colors, modeles } = useModelAndColorContext()
    const options = ['Reprendre brouillon', 'Nouveau CV'];
    const [value, setValue] = useState<string | undefined>(undefined);
  
    const [idModele, setIdModele] = useState('')
    const { data: dataTemplate } = trpc.cvTemplate.findById.useQuery(
        { id: idModele }, 
        { enabled: idModele !== '', staleTime: 3600000 } // staleTime 1h
    )
  
    useEffect(() => {
      if (dataTemplate) {
        setModelSelect(dataTemplate as TemplateCv)
      }
    }, [dataTemplate, setModelSelect])

    const footerTemplate = () => {
      return (
        <div className="w-full flex justify-center">
          <Button
            className="resume-setup-modal__submit-button"
            label={value === 'Nouveau CV' || !draft ? "Selectionner ce modèle" : "Charger le brouillon"}
            onClick={value === 'Nouveau CV' || !draft ? onSelectModel : onResumeDraft}
            disabled={(value === 'Nouveau CV' || !draft) && !modelSelect}
          />
        </div>
      )
    }
    
    return (
      <Dialog
        style={{ minWidth: '1200px' }}
        visible={visible}
        onHide={onHide}
        className="bg-white dark:bg-gray-900"
        header="Modèle de votre CV"
        closable={false}
        footer={footerTemplate}
      >
        <div className="flex flex-col gap-4 py-4">
          {draft ? (
            <div className="w-full flex flex-col justify-center gap-2">
              <p className="text-center font-semibold">Vous avez un CV en cours. Voulez-vous le reprendre ?</p>
              <div className="w-full flex justify-center">
              <SelectButton value={value} onChange={(e) => setValue(e.value)} options={options} />
              </div>
            </div>
          ) : null}
          {/* <div className='w-full flex justify-center gap-2'>
            <InputTextRhf 
                //! penser à remettre le fieldName
                // name={FieldNameCvHeader.nom} 
                name={"datas.header.nom"} 
                label='Nom' 
            />
            <InputTextRhf 
                // name={FieldNameCvHeader.prenom} 
                name={"datas.header.prenom"} 
                label='Prénom' 
            />
          </div> */}
          {value === 'Nouveau CV' || !draft ? (
            <>
              <p className='-mb-2 text-center font-semibold'>Sélectionner une couleur pour votre CV</p>
              <div className="w-full flex justify-center gap-2">
                {colors && colors.length > 0
                  ? colors.map((color: Color, index) => {
                    return (
                      <RadioColorRhf
                        index={index}
                        general={true}
                        className="col" 
                        key={color.name}
                        name={FieldNameLayoutGeneral.primaryColor}
                        // name='layoutGeneral.defaultStyles.primaryColor'
                        color={'--' + color.name + color.primary}
                        value={color}
                      />
                    )
                  })
                  : null}
              </div>
              <p className='text-center font-semibold'>Choisissez un modèle pour votre CV :</p>
              <div className="w-full flex justify-center gap-2">
                {modeles?.map((model, index) => {
                  return (
                    <div className="w-1/4 flex flex-col gap-2 items-center">
                      <label>{model.name}</label>
                      <div
                        className="h-60 w-full flex justify-center"
                        key={model.id}
                        style={{ 
                          backgroundImage: `url(/assets/img/${model.name}.png)`,
                          backgroundSize: "contain",
                          backgroundPosition: "top center",
                          backgroundRepeat: "no-repeat", 
                        }}
                      >
                        <RadioButton
                          className={`radio-select-model-${index}`}
                          checked={idModele === model.id}
                          onChange={(e) => setIdModele(model.id)}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : null}
        </div>
      </Dialog>
    )
  }