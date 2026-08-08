interface CommonListLigneProps {
    watchWithIcon: boolean | undefined
    watchListStyle: "none" | "line" | "point" | undefined
    color: string
    className?: string  // nouveau
}

export const CommonListLigne = ({ watchWithIcon, watchListStyle, color, className }: CommonListLigneProps) => {
    // console.log('color:', color, watchListStyle, watchWithIcon);
    return (
      (watchWithIcon || watchListStyle === "line") && (
        <div
          className={`ligne-list-laterale self-stretch w-0.5  ${
            className ?? "mt-7 -mb-1"
          } ${color === 'transparent'
                ? 'bg-transparent'
                : 'bg-gray-500'
            } ${color === 'transparent'
                ? 'mx-1'
                : 'mx-2.5'}`}
        ></div>
      )
    )
}