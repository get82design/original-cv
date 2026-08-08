interface TitleAppTwoProps {
    firstPart: string
    secondPart: string
    withSpace?: boolean
    // size: 'text-md' | 'text-lg' | 'text-xl' | 'text-2xl' | 'text-3xl' | 'text-4xl' | 'text-5xl'
    size: string
    color?: string
  }
  
  export const TitleAppTwo = ({
    firstPart,
    secondPart,
    withSpace = false,
    size = 'text-3xl',
    color = 'text-primary dark:text-primary-dark',
  }: TitleAppTwoProps) => {
    return (
      <div className="cursor-default">
        <h3 className={`font-light ${size}`}>
          {firstPart}
          {withSpace && ' '}
          <span className={`font-bold uppercase ${color}`} /*style={PrimaryTextColorStyle()}*/ >
            {secondPart}
          </span>
        </h3>
      </div>
    )
  }