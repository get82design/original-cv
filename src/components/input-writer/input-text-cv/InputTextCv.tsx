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
	/** Ne pas appliquer le fg de colonne (ex. pastille tag sur fond primary). */
	ignoreColumnFg?: boolean;
}

export const InputTextCv = ({
	name,
	label,
	className = "",
	dataInput,
	textAlign = "left",
	textColor,
	forceWidthFull = false,
	ignoreColumnFg = false,
	onFocus,
	onBlur,
	...props
}: InputTextProps) => {
	const ref = useRef<HTMLInputElement>(null);
	const op = useRef<OverlayPanel>(null);
	const { control } = useFormContext();
	const { getSize, getWeight } = useChangeTextFormat(dataInput);
	const isLg = useMediaQuery("(min-width: 1024px)");

	const color = useInputCvColor(textColor, { ignoreColumnFg });

	useLayoutEffect(() => {
		if (ref.current) {
			ref.current.style.setProperty("--placeholder-color", `var(--${color})`);
		}
	}, [color]);

	return (
		<div className={`card flex ${className} relative`}>
			{!isLg && (
				<OverlayPanel style={{ minWidth: "450px" }} ref={op}>
					<ModifSelectInput />
				</OverlayPanel>
			)}

			<Controller
				name={name}
				control={control}
				render={({ field, fieldState }) => (
					<>
						<PrimeInputText
							{...field}
							{...props}
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
							onKeyDown={(e) => {
								// Évite le submit HTML implicite du <form> parent (Entrée).
								if (e.key === "Enter") e.preventDefault();
								props.onKeyDown?.(e);
							}}
							onFocus={(e) => {
								const y = window.scrollY;
								const x = window.scrollX;
								op.current?.show(e, e.target);
								requestAnimationFrame(() => {
									if (window.scrollY !== y || window.scrollX !== x) {
										window.scrollTo({ top: y, left: x, behavior: "auto" });
									}
								});
								onFocus?.(e);
							}}
							onBlur={(e) => {
								op.current?.hide();
								onBlur?.(e);
							}}
							ref={ref}
						/>
						{fieldState.error && (
							<span className="text-red-500 text-xs -mt-1 mb-1">{fieldState.error.message}</span>
						)}
					</>
				)}
			/>
		</div>
	);
};
