import type { StylePhoto } from "@/services/schemas/cvTemplate.schema";
import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
	fileToPhotoDataUrl,
	photoStyleClassName,
	resolvePhotoSrc,
} from "./photoUtils";

type PhotoFieldProps = {
	/** Chemin RHF (ex. `photo` ou FieldNameCv.photo) */
	name: string;
	stylePhoto?: StylePhoto | null;
	/** Taille en px (carré). */
	size?: number;
	editable?: boolean;
	className?: string;
	ariaLabel?: string;
};

export function PhotoField({
	name,
	stylePhoto = "circle",
	size = 130,
	editable = true,
	className = "",
	ariaLabel = "Photo de profil",
}: PhotoFieldProps) {
	const { watch, setValue } = useFormContext();
	const photo = watch(name) as string | null | undefined;
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const openPicker = () => {
		if (!editable || busy) return;
		inputRef.current?.click();
	};

	const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;

		setBusy(true);
		setError(null);
		try {
			const dataUrl = await fileToPhotoDataUrl(file);
			setValue(name, dataUrl, { shouldDirty: true, shouldTouch: true });
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Import de la photo impossible.",
			);
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className={`relative inline-flex flex-col items-center gap-1 ${className}`}>
			<button
				type="button"
				disabled={!editable || busy}
				aria-label={ariaLabel}
				onClick={openPicker}
				style={{
					width: `${size}px`,
					height: `${size}px`,
					backgroundImage: `url(${resolvePhotoSrc(photo)})`,
					backgroundPosition: "center",
					backgroundSize: "cover",
					cursor: editable ? "pointer" : "default",
					opacity: busy ? 0.7 : 1,
				}}
				className={`border-0 bg-white ${photoStyleClassName(stylePhoto)}`}
			/>
			{editable ? (
				<input
					ref={inputRef}
					type="file"
					accept="image/jpeg,image/png,image/webp,image/*"
					className="hidden"
					onChange={(e) => {
						void onFileChange(e);
					}}
				/>
			) : null}
			{error ? (
				<p className="m-0 max-w-[10rem] text-center text-[10px] text-red-500">
					{error}
				</p>
			) : null}
		</div>
	);
}
