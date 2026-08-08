import { ColorForMiniCard } from "@/features/cv-editor/utils/utilsCv/color"
import { Skeleton } from "primereact/skeleton"
import { FaGlobe } from "react-icons/fa"

export const MiniSocialMediaOne = () => {
    return (
      <div className="w-full flex flex-col gap-1">
        <p
          style={{
            fontSize: '10px',
            fontWeight: '600',
            color: `var(--${ColorForMiniCard()})`,
          }}
        >
          Réseaux sociaux
        </p>
        <div className="w-full grid grid-cols-3 gap-1">
          <div className="w-full flex gap-1 items-center">
            <FaGlobe
              style={{
                width: '12px',
                height: '12px',
                color: `var(--${ColorForMiniCard()})`,
              }}
            />
            <div className="w-full flex flex-col gap-0.5">
              <Skeleton className="dark" width="60%" height="8px"></Skeleton>
              <Skeleton width="80%" height="8px"></Skeleton>
            </div>
          </div>
          <div className="w-full flex gap-1 items-center">
            <FaGlobe
              style={{
                width: '12px',
                height: '12px',
                color: `var(--${ColorForMiniCard()})`,
              }}
            />
            <div className="w-full flex flex-col gap-0.5">
              <Skeleton className="dark" width="60%" height="8px"></Skeleton>
              <Skeleton width="80%" height="8px"></Skeleton>
            </div>
          </div>
          <div className="w-full flex gap-1 items-center">
            <FaGlobe
              style={{
                width: '12px',
                height: '12px',
                color: `var(--${ColorForMiniCard()})`,
              }}
            />
            <div className="w-full flex flex-col gap-0.5">
              <Skeleton className="dark" width="60%" height="8px"></Skeleton>
              <Skeleton width="80%" height="8px"></Skeleton>
            </div>
          </div>
        </div>
      </div>
    )
  }