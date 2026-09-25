import { ModifSelectInput } from "@/features/cv-editor/component/custom-cv-input/ModifSelectInput";
import { useInputCvColor } from "@/features/cv-editor/utils/utilsCv/color";
import { useChangeTextFormat } from "@/features/cv-editor/utils/utilsCv/font";
import type { BaseTextSettings } from "@/services/schemas/cvTemplate.schema";
import { useMediaQuery } from "@utils/useWindowWidth";
import { InputTextarea, type InputTextareaProps } from "primereact/inputtextarea";
import { OverlayPanel } from "primereact/overlaypanel";
import { useLayoutEffect, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";

interface DataInputProps {
	model: BaseTextSettings;
	changeSize: "1px" | "2px" | "4px";
}

interface TextareaRhfProps extends InputTextareaProps {
	name: string;
	label?: string;
	className?: string;
	dataInput: DataInputProps;
	textColor?: string;
	textAlign: "left" | "right" | "center" | "justify" | undefined;
	/** Autorise Entrée pour un vrai retour à la ligne (défaut : Shift+Entrée). */
	allowNewline?: boolean;
}

/** Event name to force a height recalc (e.g. after gallery scale is ready). */
export const CV_TEXTAREA_RECALC_EVENT = "cv-textarea-recalc";

export function fitTextareaHeight(el: HTMLTextAreaElement) {
	if (el.getBoundingClientRect().width <= 0) return false;
	el.style.height = "auto";
	el.style.height = `${el.scrollHeight}px`;
	return true;
}

export function remesureTextareas(root: ParentNode) {
	root.querySelectorAll("textarea").forEach((node) => {
		fitTextareaHeight(node as HTMLTextAreaElement);
	});
}

export const TextareaCv = ({
	name,
	className,
	dataInput,
	textColor = "000000",
	textAlign,
	allowNewline = false,
	onFocus,
	onBlur,
	...props
}: TextareaRhfProps) => {
	const ref = useRef<HTMLTextAreaElement>(null);
	const wrapperRef = useRef<HTMLSpanElement>(null);
	const op = useRef<OverlayPanel>(null);
	const { control } = useFormContext();
	const color = useInputCvColor(textColor);
	const { getSize, getWeight } = useChangeTextFormat(dataInput);
	const isLg = useMediaQuery("(min-width: 1024px)");
	const fontSize = getSize();
	const fontWeight = getWeight();

	useLayoutEffect(() => {
		const el = ref.current;
		const wrapper = wrapperRef.current;
		if (!el || !wrapper) return;

		el.style.setProperty("--placeholder-color", `var(--${color})`);

		let raf = 0;
		let cancelled = false;

		const fitHeight = () => {
			if (cancelled) return;
			if (!fitTextareaHeight(el)) {
				raf = requestAnimationFrame(fitHeight);
			}
		};

		fitHeight();
		const ro = new ResizeObserver(fitHeight);
		ro.observe(wrapper);
		window.addEventListener(CV_TEXTAREA_RECALC_EVENT, fitHeight);

		return () => {
			cancelled = true;
			cancelAnimationFrame(raf);
			ro.disconnect();
			window.removeEventListener(CV_TEXTAREA_RECALC_EVENT, fitHeight);
		};
	}, [color]);

	return (
		<span ref={wrapperRef} className={`w-full ${className}`}>
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
						<InputTextarea
							{...field}
							{...props}
							id={name}
							rows={1}
							className={"w-full"}
							style={{
								resize: "none",
								padding: "0px",
								fontSize,
								fontWeight,
								lineHeight: 1.2,
								textAlign: textAlign,
								backgroundColor: "transparent",
								border: "none",
								boxShadow: "none",
								color: `var(--${color})`,
								fontFamily: "inherit",
								overflow: "hidden",
							}}
							onKeyDown={(e) => {
								if (!allowNewline && e.key === "Enter" && !e.shiftKey) {
									if (e.preventDefault) e.preventDefault();
									return false;
								}
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
							autoResize
							ref={ref}
						/>
						{fieldState.error && (
							<span className="text-red-500 text-xs -mt-1 mb-1">{fieldState.error.message}</span>
						)}
					</>
				)}
			/>
		</span>
	);
};
