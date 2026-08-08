import type { BaseTextSettings } from "@/services/schemas/cvTemplate.schema"

export const useChangeTextFormat = (
    dataInput: {
      model: BaseTextSettings,
      changeSize: '1px' | '2px' | '4px'
    }
  ) => {
    let size: string = dataInput.model?.sizeModel
    let weight: number = dataInput.model?.weightModel
  
    const getSize = () => {
      if (dataInput.model?.sizeSelect === 'xs') {
        size = `calc(${dataInput.model?.sizeModel} - 2 * ${dataInput.changeSize})`
      }
      if (dataInput.model?.sizeSelect === 'sm') {
        size = `calc(${dataInput.model?.sizeModel} - ${dataInput.changeSize})`
      }
      if (dataInput.model?.sizeSelect === 'lg') {
        size = `calc(${dataInput.model?.sizeModel} + ${dataInput.changeSize})`
      }
      if (dataInput.model?.sizeSelect === 'xl') {
        size = `calc(${dataInput.model?.sizeModel} + 2 * ${dataInput.changeSize})`
      }
      return size
    }
  
    const getWeight = () => {
      if (dataInput.model?.weightSelect === 'xs') {
        weight = dataInput.model?.weightModel - 200
      }
      if (dataInput.model?.weightSelect === 'sm') {
        weight = dataInput.model?.weightModel - 100
      }
      if (dataInput.model?.weightSelect === 'lg') {
        weight = dataInput.model?.weightModel + 100
      }
      if (dataInput.model?.weightSelect === 'xl') {
        weight = dataInput.model?.weightModel + 200
      }
      // return fontweight.find((font) => font.value === weight).name;
      return weight
    }
  
    return { getSize, getWeight }
  }