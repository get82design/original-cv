import { ToggleButton } from "primereact/togglebutton";
import { Controller, useFormContext } from "react-hook-form";

interface ToggleAfficherCacherProps {
	name: string;
	compact?: boolean;
}

export const ToggleAfficherCacher = ({
	name,
	compact = false,
}: ToggleAfficherCacherProps) => {
	const { control, watch } = useFormContext();
	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => (
				<div
					className={
						compact
							? "inline-flex h-8 items-center"
							: "flex flex-column align-items-center gap-2"
					}
				>
					<ToggleButton
						onLabel="Cacher"
						offLabel="Afficher"
						id={field.name}
						checked={watch(name)}
						onChange={field.onChange}
						className={compact ? "photo-toggle-compact" : undefined}
						pt={
							compact
								? { root: { className: "h-8 m-0 p-0 border-0" } }
								: undefined
						}
					/>
				</div>
			)}
		/>
	);
};
