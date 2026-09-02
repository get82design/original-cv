import { ModifSelectInput } from "@/features/cv-editor/component/custom-cv-input/ModifSelectInput";
import { useInputCvColor } from "@/features/cv-editor/utils/utilsCv/color";
import { useChangeTextFormat } from "@/features/cv-editor/utils/utilsCv/font";
import type { BaseTextSettings } from "@/services/schemas/cvTemplate.schema";
import { useMediaQuery } from "@utils/useWindowWidth";
import type { InputTextProps as PrimeInputTextProps } from "primereact/inputtext";
import { InputText as PrimeInputText } from "primereact/inputtext";
import { OverlayPanel } from "primereact/overlaypanel";
import { useLayoutEffect, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";

interface DataInputProps {
	model: BaseTextSettings;
	changeSize: "1px" | "2px" | "4px";
}

interface InputTextProps extends PrimeInputTextProps {
	name: string;
	label?: string;
	className?: string;
	dataInput: DataInputProps;
	textAlign?: "left" | "center" | "right" | "justify";
	textColor: string;
	forceWidthFull?: boolean;
}

export const InputTextCv = ({
	name,
	label,
	className = "",
	dataInput,
	textAlign = "left",
	textColor,
	forceWidthFull = false,
	...props
}: InputTextProps) => {
	const ref = useRef<HTMLInputElement>(null);
	const op = useRef<OverlayPanel>(null);
	const { control, watch } = useFormContext();
	const { getSize, getWeight } = useChangeTextFormat(dataInput);
	// const watchFont = watch(FieldNameCvModelGeneral.font)
	const isXl = useMediaQuery("(min-width: 1440px)");

	const color = useInputCvColor(textColor);

	useLayoutEffect(() => {
		if (ref.current) {
			ref.current.style.setProperty("--placeholder-color", `var(--${color})`);
		}
	}, [color]);

	return (
		<div className={`card flex ${className} relative`}>
			{!isXl && (
				<OverlayPanel style={{ minWidth: "450px" }} ref={op}>
					<ModifSelectInput />
				</OverlayPanel>
			)}

			<Controller
				name={name}
				control={control}
				render={({ field }) => (
					<PrimeInputText
						{...field}
						style={{
							padding: "0px",
							border: "none",
							boxShadow: "none",
							minWidth: "40px",
							fontFamily: "inherit",
							fontSize: getSize(),
							fontWeight: getWeight(),
							textAlign: textAlign,
							textTransform: "inherit",
							backgroundColor: "transparent",
							color: `var(--${color})`,
							width: forceWidthFull
								? "100%"
								: field.value === "" && props.placeholder
									? `${props.placeholder.length}ch`
									: `${field.value?.length}ch`,
						}}
						onFocus={(e) => op.current && op.current.show(e, e.target)}
						onBlur={(e) => op.current && op.current.hide()}
						ref={ref}
						{...props}
					/>
				)}
			/>
		</div>
	);
};
