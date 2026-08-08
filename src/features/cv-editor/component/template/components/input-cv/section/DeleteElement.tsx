import { useFormContext } from "react-hook-form"
import { FaTimes } from "react-icons/fa"

interface DeleteElementProps {
  index: number
  idx: number
  itemSelected: string
  itemClientKey: string
  deleteElmOfList: (index: number, idx: number) => void
  pathContent: string
}

export const DeleteElement = ({
  index,
  idx,
  itemSelected,
  itemClientKey,
  deleteElmOfList,
  pathContent,
}: DeleteElementProps) => {
  const { watch } = useFormContext()
  const hasContent = Boolean(
    watch(`${pathContent}.missions.${idx}.content.content`),
  )
  const isSelected = itemSelected === itemClientKey

  if (!hasContent || !isSelected) return null

  return (
    <div className="absolute top-1.5 -right-8">
      <FaTimes
        onClick={(e) => {
          e.stopPropagation()
          deleteElmOfList(index, idx)
        }}
        className="cursor-pointer"
      />
    </div>
  )
}
