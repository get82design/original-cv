import { useEffect, useRef, useState } from "react"
import { useFormContext } from "react-hook-form"
import { moduleField } from "@/features/cv-editor/utils/fields/moduleField"
import type { ListItem } from "@utils/type"
type UseSectionListArgs<TItem, TSettings> = {
  contentField: string           // FieldNameX.content
  moduleType: string             // 'language' | 'socialMedia' | 'skill' ...
  createInit: (opts: {
    order: number
    settings?: TSettings
  }) => ListItem<TItem>
}
export function useSectionList<TItem, TSettings>({
  contentField,
  moduleType,
  createInit,
}: UseSectionListArgs<TItem, TSettings>) {
  const { watch, setValue } = useFormContext()
  const hasSeededRef = useRef(false)
  const [itemSelected, setItemSelected] = useState("")
  const items: ListItem<TItem>[] = watch(contentField) || []
  const pathSettingsContent = moduleField(
    watch("modules"),
    moduleType,
    "settings",
    "content",
  )
  
  const settingsContent: TSettings | undefined = pathSettingsContent
    ? watch(pathSettingsContent)
    : undefined

  const createNewItem = () =>
    createInit({
      order: items.length + 1,
      ...(settingsContent !== undefined
        ? { settings: settingsContent }
        : {}),
    })

  useEffect(() => {
    if (!hasSeededRef.current && items.length === 0 && settingsContent) {
      hasSeededRef.current = true
      setValue(contentField, [createInit({ order: 1, settings: settingsContent })])
    }
    if (items.length > 0) hasSeededRef.current = true
  }, [items, setValue, settingsContent, contentField, createInit])

  return {
    items,
    settingsContent,
    itemSelected,       // ex-sexionSelected
    setItemSelected,
    createNewItem,
  }
}