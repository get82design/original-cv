import { useEffect, useState, type PropsWithChildren } from "react"
import { FormProvider, useForm } from 'react-hook-form'
import type { CvSaveInput } from "../../../../services/schemas/cvSave.schema"
import { formCvDefaultValue } from "./defaultValue"
import { trpc } from "@utils/trpc"
import type { TemplateCv } from "@utils/trpc.types"
import { DialogSelectModel } from "./DialogSelectModel"
import { applyTemplateToForm } from "../../utils/applyTemplateToForm"

interface FormCvProviderProps extends PropsWithChildren {
    idCv: string | null
    exemple: string | null
  }
  
  export const FormCv = ({ children, idCv, exemple }: FormCvProviderProps) => {
    const [visibleSelectModel, setVisibleSelectModel] = useState(false)
    const [modelSelect, setModelSelect] = useState<TemplateCv>()
    const { data: dataCv } = trpc.cv.byId.useQuery({ id: idCv as string }, { enabled: idCv !== '0' })
  
    const methods = useForm<CvSaveInput>({
      // resolver: yupResolver(validationSchema),
      shouldFocusError: false, //! Régler l'erreur quand shouldFocus est à true
      mode: 'onSubmit',
      defaultValues: formCvDefaultValue,
    })
    const {
      handleSubmit,
      // formState: { errors },
      reset,
      setValue,
    } = methods
  
    useEffect(() => {
      if (idCv === '0' && !exemple) {
        setVisibleSelectModel(true)
      }
    //   if (idCv === '0' && exemple) {
    //     const dataExemple = dataExemples.find((ex) => ex.id === exemple)
    //     reset(dataExemple)
    //   }
    }, [idCv, exemple, reset])
  
    useEffect(() => {
      if (dataCv) {
        console.log('dataCv => ', dataCv)
        // reset({ ...dataCv as CvSaveInput, id: idCv as string })
      }
    }, [dataCv, reset])
  
    const onSelectModel = () => {
      if (modelSelect) {
        // console.log('modelSelect => ', modelSelect)
        reset(applyTemplateToForm(methods.getValues() as CvSaveInput, modelSelect, { updateModules: true }))
        setVisibleSelectModel(false)
      }
    }
  
    const onSubmit = (cv: CvSaveInput) => {
      const _cv = { ...cv, }
      console.log('Form Send cv => ', _cv)
    }

    return (
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {children}
          {visibleSelectModel && 
            <DialogSelectModel
                visible={visibleSelectModel}
                onHide={() => setVisibleSelectModel(false)}
                // dataModels={dataModels}
                modelSelect={modelSelect}
                setModelSelect={setModelSelect}
                onSelectModel={onSelectModel}
            />
          }
        </form>
      </FormProvider>
    )
  }