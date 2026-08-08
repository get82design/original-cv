import { RadioButton, type RadioButtonProps } from "primereact/radiobutton";
import { Controller, useFormContext } from "react-hook-form";

interface FormRadioProps extends RadioButtonProps {
    name: string;
    label?: string;
  }
  
  export function RadioRhf({ name, label, ...props }: FormRadioProps) {
    const { control } = useFormContext()
  
    return (
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex gap-2 items-center">
            <RadioButton
              inputId={field.name}
              {...field}
              className={`${props.className}`}
              checked={field.value === props.value}
              {...props}
            />
            {label && <label htmlFor={name}>{label}</label>}
          </div>
        )}
      />
    )
  }