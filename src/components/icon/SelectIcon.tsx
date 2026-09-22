import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { basicIconsRegister } from "@/features/cv-editor/component/template/register/IconBasicRegister";
import { socialIconsRegister } from "@/features/cv-editor/component/template/register/IconSocialMediaRegister";
import { useInputCvColor } from "@/features/cv-editor/utils/utilsCv/color";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { useRef } from "react";
import { FaGlobe, FaThumbsUp } from "react-icons/fa";
import type { IconType } from "react-icons/lib";

type IconRegister = Record<string, IconType>;
interface SelectIconProps {
	icon: string;
	setIcon: (name: string) => void;
	register: IconRegister;
	fallback?: IconType;
	color: string;
	fieldName: string;
	afficherCacher?: string;
	columns?: number; // ex. 10 social, 12 basic
}

export const SelectIcon = ({
	icon,
	setIcon,
	register,
	fallback,
	color,
	fieldName,
	afficherCacher,
	columns,
}: SelectIconProps) => {
	const op = useRef<OverlayPanel>(null);
	const colorIcon = useInputCvColor(color);
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();

	const Icon = register[icon] ?? fallback ?? FaGlobe;
	return (
		<>
			<Button
				text
				rounded
				style={{
					color: `var(--${colorIcon})`,
					width: "1.3rem",
					height: "1.3rem",
				}}
				icon={<Icon style={{ width: 20, height: 20 }} />}
				onClick={(e) => {
					setSelectModifInput(fieldName);
					setSelectInputForm(afficherCacher ? afficherCacher : "");
					op.current && op.current.toggle(e);
				}}
			/>
			<OverlayPanel ref={op}>
				<div className="grid grid-cols-10 gap-2">
					{Object.entries(register).map(([name, IconComp]) => {
						return (
							<button
								key={name}
								type="button"
								className="cursor-pointer flex items-center justify-center p-1 rounded hover:bg-surface-100"
								onClick={() => {
									setIcon(name); // stocke "faLinkedin", etc.
									op.current?.hide();
								}}
							>
								<IconComp style={{ width: 20, height: 20 }} />
							</button>
						);
					})}
				</div>
			</OverlayPanel>
		</>
	);
};

export const SelectSocialIcon = (props: Omit<SelectIconProps, "register" | "fallback">) => (
	<SelectIcon {...props} register={socialIconsRegister} fallback={FaGlobe} />
);

export const SelectBasicIcon = (props: Omit<SelectIconProps, "register" | "fallback">) => (
	<SelectIcon {...props} register={basicIconsRegister} fallback={FaThumbsUp} />
);
