import { basicIconsRegister } from "@/features/cv-editor/component/template/register/IconBasicRegister";
import { socialIconsRegister } from "@/features/cv-editor/component/template/register/IconSocialMediaRegister";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { useRef } from "react";
import { FaGlobe, FaThumbsUp } from "react-icons/fa";
import type { IconType } from "react-icons/lib";

type IconRegister = Record<string, IconType>;

interface SelectIconProfileProps {
	icon: string;
	setIcon: (name: string) => void;
	register: IconRegister;
	fallback?: IconType;
	columns?: number;
	className?: string;
}

export const SelectIconProfile = ({
	icon,
	setIcon,
	register,
	fallback,
	columns = 10,
	className,
}: SelectIconProfileProps) => {
	const op = useRef<OverlayPanel>(null);
	const Icon = register[icon] ?? fallback ?? FaGlobe;

	return (
		<div className={className}>
			<Button
				type="button"
				text
				rounded
				style={{ width: "1.3rem", height: "1.3rem" }}
				icon={<Icon style={{ width: 20, height: 20 }} />}
				onClick={(e) => op.current?.toggle(e)}
			/>
			<OverlayPanel ref={op}>
				<div
					className="grid gap-2"
					style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
				>
					{Object.entries(register).map(([name, IconComp]) => (
						<button
							key={name}
							type="button"
							className="cursor-pointer flex items-center justify-center p-1 rounded hover:bg-surface-100"
							onClick={() => {
								setIcon(name);
								op.current?.hide();
							}}
						>
							<IconComp style={{ width: 20, height: 20 }} />
						</button>
					))}
				</div>
			</OverlayPanel>
		</div>
	);
};

export const SelectSocialIconProfile = (
	props: Omit<SelectIconProfileProps, "register" | "fallback">,
) => (
	<SelectIconProfile
		{...props}
		register={socialIconsRegister}
		fallback={FaGlobe}
		columns={props.columns ?? 10}
	/>
);

export const SelectBasicIconProfile = (
	props: Omit<SelectIconProfileProps, "register" | "fallback">,
) => (
	<SelectIconProfile
		{...props}
		register={basicIconsRegister}
		fallback={FaThumbsUp}
		columns={props.columns ?? 12}
	/>
);
