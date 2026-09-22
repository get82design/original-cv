import { Controller, useFormContext } from "react-hook-form";
import {
	InputText as PrimeInputText,
	type InputTextProps as PrimeInputTextProps,
} from "primereact/inputtext";
import { useRef } from "react";

interface InputTextProps extends PrimeInputTextProps {
	name: string;
	label?: string;
	className?: string;
	fontSize: string;
	weight: number;
	// dataInput: DataInputProps;
	textAlign?: "left" | "center" | "right" | "justify";
	textColor: string;
	forceWidthFull?: boolean;
}

export const InputTextProfile = ({
	name,
	label,
	className,
	fontSize,
	weight,
	textAlign,
	textColor,
	forceWidthFull,
	...props
}: InputTextProps) => {
	const ref = useRef<HTMLInputElement>(null);
	const { control } = useFormContext();
	return (
		<div className={`card flex ${textColor} ${className} flex-col gap-0 relative`}>
			<Controller
				name={name}
				control={control}
				render={({ field, fieldState }) => (
					<>
						<PrimeInputText
							{...field}
							style={{
								padding: "0px",
								border: "none",
								boxShadow: "none",
								minWidth: "40px",
								// fontFamily: watchFont?.family ? watchFont.family : '',
								fontSize: fontSize,
								fontWeight: weight,
								textAlign: textAlign,
								textTransform: "inherit",
								backgroundColor: "transparent",
								color: `inherit`,
								width: forceWidthFull
									? "100%"
									: field.value === "" && props.placeholder
										? `${props.placeholder.length}ch`
										: `${field.value?.length}ch`,
								// field.value === '' || forceWidthFull
								//     ? `100%`
								//     : `${field.value?.length}ch`,
							}}
							ref={ref}
							{...props}
						/>
						{fieldState.error && (
							<span className="text-red-500 text-xs">{fieldState.error.message}</span>
						)}
					</>
				)}
			/>
		</div>
	);
};
