import { RadioButton, type RadioButtonProps } from "primereact/radiobutton";
import { Controller, useFormContext } from "react-hook-form";

interface FormRadioProps extends RadioButtonProps {
	name: string;
	label?: string;
}

export function RadioRhf({ name, label, ...props }: FormRadioProps) {
	const { control } = useFormContext();

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
						{...props}
						onChange={(e) => {
							field.onChange(e.value);
							props.onChange?.(e);
						}}
						checked={field.value === props.value}
					/>
					{label && (
						<label htmlFor={name} className="text-xs cursor-pointer">
							{label}
						</label>
					)}
				</div>
			)}
		/>
	);
}
