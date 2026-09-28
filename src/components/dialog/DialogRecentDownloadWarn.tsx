import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

export type PendingDownloadKind = "free" | "paid";

interface DialogRecentDownloadWarnProps {
	visible: boolean;
	onHide: () => void;
	/** free = crédit gratuit avec logo ; paid = crédit sans logo */
	kind: PendingDownloadKind | null;
	loading?: boolean;
	onConfirm: () => void;
}

export const DialogRecentDownloadWarn = ({
	visible,
	onHide,
	kind,
	loading = false,
	onConfirm,
}: DialogRecentDownloadWarnProps) => {
	const costLabel = kind === "paid" ? "un crédit de téléchargement" : "un téléchargement gratuit";

	const footer = (
		<div className="flex flex-wrap justify-end gap-2">
			<Button
				type="button"
				label="Annuler"
				outlined
				onClick={onHide}
				disabled={loading}
				className="!text-zinc-600 dark:!text-zinc-300 !border-zinc-300 dark:!border-zinc-600 hover:!bg-zinc-100 dark:hover:!bg-zinc-800"
			/>
			<Button
				type="button"
				label="Télécharger quand même"
				loading={loading}
				disabled={loading}
				onClick={onConfirm}
				className="bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white dark:text-black font-semibold"
			/>
		</div>
	);

	return (
		<Dialog
			visible={visible}
			onHide={onHide}
			header="Téléchargement récent"
			style={{ width: "480px", maxWidth: "92vw" }}
			className="dialog-recent-download"
			footer={footer}
			closable={!loading}
		>
			<div className="flex flex-col gap-3 p-2 text-zinc-900 dark:text-zinc-100">
				<p className="m-0 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
					Vous avez déjà téléchargé ce CV il y a moins de 10 minutes. Un nouvel export consommera{" "}
					{costLabel}.
				</p>
				<p className="m-0 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
					Astuce : réutilisez le fichier déjà téléchargé si rien n’a changé.
				</p>
			</div>
		</Dialog>
	);
};
