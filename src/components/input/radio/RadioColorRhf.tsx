import { RadioButton, type RadioButtonProps } from "primereact/radiobutton"
import { Controller, useFormContext } from 'react-hook-form'

interface FormRadioColorProps extends RadioButtonProps {
    name: string
    index: number
    color: string
    general?: boolean
  }
  
  export const RadioColorRhf = ({
    name,
    index,
    color,
    general = false,
    ...props
  }: FormRadioColorProps) => {
    const { control, setValue } = useFormContext()
    return (
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          return (
            <div className="flex gap-2 items-center">
              <RadioButton
                inputId={field.name}
                {...field}
                style={{ display: 'none' }}
                checked={field.value === props.value}
                {...props}
              />
              {color && (
                <div
                  className={`rounded-full color-index-${index}`}
                  style={{
                    border: `${(general && field.value?.name === props.value?.name) || props.checked
                      ? 'solid 2px text-primary dark:text-primary-dark'
                      : ''}`,
                  }}
                >
                  <div
                    className={'w-8 h-8 rounded-full'}
                    onClick={() => setValue(name, props.value)}
                    style={{
                      backgroundColor: `var(${color})`,
                      border: 'solid 2px white',
                      cursor: 'pointer'
                    }}
                  ></div>
                </div>
              )
              }
            </div >
          )
        }}
      />
    )
  }
  