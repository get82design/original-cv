import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import type { AiBillingOptions } from "@/services/ai/aiBillingService";
import type { AiCreditPaymentChoice } from "@/services/ai/aiBillingService";

type DialogAiPaymentProps = {
	visible: boolean;
	onHide: () => void;
	title: string;
	options: AiBillingOptions | null | undefined;
	loading?: boolean;
	confirming?: boolean;
	onConfirm: (choice: AiCreditPaymentChoice) => void;
};

export function DialogAiPayment({
	visible,
	onHide,
	title,
	options,
	loading = false,
	confirming = false,
	onConfirm,
}: DialogAiPaymentProps) {
	const [choice, setChoice] = useState<AiCreditPaymentChoice | null>(null);

	useEffect(() => {
		if (!visible || !options) {
			setChoice(null);
			return;
		}
		if (options.canPayFree && !options.canPayPaid) setChoice("free");
		else if (options.canPayPaid && !options.canPayFree) setChoice("paid");
		else if (options.canPayPaid) setChoice("paid");
		else if (options.canPayFree) setChoice("free");
		else setChoice(null);
	}, [visible, options]);

	const noneAvailable =
		options != null && !options.canPayFree && !options.canPayPaid;

	const footer = (
		<div className="flex flex-wrap justify-end gap-2">
			<Button
				type="button"
				label="Annuler"
				outlined
				disabled={confirming}
				onClick={onHide}
				className="!text-zinc-600 dark:!text-zinc-300 !border-zinc-300 dark:!border-zinc-600 hover:!bg-zinc-100 dark:hover:!bg-zinc-800"
			/>
			<Button
				type="button"
				label="Continuer"
				disabled={!choice || noneAvailable || loading || confirming}
				loading={confirming}
				onClick={() => {
					if (!choice) return;
					onConfirm(choice);
				}}
				className="bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white dark:text-black font-semibold"
			/>
		</div>
	);

	return (
		<Dialog
			visible={visible}
			onHide={() => {
				if (confirming) return;
				onHide();
			}}
			header={title}
			style={{ width: "420px", maxWidth: "92vw" }}
			className="dialog-ai-payment"
			footer={footer}
		>
			{loading || !options ? (
				<p className="m-0 text-sm text-zinc-500">Chargement des tarifs…</p>
			) : noneAvailable ? (
				<div className="flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-300">
					<p className="m-0">
						Solde insuffisant pour cette action.
					</p>
					<p className="m-0 text-xs text-zinc-500">
						Soldes : {options.freeDownloadsRemaining} free ·{" "}
						{options.downloadCredits} payants
						{options.costFree != null
							? ` · tarif free ${options.costFree}`
							: ""}
						{options.costPaid != null
							? ` · tarif payant ${options.costPaid}`
							: ""}
					</p>
				</div>
			) : (
				<div className="flex flex-col gap-3">
					<p className="m-0 text-xs text-zinc-500 dark:text-zinc-400">
						Soldes : {options.freeDownloadsRemaining} free ·{" "}
						{options.downloadCredits} payants
					</p>
					<div className="flex flex-col gap-2">
						{options.costFree != null ? (
							<button
								type="button"
								disabled={!options.canPayFree}
								onClick={() => setChoice("free")}
								className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${
									choice === "free"
										? "border-primary bg-primary/10 dark:bg-primary/20"
										: "border-zinc-200 dark:border-zinc-700"
								} ${
									options.canPayFree
										? "cursor-pointer hover:border-primary"
										: "cursor-not-allowed opacity-50"
								}`}
							>
								<span className="font-semibold text-zinc-900 dark:text-zinc-100">
									{options.costFree} crédit
									{options.costFree > 1 ? "s" : ""} gratuit
									{options.costFree > 1 ? "s" : ""}
								</span>
								{!options.canPayFree ? (
									<span className="mt-0.5 block text-xs text-zinc-500">
										Solde insuffisant
									</span>
								) : null}
							</button>
						) : null}
						{options.costPaid != null ? (
							<button
								type="button"
								disabled={!options.canPayPaid}
								onClick={() => setChoice("paid")}
								className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${
									choice === "paid"
										? "border-primary bg-primary/10 dark:bg-primary/20"
										: "border-zinc-200 dark:border-zinc-700"
								} ${
									options.canPayPaid
										? "cursor-pointer hover:border-primary"
										: "cursor-not-allowed opacity-50"
								}`}
							>
								<span className="font-semibold text-zinc-900 dark:text-zinc-100">
									{options.costPaid} crédit
									{options.costPaid > 1 ? "s" : ""} payant
									{options.costPaid > 1 ? "s" : ""}
								</span>
								{!options.canPayPaid ? (
									<span className="mt-0.5 block text-xs text-zinc-500">
										Solde insuffisant
									</span>
								) : null}
							</button>
						) : null}
					</div>
				</div>
			)}
		</Dialog>
	);
}
