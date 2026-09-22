import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useState } from "react";
import type { CvRewriteSection } from "@/services/schemas/cvRewriteSection.schema";
import type { CvRewriteSectionOption } from "@/features/cv-editor/utils/extractCvSectionForRewrite";
import type { CvRewriteSectionType } from "@/services/schemas/cvRewriteSection.schema";

type Step = "pick" | "loading" | "preview";

interface DialogRewriteSectionProps {
	visible: boolean;
	sections: CvRewriteSectionOption[];
	loading?: boolean;
	rewrite: CvRewriteSection | null;
	selectedType: CvRewriteSectionType | null;
	onHide: () => void;
	onPickSection: (section: CvRewriteSectionOption) => void;
	onApply: () => void;
	onBackToPick: () => void;
}

/**
 * Reformuler une partie : choix de section → preview → apply.
 */
export const DialogRewriteSection = ({
	visible,
	sections,
	loading = false,
	rewrite,
	selectedType,
	onHide,
	onPickSection,
	onApply,
	onBackToPick,
}: DialogRewriteSectionProps) => {
	const [picked, setPicked] = useState<CvRewriteSectionType | null>(null);

	const step: Step = loading ? "loading" : rewrite ? "preview" : "pick";

	const handleHide = () => {
		if (loading) return;
		setPicked(null);
		onHide();
	};

	const footer =
		step === "preview" ? (
			<div className="flex flex-wrap justify-end gap-2">
				<Button
					type="button"
					label="Autre section"
					outlined
					onClick={() => {
						setPicked(null);
						onBackToPick();
					}}
					className="!text-zinc-600 dark:!text-zinc-300 !border-zinc-300 dark:!border-zinc-600"
				/>
				<Button
					type="button"
					label="Appliquer au CV"
					icon="pi pi-check"
					onClick={onApply}
					className="bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white dark:text-black font-semibold"
				/>
			</div>
		) : step === "pick" ? (
			<div className="flex flex-wrap justify-end gap-2">
				<Button
					type="button"
					label="Fermer"
					outlined
					onClick={handleHide}
					className="!text-zinc-600 dark:!text-zinc-300 !border-zinc-300 dark:!border-zinc-600"
				/>
				<Button
					type="button"
					label="Reformuler"
					disabled={!picked}
					onClick={() => {
						const section = sections.find((s) => s.sectionType === picked);
						if (section) onPickSection(section);
					}}
					className="bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white dark:text-black font-semibold"
				/>
			</div>
		) : null;

	return (
		<Dialog
			visible={visible}
			onHide={handleHide}
			header="Reformuler une partie"
			style={{ width: "36rem", maxWidth: "94vw" }}
			className="dialog-rewrite-section"
			footer={footer}
			closable={!loading}
		>
			<div className="flex max-h-[min(70vh,28rem)] flex-col gap-3 overflow-y-auto p-1 text-zinc-900 dark:text-zinc-100">
				{step === "loading" ? (
					<p className="m-0 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
						<span className="pi pi-spin pi-spinner" aria-hidden />
						Reformulation en cours…
					</p>
				) : step === "preview" && rewrite ? (
					<>
						<p className="m-0 text-xs text-zinc-500 dark:text-zinc-400">Section : {selectedType}</p>
						<section className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900/60">
							<p className="m-0 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
								Ce qui change
							</p>
							<p className="m-0 mt-1 text-sm leading-relaxed">{rewrite.rationale}</p>
						</section>
						{rewrite.rewrittenText ? (
							<section className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900/60">
								<p className="m-0 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
									Nouveau texte
								</p>
								<p className="m-0 mt-1 whitespace-pre-wrap text-sm">{rewrite.rewrittenText}</p>
							</section>
						) : null}
						{rewrite.items.length > 0 ? (
							<section className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900/60">
								<p className="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
									Éléments ({rewrite.items.length})
								</p>
								<ul className="m-0 flex list-none flex-col gap-2 p-0">
									{rewrite.items.map((item, i) => (
										<li key={item.id ?? i} className="text-sm">
											<p className="m-0 font-semibold">{item.title || `Item ${i + 1}`}</p>
											{item.body ? (
												<p className="m-0 mt-0.5 text-zinc-700 dark:text-zinc-300">{item.body}</p>
											) : null}
											{item.bullets.length > 0 ? (
												<ul className="m-0 mt-1 list-disc pl-4 text-xs text-zinc-600 dark:text-zinc-400">
													{item.bullets.map((b, j) => (
														<li key={j}>{b}</li>
													))}
												</ul>
											) : null}
										</li>
									))}
								</ul>
							</section>
						) : null}
					</>
				) : sections.length === 0 ? (
					<p className="m-0 text-sm text-zinc-500">
						Aucune section reformulable avec du contenu pour l’instant (description, expériences,
						projets…).
					</p>
				) : (
					<>
						<p className="m-0 text-sm text-zinc-600 dark:text-zinc-400">
							Choisis la partie du CV à reformuler.
						</p>
						<ul className="m-0 flex list-none flex-col gap-2 p-0">
							{sections.map((section) => {
								const selected = picked === section.sectionType;
								return (
									<li key={section.sectionType}>
										<button
											type="button"
											onClick={() => setPicked(section.sectionType)}
											className={`w-full rounded-lg border px-3.5 py-3 text-left transition-colors ${
												selected
													? "border-primary bg-primary/10 dark:border-primary-dark dark:bg-primary-dark/15"
													: "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-500"
											}`}
										>
											<p className="m-0 text-sm font-semibold">{section.label}</p>
											<p className="m-0 mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
												{section.sectionType}
											</p>
										</button>
									</li>
								);
							})}
						</ul>
					</>
				)}
			</div>
		</Dialog>
	);
};
