import { Checkbox } from "primereact/checkbox";
import { MultiSelect } from "primereact/multiselect";
import { OverlayPanel } from "primereact/overlaypanel";
import { type MouseEvent, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { MdDirectionsCar } from "react-icons/md";
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameHeader } from "@/features/cv-editor/utils/fields/fieldNameHeader";
import {
	formatDrivingLicenseLine,
	hasDrivingLicenseInfo,
} from "@/features/cv-editor/utils/formatDrivingLicenseLine";
import { useInputCvColor } from "@/features/cv-editor/utils/utilsCv/color";
import { useChangeTextFormat } from "@/features/cv-editor/utils/utilsCv/font";
import { GetAlignementHeader } from "@/features/cv-editor/utils/utilsCv/marge";
import type { BaseTextSettings } from "@/services/schemas/cvTemplate.schema";
import { DRIVING_LICENSE_OPTIONS, type DrivingLicense } from "@/services/schemas/enums";

interface DrivingLicenseCvInputProps {
	withIcon?: boolean;
	colorIcon?: string;
	textAlign?: "left" | "center" | "right";
	/** Séparateur « | » avant la ligne (HeaderTwo) — masqué à la capture si vide */
	leadingSeparator?: boolean;
}

/**
 * Ligne permis / véhiculé dans le header CV.
 * Clic → overlay MultiSelect + checkbox (édition sans passer par le profil).
 */
export const DrivingLicenseCvInput = ({
	withIcon,
	colorIcon,
	textAlign = "left",
	leadingSeparator = false,
}: DrivingLicenseCvInputProps) => {
	const { watch, control } = useFormContext();
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();
	const op = useRef<OverlayPanel>(null);
	const iconAfter = textAlign === "right";

	const watchModelHeaderContent: BaseTextSettings = watch(FieldNameHeader.settingsContent);
	const licenses = (watch(FieldNameHeader.drivingLicenses) ?? []) as DrivingLicense[];
	const hasVehicle = Boolean(watch(FieldNameHeader.hasVehicle));
	const line = formatDrivingLicenseLine(licenses, hasVehicle);
	const hasInfo = hasDrivingLicenseInfo(licenses, hasVehicle);

	const textCss = useInputCvColor(watchModelHeaderContent?.colorSelect ?? "black");
	const iconColor = colorIcon ? `#${colorIcon}` : textCss ? `var(--${textCss})` : undefined;
	const { getSize, getWeight } = useChangeTextFormat({
		changeSize: "1px",
		model: watchModelHeaderContent,
	});

	const icon = withIcon ? <MdDirectionsCar style={{ color: iconColor }} /> : null;

	const openEditor = (e: MouseEvent<HTMLButtonElement>) => {
		setSelectModifInput(FieldNameHeader.settingsContent);
		setSelectInputForm("");
		op.current?.toggle(e);
	};

	return (
		<div
			className={`flex ${GetAlignementHeader(textAlign)} gap-2 items-center ${
				leadingSeparator ? "gap-3" : "w-full"
			}`}
			data-cv-selectable
			{...(!hasInfo ? { "data-preview-ignore": "true" } : {})}
		>
			{leadingSeparator ? <p className="m-0">|</p> : null}
			{!iconAfter && icon}
			<button
				type="button"
				onClick={openEditor}
				className="bg-transparent border-0 p-0 cursor-pointer min-w-10 text-left"
				style={{
					fontFamily: "inherit",
					fontSize: getSize(),
					fontWeight: getWeight(),
					textAlign,
					color: textCss ? `var(--${textCss})` : undefined,
					opacity: hasInfo ? 1 : 0.55,
				}}
			>
				{hasInfo ? line : "Ajouter permis…"}
			</button>
			{iconAfter && icon}

			<OverlayPanel
				ref={op}
				className="cv-driving-license-overlay"
				style={{ minWidth: "280px", maxWidth: "360px" }}
			>
				<div className="flex flex-col gap-3 p-1">
					<label
						htmlFor="cv-driving-licenses"
						className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
					>
						Permis de conduire
					</label>
					<Controller
						name={FieldNameHeader.drivingLicenses}
						control={control}
						render={({ field }) => (
							<MultiSelect
								inputId="cv-driving-licenses"
								value={field.value ?? []}
								options={DRIVING_LICENSE_OPTIONS}
								optionLabel="label"
								optionValue="value"
								placeholder="Sélectionner"
								display="chip"
								filter
								showClear
								className="w-full text-sm"
								panelClassName="profile-identite-permis-panel"
								onChange={(e) => field.onChange(e.value ?? [])}
								onBlur={field.onBlur}
							/>
						)}
					/>
					<label
						htmlFor="cv-has-vehicle"
						className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200 cursor-pointer select-none"
					>
						<Controller
							name={FieldNameHeader.hasVehicle}
							control={control}
							render={({ field }) => (
								<Checkbox
									inputId="cv-has-vehicle"
									checked={Boolean(field.value)}
									onChange={(e) => field.onChange(Boolean(e.checked))}
								/>
							)}
						/>
						<span>Véhiculé</span>
					</label>
				</div>
			</OverlayPanel>
		</div>
	);
};
