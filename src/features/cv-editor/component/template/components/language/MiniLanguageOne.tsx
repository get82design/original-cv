import { ColorForMiniCard } from "@/features/cv-editor/utils/utilsCv/color"
import { Skeleton } from "primereact/skeleton"
import { MdStar } from "react-icons/md"

export const MiniLanguageOne = () => {
    return (
      <div className="w-full flex flex-col gap-1">
        <p
          style={{
            fontSize: '10px',
            fontWeight: '600',
            color: `var(--${ColorForMiniCard()})`,
          }}
        >
          Langues
        </p>
        <div className="w-full grid grid-cols-3 gap-1">
          <div className="w-full flex gap-1 items-center">
            <Skeleton width="60%" height="8px"></Skeleton>
            <div className="w-full flex gap-0 items-center">
              <MdStar
                style={{
                  width: '10px',
                  height: '10px',
                  color: `var(--${ColorForMiniCard()})`,
                }}
              />
              <MdStar
                style={{
                  width: '10px',
                  height: '10px',
                  color: `var(--${ColorForMiniCard()})`,
                }}
              />
              <MdStar
                style={{
                  width: '10px',
                  height: '10px',
                  color: `var(--${ColorForMiniCard()})`,
                }}
              />
              <MdStar
                style={{
                  width: '10px',
                  height: '10px',
                  color: `var(--${ColorForMiniCard()})`,
                }}
              />
              <MdStar
                style={{
                  width: '10px',
                  height: '10px',
                  color: `var(--${ColorForMiniCard()})`,
                }}
              />
            </div>
          </div>
          <div className="w-full flex gap-1 items-center">
            <Skeleton width="60%" height="8px"></Skeleton>
            <div className="w-full flex gap-0 items-center">
              <MdStar
                style={{
                  width: '10px',
                  height: '10px',
                  color: `var(--${ColorForMiniCard()})`,
                }}
              />
              <MdStar
                style={{
                  width: '10px',
                  height: '10px',
                  color: `var(--${ColorForMiniCard()})`,
                }}
              />
              <MdStar
                style={{
                  width: '10px',
                  height: '10px',
                  color: `var(--${ColorForMiniCard()})`,
                }}
              />
              <MdStar
                style={{
                  width: '10px',
                  height: '10px',
                  color: `var(--${ColorForMiniCard()})`,
                }}
              />
              <MdStar
                style={{
                  width: '10px',
                  height: '10px',
                  color: `var(--gray-400)`,
                }}
              />
            </div>
          </div>
          <div className="w-full flex gap-1 items-center">
            <Skeleton width="60%" height="8px"></Skeleton>
            <div className="w-full flex gap-0 items-center">
              <MdStar
                style={{
                  width: '10px',
                  height: '10px',
                  color: `var(--${ColorForMiniCard()})`,
                }}
              />
              <MdStar
                style={{
                  width: '10px',
                  height: '10px',
                  color: `var(--${ColorForMiniCard()})`,
                }}
              />
              <MdStar
                style={{
                  width: '10px',
                  height: '10px',
                  color: `var(--${ColorForMiniCard()})`,
                }}
              />
              <MdStar
                style={{
                  width: '10px',
                  height: '10px',
                  color: `var(--gray-400)`,
                }}
              />
              <MdStar
                style={{
                  width: '10px',
                  height: '10px',
                  color: `var(--gray-400)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }