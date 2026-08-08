import type { PropsWithChildren } from "react"

interface AppCardProps extends PropsWithChildren {
    className?: string
  }
  
export const AppCard = ({ children, className }: AppCardProps) => {
    return (
        <div
            className={`p-4 shadow-md rounded-xl bg-white dark:bg-black ${className}`}
            // style={HeaderAppColor()}
        >
            {children}
        </div>
    )
}