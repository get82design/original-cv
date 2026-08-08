import { useModelAndColorContext } from "@/features/cv-editor/component/context/ModelAndColorContext"
import { GetPrimaryColor, GetPrimaryColorApercu } from "@/features/cv-editor/utils/utilsCv/color"
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema"
import type { Color } from "@utils/trpc.types"
import { cloneElement, type JSX } from "react"

interface TitleSectionContainerProps {
    icon: JSX.Element | undefined,
    inputOutput: JSX.Element,
    general: TemplateLayout,
    modelName: string | undefined,
    primaryColor?: Color
  }
  
  export const TitleSectionContainer = ({
    icon,
    inputOutput,
    general,
    modelName,
    primaryColor
  }: TitleSectionContainerProps) => {
    const primaryColorValue = primaryColor
      ? GetPrimaryColorApercu(primaryColor)
      : GetPrimaryColor()
    const { colors } = useModelAndColorContext()
    const watchLigneDessus = general.titleSection.withLigneDessus
    const watchLigneDessous = general.titleSection.withLigneDessous
    const watchWithIcon = general.titleSection.withIcon
    const watchIconStyle = general.titleSection.iconStyle
    const watchIconColor = general.titleSection.iconColor ?? 'primaryColor'

    const [name, info1, info2] = modelName?.split('-') ?? []

    const resolveColorToken = (colorName: string | undefined) => {
      if (!colorName || colorName === 'primaryColor') {
        return primaryColorValue
      }
      const found = colors?.find((color) => color.name === colorName)
      return found ? `${found.name}${found.primary ?? ''}` : primaryColorValue
    }

    // Style "icon" : couleur de l’icône = iconColor
    // Styles flat/rounded : fond = primary, icône sombre pour le contraste
    const iconFgToken =
      watchIconStyle === 'icon'
        ? resolveColorToken(watchIconColor)
        : 'white'

    const iconBg =
      watchIconStyle === 'icon'
        ? 'transparent'
        : primaryColorValue
          ? `var(--${primaryColorValue})`
          : 'transparent'

    const iconBorderRadius =
      watchIconStyle === 'flat'
        ? '15%'
        : watchIconStyle === 'rounded'
          ? '50%'
          : '0'

    const iconColorCss = iconFgToken ? `var(--${iconFgToken})` : undefined

    const coloredIcon =
      icon &&
      cloneElement(icon, {
        style: {
          ...(icon.props?.style ?? {}),
          color: iconColorCss,
          width: icon.props?.style?.width ?? '16px',
          height: icon.props?.style?.height ?? '16px',
        },
      })
  
    return (
      <>
        {watchLigneDessus && (
          <div
            style={{
              backgroundColor: primaryColorValue
                ? `var(--${primaryColorValue})`
                : undefined,
              opacity: '0.5',
              height: '1px',
            }}
            className="w-full"
          ></div>
        )}
        <div className="w-full flex gap-2 items-center title-section-correctif">
          {watchWithIcon && coloredIcon && (
            <div
              className="flex justify-center items-center mt-1"
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: iconBg,
                borderRadius: iconBorderRadius,
                padding: '4px',
                color: iconColorCss,
              }}
            >
              {coloredIcon}
            </div>
          )}
          {inputOutput}
        </div>
        {watchLigneDessous && (
          <div
            style={{
              backgroundColor: primaryColorValue
                ? `var(--${primaryColorValue})`
                : undefined,
              opacity: '0.5',
              height: '1px',
            }}
            className={`w-full ${watchLigneDessus
              || info1 === 'line'
              ? ''
              : '-mt-1'
              } mb-0.5`}
          ></div>
        )}
      </>
    )
  }
