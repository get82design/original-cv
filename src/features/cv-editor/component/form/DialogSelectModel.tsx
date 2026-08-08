import type { Color, TemplateCv } from "@utils/trpc.types"
import { Dialog, type DialogProps } from "primereact/dialog"
import { useEffect, useState, type Dispatch, type SetStateAction } from "react"
import { useModelAndColorContext } from "../context/ModelAndColorContext"
import { Button } from "primereact/button"
import { RadioColorRhf } from "@/components/input/radio/RadioColorRhf"
import { RadioButton } from "primereact/radiobutton"
import { trpc } from "@utils/trpc"
import { InputTextRhf } from "@/components/input/input-text/InputTextRhf"

interface DialogSelectModelProp extends DialogProps {
    modelSelect: TemplateCv | undefined
    setModelSelect: Dispatch<SetStateAction<TemplateCv | undefined>>
    onSelectModel: () => void
  }
  
  export const DialogSelectModel = ({
    visible,
    onHide,
    modelSelect,
    setModelSelect,
    onSelectModel,
  }: DialogSelectModelProp) => {
    const { colors, modeles } = useModelAndColorContext()
  
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
            label="Selectionner ce modèle"
            onClick={() => onSelectModel()}
            disabled={!modelSelect}
          />
        </div>
      )
    }
    
    return (
      <Dialog
        style={{ minWidth: '800px' }}
        visible={visible}
        onHide={onHide}
        className="bg-white dark:bg-gray-900"
        // className={classes.join(' ')}
        header="Modèle de votre CV"
        closable={false}
        footer={footerTemplate}
      >
        <div className="flex flex-col gap-4 py-4">
          <div className='w-full flex justify-center gap-2'>
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
          </div>
          <p className='-mb-2'>Sélectionner une couleur pour votre CV</p>
          <div className="w-full flex justify-center gap-2">
            {colors && colors.length > 0
              ? colors.map((color: Color, index) => {
                return (
                  <RadioColorRhf
                    index={index}
                    general={true}
                    className="col" 
                    key={color.name}
                    // name={FieldNameCv.primaryColor}
                    name='layoutGeneral.defaultStyles.primaryColor'
                    color={'--' + color.name + color.primary}
                    value={color}
                  />
                )
              })
              : null}
          </div>
          <p>Choisissez un modèle pour votre CV :</p>
          <div className="w-full flex justify-center gap-2">
            {modeles?.map((model, index) => {
              return (
                <div
                  className="w-1/3 flex flex-col gap-2 items-center"
                  key={model.id}
                >
                  <RadioButton
                    className={`radio-select-model-${index}`}
                    checked={idModele === model.id}
                    onChange={(e) => setIdModele(model.id)}
                  />
                  <label>{model.name}</label>
                </div>
              )
            })}
          </div>
        </div>
      </Dialog>
    )
  }