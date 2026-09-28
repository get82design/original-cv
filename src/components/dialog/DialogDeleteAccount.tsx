import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import { DELETE_ACCOUNT_CONFIRMATION } from "@/services/user/deleteAccount.constants";

interface DialogDeleteAccountProps {
	visible: boolean;
	loading?: boolean;
	onHide: () => void;
	onConfirm: (confirmation: string) => void;
}

/**
 * Confirmation irréversible : saisir exactement « SUPPRIMER ».
 */
export const DialogDeleteAccount = ({
	visible,
	loading = false,
	onHide,
	onConfirm,
}: DialogDeleteAccountProps) => {
	const [confirmation, setConfirmation] = useState("");

	useEffect(() => {
		if (!visible) setConfirmation("");
	}, [visible]);

	const canConfirm = confirmation.trim() === DELETE_ACCOUNT_CONFIRMATION;

	const handleHide = () => {
		if (loading) return;
		onHide();
	};

	const footer = (
		<div className="flex flex-wrap justify-end gap-2">
			<Button
				type="button"
				label="Annuler"
				outlined
				onClick={handleHide}
				disabled={loading}
				className="!text-zinc-600 dark:!text-zinc-300 !border-zinc-300 dark:!border-zinc-600 hover:!bg-zinc-100 dark:hover:!bg-zinc-800"
			/>
			<Button
				type="button"
				label="Supprimer définitivement"
				icon="pi pi-trash"
				severity="danger"
				loading={loading}
				disabled={loading || !canConfirm}
				onClick={() => onConfirm(confirmation.trim())}
				className="font-semibold"
			/>
		</div>
	);

	return (
		<Dialog
			visible={visible}
			onHide={handleHide}
			header="Supprimer mon compte"
			style={{ width: "28rem", maxWidth: "94vw" }}
			className="dialog-delete-account"
			footer={footer}
			closable={!loading}
		>
			<div className="flex flex-col gap-3 p-1 text-zinc-900 dark:text-zinc-100">
				<p className="m-0 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
					Cette action est <strong>définitive</strong>. Votre profil, vos CV, crédits et modèles
					débloqués seront effacés. Les statistiques anonymisées peuvent être conservées.
				</p>
				<label className="flex flex-col gap-1" htmlFor="delete-account-confirm">
					<span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
						Pour confirmer, tapez {DELETE_ACCOUNT_CONFIRMATION}
					</span>
					<InputText
						id="delete-account-confirm"
						value={confirmation}
						onChange={(e) => setConfirmation(e.target.value)}
						disabled={loading}
						autoComplete="off"
						placeholder={DELETE_ACCOUNT_CONFIRMATION}
						className="w-full"
					/>
				</label>
			</div>
		</Dialog>
	);
};
