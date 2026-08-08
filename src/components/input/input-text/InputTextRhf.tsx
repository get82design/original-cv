import type { InputTextProps as PrimeInputTextProps } from 'primereact/inputtext'
import { InputText as PrimeInputText } from 'primereact/inputtext'
import { useFormContext } from 'react-hook-form'
import { Controller } from 'react-hook-form'

interface InputTextProps extends PrimeInputTextProps {
    name: string
    label?: string
    className?: string
  }
  
  export const InputTextRhf = ({ name, label, className = '', ...props }: InputTextProps) => {
    const { control, formState: { errors } } = useFormContext()
    return (
      <div className={`card flex flex-col gap-0 ${className}`}>
        <span className='p-float-label w-full'>
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <PrimeInputText
                className={`w-full ${errors[name] && 'p-invalid'}`}
                {...field}
                // value={field.value}
                // style={InputAppColor()}
                {...props}
              />
            )}
          />
          <label /*style={PrimaryTextColorStyle()}*/ htmlFor={name}>{label && label}</label>
        </span>
        {errors[name]?.message && <p className='text-sm p-error'>{errors[name]?.message as string}</p>}
      </div>
    )
  }