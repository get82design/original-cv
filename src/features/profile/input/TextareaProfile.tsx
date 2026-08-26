import { InputTextarea, type InputTextareaProps } from "primereact/inputtextarea"
import { Controller, useFormContext } from "react-hook-form"

interface TextareaProfileProps extends InputTextareaProps {
    name: string
    label?: string
    className?: string
    fontSize: string
    weight: number
    textAlign: 'left' | 'justify' | 'center' | 'right'
    pressEnter?: boolean
}

export const TextareaProfile = ({
    name,
    label,
    className,
    fontSize,
    weight,
    textAlign,
    pressEnter = false,
    ...props
}: TextareaProfileProps) => {
    const {control} = useFormContext()
    return (
        <span className={`w-full ${className}`}>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <InputTextarea
                        id={name}
                        rows={1}
                        className={'w-full text-black dark:text-white'}
                        {...field}
                        {...props}
                        style={{
                            resize: 'none',
                            padding: '0px',
                            fontSize: fontSize,
                            fontWeight: weight,
                            lineHeight: 1.2,
                            textAlign: textAlign,
                            backgroundColor: 'transparent',
                            border: 'none',
                            boxShadow: 'none',
                            // color: darkMode
                            //     ? 'white'
                            //     : 'black',
                            height: 'auto',
                        }}
                        // onBlur={
                        //     //! forcer la mise a jour
                        // }
                        onKeyDown={(e) => {
                            if (!pressEnter && e.key === 'Enter' && !e.shiftKey) {
                                // console.log('test', e);
                                if (e.preventDefault) e.preventDefault()
                                return false
                            }
                        }}
                        autoResize
                    />
                )}
            />
        </span>
    )
}