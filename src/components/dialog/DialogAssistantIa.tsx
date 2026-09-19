import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useState } from "react";

export type AiActionId =
	| "rewrite-section"
	| "review-cv"
	| "cover-letter"
	| "match-job";

interface AiAction {
	id: AiActionId;
	title: string;
	description: string;
	hint?: string;
	comingSoon?: boolean;
}

const AI_ACTIONS: AiAction[] = [
	{
		id: "rewrite-section",
		title: "Reformuler une partie",
		description:
			"Améliore le ton et la clarté d’une section (expérience, description, mission…).",
	},
	{
		id: "review-cv",
		title: "Relecture générale",
		description:
			"Analyse ton CV et propose des suggestions globales pour le renforcer.",
	},
	{
		id: "cover-letter",
		title: "Lettre de motivation",
		description:
			"Génère une lettre alignée sur le contenu de ton CV.",
	},
	{
		id: "match-job",
		title: "Comparer à une annonce",
		description:
			"Évalue l’adéquation de ton CV avec une offre d’emploi.",
		hint: "Bientôt disponible",
		comingSoon: true,
	},
];

interface DialogAssistantIaProps {
	visible: boolean;
	onHide: () => void;
	/** Visuel only pour l’instant */
	onSelectAction?: (action: AiActionId) => void;
}

export const DialogAssistantIa = ({
	visible,
	onHide,
	onSelectAction,
}: DialogAssistantIaProps) => {
	const [selectedId, setSelectedId] = useState<AiActionId | null>(null);

	const handleHide = () => {
		setSelectedId(null);
		onHide();
	};

	const selected = AI_ACTIONS.find((a) => a.id === selectedId);
	const canConfirm = !!selected && !selected.comingSoon;

	const footer = (
		<div className="flex flex-wrap justify-end gap-2">
			<Button
				type="button"
				label="Fermer"
				outlined
				onClick={handleHide}
				className="!text-zinc-600 dark:!text-zinc-300 !border-zinc-300 dark:!border-zinc-600 hover:!bg-zinc-100 dark:hover:!bg-zinc-800"
			/>
			<Button
				type="button"
				label="Continuer"
				disabled={!canConfirm}
				onClick={() => {
					if (!selectedId || !canConfirm) return;
					onSelectAction?.(selectedId);
					handleHide();
				}}
				className="bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white dark:text-black font-semibold"
			/>
		</div>
	);

	return (
		<Dialog
			visible={visible}
			onHide={handleHide}
			header="Assistant IA"
			style={{ width: "560px", maxWidth: "92vw" }}
			className="dialog-assistant-ia"
			footer={footer}
		>
			<div className="flex flex-col gap-4 p-2 text-zinc-900 dark:text-zinc-100">
				<p className="m-0 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
					Choisis une action pour améliorer ton CV. Les coûts en crédits
					seront précisés plus tard.
				</p>

				<ul className="m-0 p-0 list-none flex flex-col gap-2">
					{AI_ACTIONS.map((action) => {
						const selected = selectedId === action.id;
						return (
							<li key={action.id}>
								<button
									type="button"
									disabled={action.comingSoon}
									onClick={() => setSelectedId(action.id)}
									className={`w-full text-left rounded-lg border px-3.5 py-3 transition-colors ${
										action.comingSoon
											? "cursor-not-allowed border-zinc-200 opacity-60 dark:border-zinc-700"
											: selected
												? "border-primary bg-primary/10 dark:border-primary-dark dark:bg-primary-dark/15"
												: "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-500"
									}`}
								>
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0">
											<p className="m-0 text-sm font-semibold">
												{action.title}
												{action.comingSoon && (
													<span className="ml-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
														{action.hint}
													</span>
												)}
											</p>
											<p className="m-0 mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
												{action.description}
											</p>
										</div>
										{!action.comingSoon && (
											<span
												className={`mt-1 size-3.5 shrink-0 rounded-full border ${
													selected
														? "border-primary bg-primary dark:border-primary-dark dark:bg-primary-dark"
														: "border-zinc-300 dark:border-zinc-600"
												}`}
												aria-hidden
											/>
										)}
									</div>
								</button>
							</li>
						);
					})}
				</ul>
			</div>
		</Dialog>
	);
};
