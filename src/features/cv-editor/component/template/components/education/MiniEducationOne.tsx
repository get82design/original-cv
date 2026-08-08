import { ColorForMiniCard } from "@/features/cv-editor/utils/utilsCv/color"
import { Skeleton } from "primereact/skeleton"

export const MiniEducationOne = () => {
    return (
      <div className="w-full flex flex-col gap-1">
        <p
          style={{
            fontSize: '10px',
            fontWeight: '600',
            color: `var(--${ColorForMiniCard()})`,
          }}
        >
          Diplome
        </p>
        <div className="w-full flex justify-between">
          <div className="w-2/3 flex flex-col gap-1">
            <Skeleton className="dark" width="60%" height="8px"></Skeleton>
            <Skeleton width="60%" height="8px"></Skeleton>
          </div>
          <div className="w-1/4 flex flex-col gap-1">
            <div
              className="w-full rounded-lg"
              style={{
                height: '8px',
                backgroundColor: `var(--${ColorForMiniCard()})`,
              }}
            ></div>
          </div>
        </div>
      </div>
    )
  }