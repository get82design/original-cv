import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext"
import { socialIconsRegister } from "@/features/cv-editor/component/template/register/IconSocialMediaRegister"
import { useInputCvColor } from "@/features/cv-editor/utils/utilsCv/color"
import { Button } from "primereact/button"
import { OverlayPanel } from "primereact/overlaypanel"
import { useRef } from "react"
import { FaGlobe } from "react-icons/fa"

interface SelectSocialIconProps {
    icon: string
    color: string
    setIcon: (e: string) => void
    fieldName: string
    afficherCacher?: string
  }
  
  export const SelectSocialIcon = ({
    icon,
    color,
    setIcon,
    fieldName,
    afficherCacher,
  }: SelectSocialIconProps) => {
    const op = useRef<OverlayPanel>(null)
    const colorIcon = useInputCvColor(color)
    const { setSelectModifInput, setSelectInputForm } = useCreateCvContext()

    const Icon = socialIconsRegister[icon] ?? FaGlobe
  
    return (
      <>
        <Button
          text
          rounded
          style={{
            color: `var(--${colorIcon})`,
            width: '2rem',
            height: '2rem',
          }}
          icon={<Icon style={{ width: 20, height: 20 }} />}
          onClick={(e) => {
            setSelectModifInput(fieldName)
            setSelectInputForm(afficherCacher
              ? afficherCacher
              : '')
            op.current && op.current.toggle(e)
          }}
        />
        <OverlayPanel ref={op}>
          <div className="grid grid-cols-10 gap-2">
            {Object.entries(socialIconsRegister).map(([name, IconComp]) => {
              return (
                <button
                    key={name}
                    type="button"
                    className="cursor-pointer flex items-center justify-center p-1 rounded hover:bg-surface-100"
                    onClick={() => {
                    setIcon(name)          // stocke "faLinkedin", etc.
                    op.current?.hide()
                    }}
                >
                    <IconComp style={{ width: 20, height: 20 }} />
                </button>
              )
            })}
          </div>
        </OverlayPanel>
      </>
    )
  }