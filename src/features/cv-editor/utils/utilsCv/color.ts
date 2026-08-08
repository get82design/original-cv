import { useFormContext } from "react-hook-form"
import { useModelAndColorContext } from "../../component/context/ModelAndColorContext"
import type { Color } from "@utils/trpc.types"
import { useEffect, useState } from "react"
import { FieldNameLayoutGeneral } from "../fields/fieldNameLayoutGeneral"

export const useInputCvColor = (textColor: string) => {
    const { watch } = useFormContext()
    const { colors } = useModelAndColorContext()
    const watchPrimaryColor = watch('layoutGeneral.defaultStyles.primaryColor')
    let color = ''
    if (textColor !== 'primaryColor') {
      const tempColor = colors.find((color: Color) => color.name === textColor)
      color = tempColor
        ? tempColor?.name + tempColor?.primary
        : ''
    } else {
      color = watchPrimaryColor.name + watchPrimaryColor.primary
    }
    return color
}

export const ColorForMiniCard = () => {
    const { watch } = useFormContext()
    const { colors } = useModelAndColorContext()
    const watchPrimaryColor = watch(FieldNameLayoutGeneral.primaryColor)
    return watchPrimaryColor && colors
      ? watchPrimaryColor.name === 'black'
        ? 'dark:white'
        : watchPrimaryColor.name + watchPrimaryColor.primary
      : ''
  }

export const GetPrimaryColor = () => {
    const { watch } = useFormContext()
    const watchPrimaryColor = watch(FieldNameLayoutGeneral.primaryColor)
    const [primaryColor, setPrimaryColor] = useState('')
  
    useEffect(() => {
      if (watchPrimaryColor) {
        setPrimaryColor(watchPrimaryColor.name + (watchPrimaryColor.primary ?? ''))
      }
    }, [watchPrimaryColor])
  
    return primaryColor
}

export const GetPrimaryColorApercu = (primaryColor: Color) => {
  return (
    primaryColor.name + primaryColor.primary
  )
}