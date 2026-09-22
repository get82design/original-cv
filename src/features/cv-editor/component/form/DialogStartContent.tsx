import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useRef } from "react";

type StartContentChoice = "empty" | "profile";

interface DialogStartContentProps {
	visible: boolean;
	onHide: () => void;
	/** true si un profil est dispo (affiche l’option) */
	hasProfile: boolean;
	/** Import en cours (désactive les actions) */
	importing?: boolean;
	onChoose?: (choice: StartContentChoice) => void;
	/** Étape 1 : fichier PDF choisi → parent appelle l’API */
	onImportPdf?: (file: File) => void;
}

/**
 * Placement : création `/cv/0?template=…` (modèle déjà choisi via URL).
 * Demande uniquement la source de contenu — pas le carrousel de modèles.
 */
export const DialogStartContent = ({
	visible,
	onHide,
	hasProfile,
	importing = false,
	onChoose,
	onImportPdf,
}: DialogStartContentProps) => {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file) return;
		onImportPdf?.(file);
	};

	return (
		<Dialog
			visible={visible}
			onHide={onHide}
			header="Comment démarrer ce CV ?"
			closable={!importing}
			style={{ width: "28rem", maxWidth: "92vw" }}
			className="dialog-start-content"
		>
			<div className="flex flex-col gap-3 py-2 text-zinc-900 dark:text-zinc-100">
				<p className="m-0 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
					Le modèle est déjà sélectionné. Choisissez la source des données.
				</p>
				<input
					ref={fileInputRef}
					type="file"
					accept="application/pdf,.pdf"
					className="hidden"
					onChange={onFileChange}
				/>
				<Button
					type="button"
					outlined
					label="CV vide"
					disabled={importing}
					onClick={() => onChoose?.("empty")}
					className="!justify-center !text-zinc-700 dark:!text-zinc-200 !border-zinc-300 dark:!border-zinc-600 hover:!bg-zinc-100 dark:hover:!bg-zinc-800"
				/>
				{hasProfile ? (
					<Button
						type="button"
						outlined
						label="Charger mon profil"
						disabled={importing}
						onClick={() => onChoose?.("profile")}
						className="!justify-center !text-zinc-700 dark:!text-zinc-200 !border-zinc-300 dark:!border-zinc-600 hover:!bg-zinc-100 dark:hover:!bg-zinc-800"
					/>
				) : null}
				<Button
					type="button"
					label={importing ? "Import en cours…" : "Importer un CV (PDF)"}
					icon={importing ? "pi pi-spin pi-spinner" : "pi pi-upload"}
					disabled={importing}
					onClick={() => fileInputRef.current?.click()}
					className="!justify-center bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white dark:text-black font-semibold"
				/>
			</div>
		</Dialog>
	);
};
