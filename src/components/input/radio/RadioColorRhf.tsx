import { RadioButton, type RadioButtonProps } from "primereact/radiobutton";
import { Controller, useFormContext } from "react-hook-form";

interface FormRadioColorProps extends RadioButtonProps {
	name: string;
	index: number;
	color: string;
	general?: boolean;
	swatchSize?: "xs" | "sm" | "md";
}

export const RadioColorRhf = ({
	name,
	index,
	color,
	general = false,
	swatchSize = "md",
	...props
}: FormRadioColorProps) => {
	const { control, setValue } = useFormContext();
	const sizeClass =
		swatchSize === "xs" ? "w-4 h-4" : swatchSize === "sm" ? "w-5 h-5" : "w-8 h-8";
	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => {
				const selected = general
					? field.value?.name === props.value?.name
					: field.value === props.value || props.checked;
				return (
					<div className="flex gap-2 items-center">
						<RadioButton
							inputId={field.name}
							{...field}
							style={{ display: "none" }}
							checked={field.value === props.value}
							{...props}
						/>
						{color && (
							<div
								className={`rounded-full color-index-${index}`}
								style={{
									border: `${
										(general && field.value?.name === props.value?.name) ||
										props.checked
											? "solid 2px text-primary dark:text-primary-dark"
											: ""
									}`,
								}}
							>
								<button
									type="button"
									className={`${sizeClass} rounded-full ring-1 ring-inset ring-gray-400 dark:ring-gray-500`}
									onClick={() => setValue(name, props.value)}
									style={{
										backgroundColor: `var(${color})`,
										outline: selected
											? "2px solid var(--teal-500)"
											: "2px solid transparent",
										outlineOffset: "1px",
										cursor: "pointer",
									}}
								></button>
							</div>
						)}
					</div>
				);
			}}
		/>
	);
};
