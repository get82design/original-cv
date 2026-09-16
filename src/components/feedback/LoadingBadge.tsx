import { ProgressSpinner } from "primereact/progressspinner";

type LoadingBadgePosition = "fixed" | "absolute" | "inline";

interface LoadingBadgeProps {
	label?: string;
	visible?: boolean;
	position?: LoadingBadgePosition;
	className?: string;
}

const positionClasses: Record<LoadingBadgePosition, string> = {
	fixed: "fixed bottom-4 right-4 z-30",
	absolute: "absolute bottom-4 right-4 z-30",
	inline: "",
};

export const LoadingBadge = ({
	label = "Chargement...",
	visible = true,
	position = "fixed",
	className = "",
}: LoadingBadgeProps) => {
	if (!visible) return null;

	return (
		<div
			className={`flex items-center gap-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 px-4 py-2 shadow-md ${positionClasses[position]} ${className}`}
			aria-live="polite"
			aria-busy="true"
		>
			<ProgressSpinner
				style={{ width: "24px", height: "24px" }}
				strokeWidth="5"
				animationDuration=".8s"
			/>
			<span className="text-sm text-muted-color">{label}</span>
		</div>
	);
};
