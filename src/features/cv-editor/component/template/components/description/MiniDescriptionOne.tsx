import { ColorForMiniCard } from "@/features/cv-editor/utils/utilsCv/color"
import { Skeleton } from "primereact/skeleton"

export const MiniDescriptionOne = () => {
    return (
      <div className="flex flex-col gap-1">
        <p
          style={{
            fontSize: '10px',
            fontWeight: '600',
            color: `var(--${ColorForMiniCard()})`,
          }}
        >
          Présentation
        </p>
        <Skeleton width="100%" height="2rem"></Skeleton>
      </div>
    )
  }