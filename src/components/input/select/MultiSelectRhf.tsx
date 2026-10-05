import { MultiSelect, type MultiSelectProps } from "primereact/multiselect";
import { Controller, useFormContext } from "react-hook-form";

interface MultiSelectRhfProps extends MultiSelectProps {
	name: string;
}

export const MultiSelectRhf = ({ name, className = "", ...props }: MultiSelectRhfProps) => {
	const { control } = useFormContext();
	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => (
				<MultiSelect
					inputId={field.name}
					{...props}
					className={className}
					value={field.value ?? []}
					onChange={(e) => field.onChange(e.value ?? [])}
					onBlur={field.onBlur}
				/>
			)}
		/>
	);
};
