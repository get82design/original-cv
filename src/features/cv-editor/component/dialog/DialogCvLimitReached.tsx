import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useState } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@server/api/root";

type RouterOutputs = inferRouterOutputs<AppRouter>;
export type CvListItem = NonNullable<RouterOutputs["cv"]["allByUser"]>[number];

interface DialogCvLimitReachedProps {
	visible: boolean;
	onHide: () => void;
	cvs: CvListItem[];
	loading?: boolean;
	replacing?: boolean;
	onReplace: (cvId: string) => void;
	onBuySlot: () => void;
}

const formatDate = (value: Date | string) =>
	new Date(value).toLocaleDateString("fr-FR", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});

export const DialogCvLimitReached = ({
	visible,
	onHide,
	cvs,
	loading = false,
	replacing = false,
	onReplace,
	onBuySlot,
}: DialogCvLimitReachedProps) => {
	const [selectedId, setSelectedId] = useState<string | null>(null);

	const handleHide = () => {
		setSelectedId(null);
		onHide();
	};

	const footer = (
		<div className="flex flex-wrap justify-end gap-2">
			<Button
				type="button"
				label="Annuler"
				outlined
				onClick={handleHide}
				disabled={replacing}
				className="!text-zinc-600 dark:!text-zinc-300 !border-zinc-300 dark:!border-zinc-600 hover:!bg-zinc-100 dark:hover:!bg-zinc-800"
			/>
			<Button
				type="button"
				label="Acheter un emplacement"
				outlined
				onClick={onBuySlot}
				disabled={replacing}
				className="!border-primary !text-primary dark:!border-primary-dark dark:!text-primary-dark"
			/>
			<Button
				type="button"
				label="Remplacer ce CV"
				disabled={!selectedId || replacing}
				loading={replacing}
				onClick={() => selectedId && onReplace(selectedId)}
				className="bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white dark:text-black font-semibold"
			/>
		</div>
	);

	return (
		<Dialog
			visible={visible}
			onHide={handleHide}
			header="Limite de CV atteinte"
			style={{ width: "640px", maxWidth: "92vw" }}
			className="dialog-cv-limit"
			footer={footer}
			closable={!replacing}
		>
			<div className="flex flex-col gap-4 p-2 text-zinc-900 dark:text-zinc-100">
				<p className="m-0 text-sm leading-relaxed">
					Vous avez atteint le nombre maximum de CV enregistrés. Vous pouvez écraser un CV existant,
					ou acheter un nouvel emplacement de sauvegarde.
				</p>

				<div className="flex flex-col gap-2">
					<p className="m-0 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
						Remplacer un CV
					</p>
					{loading ? (
						<p className="m-0 text-sm text-zinc-500">Chargement de vos CV…</p>
					) : cvs.length === 0 ? (
						<p className="m-0 text-sm text-zinc-500">Aucun CV trouvé sur votre compte.</p>
					) : (
						<ul className="m-0 p-0 list-none flex flex-col gap-2 max-h-64 overflow-y-auto">
							{cvs.map((cv) => {
								const selected = selectedId === cv.id;
								return (
									<li key={cv.id}>
										<button
											type="button"
											disabled={replacing}
											onClick={() => setSelectedId(cv.id)}
											className={`w-full text-left rounded-lg border px-3 py-2.5 transition-colors ${
												selected
													? "border-primary bg-primary/10 dark:border-primary-dark dark:bg-primary-dark/15"
													: "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-500 bg-white dark:bg-zinc-900"
											}`}
										>
											<div className="flex items-start justify-between gap-3">
												<div className="min-w-0">
													<p className="m-0 font-semibold text-sm truncate">
														{cv.title || "CV sans titre"}
													</p>
													<p className="m-0 mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
														{cv.template?.name ? `Modèle ${cv.template.name} · ` : ""}
														Modifié le {formatDate(cv.updatedAt)}
													</p>
												</div>
												<span
													className={`mt-1 size-3.5 shrink-0 rounded-full border ${
														selected
															? "border-primary bg-primary dark:border-primary-dark dark:bg-primary-dark"
															: "border-zinc-300 dark:border-zinc-600"
													}`}
													aria-hidden
												/>
											</div>
										</button>
									</li>
								);
							})}
						</ul>
					)}
					{selectedId && (
						<p className="m-0 text-xs text-amber-700 dark:text-amber-300">
							Le CV sélectionné sera définitivement remplacé par le contenu actuel.
						</p>
					)}
				</div>
			</div>
		</Dialog>
	);
};
