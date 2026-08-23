import { ColorForMiniCard } from "@/features/cv-editor/utils/utilsCv/color";

export function MiniBar({ widthClass = "w-3/4" }: { widthClass?: string }) {
	return (
		<div
			className={`${widthClass} rounded-lg`}
			style={{
				height: "8px",
				backgroundColor: `var(--${ColorForMiniCard()})`,
			}}
		/>
	);
}

export function MiniTitle({ children }: { children: React.ReactNode }) {
	return (
		<p
			style={{
				fontSize: "10px",
				fontWeight: "600",
				color: `var(--${ColorForMiniCard()})`,
				width: "100%",
				textAlign: "left",
			}}
		>
			{children}
		</p>
	);
}
