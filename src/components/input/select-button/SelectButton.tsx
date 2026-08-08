import type { SelectButtonProps as SelectButtonPrimeProps } from 'primereact/selectbutton'
import { useFormContext } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { SelectButton as SelectButtonPrime } from 'primereact/selectbutton'

interface SelectButtonProps extends SelectButtonPrimeProps {
    name: string;
    options: unknown[]
}

export const SelectButtonRhf = ({ name, options, ...props }: SelectButtonProps) => {
    const { control } = useFormContext()
    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <SelectButtonPrime
                    options={options}
                    {...field}
                    className={`${props.className}`}
                    checked={field.value === props.value}
                    {...props}
                    unselectable={false}
                />
            )}
        />
    )
}