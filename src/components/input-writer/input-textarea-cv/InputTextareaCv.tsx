import { ModifSelectInput } from "@/features/cv-editor/component/custom-cv-input/ModifSelectInput"
import { useInputCvColor } from "@/features/cv-editor/utils/utilsCv/color"
import { useChangeTextFormat } from "@/features/cv-editor/utils/utilsCv/font"
import type { BaseTextSettings } from "@/services/schemas/cvTemplate.schema"
import { useMediaQuery } from "@utils/useWindowWidth"
import { InputTextarea, type InputTextareaProps } from "primereact/inputtextarea"
import { OverlayPanel } from "primereact/overlaypanel"
import { useLayoutEffect, useRef } from "react"
import { Controller, useFormContext } from "react-hook-form"

interface DataInputProps {
    model: BaseTextSettings
    changeSize: '1px' | '2px' | '4px'
  }
  
  interface TextareaRhfProps extends InputTextareaProps {
    name: string
    label?: string
    className?: string
    dataInput: DataInputProps
    textColor?: string
    textAlign: 'left' | 'right' | 'center' | 'justify' | undefined
  }
  
  export const TextareaCv = ({
    name,
    className,
    dataInput,
    textColor = '000000',
    textAlign,
    ...props
  }: TextareaRhfProps) => {
    const ref = useRef<HTMLTextAreaElement>(null)
    const op = useRef<OverlayPanel>(null);
    const { control } = useFormContext()
    const color = useInputCvColor(textColor)
    const { getSize, getWeight } = useChangeTextFormat(dataInput)
    const isXl = useMediaQuery('(min-width: 1440px)')
  
    useLayoutEffect(() => {
      if (ref.current) {
        ref.current.style.setProperty('--placeholder-color', `var(--${color})`)
      }
    }, [color])
  
    return (
      <span className={`w-full ${className}`}>
        {!isXl &&
          <OverlayPanel style={{ minWidth: "450px" }} ref={op}>
            <ModifSelectInput />
          </OverlayPanel>
        }
        <Controller
          name={name}
          control={control}
          render={({ field, fieldState }) => (
            <>
              <InputTextarea
                {...field}
                id={name}
                rows={1}
                className={'w-full'}
                style={{
                  resize: 'none',
                  padding: '0px',
                  fontSize: getSize(),
                  fontWeight: getWeight(),
                  lineHeight: 1.2,
                  textAlign: textAlign,
                  backgroundColor: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                  color: `var(--${color})`,
                  height: 'auto',
                  fontFamily: "inherit",
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    if (e.preventDefault) e.preventDefault()
                    return false
                  }
                }}
                onFocus={(e) => op.current && op.current.show(e, e.target)}
                onBlur={(e) => op.current && op.current.hide()}
                autoResize
                ref={ref}
                {...props}
              />
              {fieldState.error && (
                <span className="text-red-500 text-xs -mt-1 mb-1">
                  {fieldState.error.message}
                </span>
              )}
            </>
          )}
        />
      </span>
    )
  }