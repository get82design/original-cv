import { MdDelete, MdOutlineOpenWith } from "react-icons/md"
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";

type SectionItemShellProps = {
    clientKey: string
    /** ex: "language" | "experience" | "socialMedia" — un seul token partout */
    sectionId: string
    containerId: string          // pour dnd-kit data
    path: string                 // FieldNameX.content
    sortableData?: Record<string, unknown> // skillsPath, etc.
    itemSelected: string
    setItemSelected: (key: string) => void
    /** match selectModifInput — défaut = sectionId */
    modifMatch?: string
    onDelete?: () => void
    showListLigne?: boolean
    listLigne?: React.ReactNode  // ou laisser le parent wrap
    toolbarExtra?: React.ReactNode // "options"
    /** à gauche du contenu — ex. CommonListLigne */
    leading?: React.ReactNode 
    /** className du wrapper externe (flex gap-2 pour experience/skill) */
    className?: string
    sortableType?: "card" | "subcard"
    children: React.ReactNode
}

export function SectionItemShell({
    clientKey,
    sectionId,
    containerId,
    path,
    sortableData,
    itemSelected,
    setItemSelected,
    modifMatch = sectionId,
    onDelete,
    toolbarExtra,
    leading,
    className,
    children,
    sortableType = "card",
  }: SectionItemShellProps) {
    const { selectModifInput, sectionSelected, setSectionSelected } =
      useCreateCvContext()
  
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
      useSortable({
        id: clientKey,
        data: { type: sortableType, containerId, path, ...sortableData },
      })
  
    const isItemSelected = clientKey === itemSelected
    const sectionKey = `section-${sectionId}`
    const showToolbar =
      selectModifInput.includes(modifMatch) && isItemSelected
    const highlight =
      isItemSelected && sectionSelected.includes(sectionId)
  
    return (
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.5 : 1,
        }}
        className={`section-card relative ${className} ${highlight ? "bg-gray-100 rounded-lg" : ""}`}
      >
        {leading}
        <div
          className={`relative w-full ${
            showToolbar && sectionSelected.includes(sectionId)
              ? "rounded-lg bg-gray-100"
              : ""
          }`}
          onClick={(e) => {
            e.stopPropagation()
            setItemSelected(clientKey)
            setSectionSelected(sectionKey)
          }}
        >
          {showToolbar && (
            <div className="absolute w-auto right-0 -top-10 flex justify-center">
              <div className="rounded-lg bg-white border-2 border-gray-100 flex">
                <div className="p-2" {...listeners} {...attributes}>
                  <MdOutlineOpenWith className="cursor-pointer" style={{ width: 20, height: 20 }} />
                </div>
                {toolbarExtra}
                {onDelete && (
                  <div
                    className="p-2 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete()
                    }}
                  >
                    <MdDelete style={{ width: 20, height: 20, color: "var(--red-500)" }} />
                  </div>
                )}
              </div>
            </div>
          )}
          {children}
        </div>
      </div>
    )
  }