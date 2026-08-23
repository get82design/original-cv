import { Dropdown, type DropdownProps } from "primereact/dropdown";
import { Controller, useFormContext } from "react-hook-form";
interface SelectRhfProps extends DropdownProps {
	name: string;
}
export const SelectRhf = ({
	name,
	className = "",
	...props
}: SelectRhfProps) => {
	const { control } = useFormContext();
	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => (
				<Dropdown
					inputId={field.name}
					{...props}
					className={className}
					value={field.value}
					onChange={(e) => field.onChange(e.value)}
					onBlur={field.onBlur}
				/>
			)}
		/>
	);
};
