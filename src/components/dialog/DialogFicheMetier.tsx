import { Dialog } from "primereact/dialog";
import { AutoComplete, type AutoCompleteCompleteEvent } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { useEffect, useState } from "react";
import { trpc } from "@utils/trpc";
import { getClientErrorMessage } from "@/utils/clientError";
import type { RomeAppellationHitDto, RomeFicheDto } from "@/services/schemas/romeFiche.schema";
import type { CvMatchJob } from "@/services/schemas/cvMatchJob.schema";

type Step = "search" | "fiche" | "ia-loading" | "ia-result";

interface DialogFicheMetierProps {
	visible: boolean;
	/** Préremplissage (sous-titre / intitulé de poste du CV), éditable. */
	initialQuery?: string;
	onHide: () => void;
	/** Lance le flux paiement + comparaison IA (phase B). */
	onCompareCv?: (fiche: RomeFicheDto) => void;
	/** True pendant la mutation IA. */
	iaLoading?: boolean;
	/** Résultat IA (réutilise la forme match-job). */
	iaResult?: CvMatchJob | null;
	/** Efface le résultat IA pour revenir à la fiche. */
	onBackFromIa?: () => void;
}

const ROME_STALE_MS = 60 * 60 * 1000;

const priorityLabel: Record<string, string> = {
	haute: "Haute",
	moyenne: "Moyenne",
	basse: "Basse",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<section className="flex flex-col gap-1.5">
			<p className="m-0 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
				{title}
			</p>
			<div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900/60">
				{children}
			</div>
		</section>
	);
}

/**
 * Fiche métier France Travail : recherche appellation → fiche fusionnée (+ IA optionnelle).
 */
export const DialogFicheMetier = ({
	visible,
	initialQuery = "",
	onHide,
	onCompareCv,
	iaLoading = false,
	iaResult = null,
	onBackFromIa,
}: DialogFicheMetierProps) => {
	const [query, setQuery] = useState(initialQuery);
	const [debouncedQ, setDebouncedQ] = useState("");
	const [selected, setSelected] = useState<RomeAppellationHitDto | null>(null);
	const [suggestions, setSuggestions] = useState<RomeAppellationHitDto[]>([]);

	useEffect(() => {
		if (!visible) {
			setSelected(null);
			setSuggestions([]);
			setDebouncedQ("");
			return;
		}
		const initial = initialQuery.trim();
		setQuery(initial);
		// Lance tout de suite la recherche si le sous-titre est déjà assez long
		setDebouncedQ(initial.length >= 2 ? initial : "");
	}, [visible, initialQuery]);

	const searchQuery = trpc.rome.searchAppellations.useQuery(
		{ q: debouncedQ, limit: 12 },
		{
			enabled: visible && debouncedQ.length >= 2 && !selected,
			staleTime: ROME_STALE_MS,
		},
	);

	const ficheQuery = trpc.rome.getFiche.useQuery(
		{ codeRome: selected?.codeRome ?? "" },
		{
			enabled: visible && !!selected?.codeRome,
			staleTime: ROME_STALE_MS,
		},
	);

	useEffect(() => {
		if (selected) return;
		setSuggestions(searchQuery.data?.hits ?? []);
	}, [searchQuery.data, selected]);

	const fiche = ficheQuery.data ?? null;

	const step: Step = iaLoading
		? "ia-loading"
		: iaResult
			? "ia-result"
			: selected
				? "fiche"
				: "search";

	const handleHide = () => {
		if (iaLoading) return;
		onHide();
	};

	/** Debounce géré par AutoComplete (`delay`) — déclenche la query tRPC. */
	const onComplete = (e: AutoCompleteCompleteEvent) => {
		const next = e.query;
		setQuery(next);
		if (selected) setSelected(null);
		const trimmed = next.trim();
		setDebouncedQ(trimmed.length >= 2 ? trimmed : "");
	};

	const footer =
		step === "ia-result" ? (
			<div className="flex justify-end gap-2">
				<Button
					type="button"
					label="Retour à la fiche"
					severity="secondary"
					outlined
					onClick={() => onBackFromIa?.()}
				/>
				<Button type="button" label="Fermer" onClick={handleHide} />
			</div>
		) : step === "fiche" && fiche ? (
			<div className="flex flex-wrap justify-between gap-2">
				<Button
					type="button"
					label="Changer de métier"
					severity="secondary"
					outlined
					onClick={() => {
						setSelected(null);
						onBackFromIa?.();
					}}
				/>
				<div className="flex gap-2">
					{onCompareCv ? (
						<Button
							type="button"
							label="Comparer mon CV"
							icon="pi pi-sparkles"
							onClick={() => onCompareCv(fiche)}
						/>
					) : null}
					<Button type="button" label="Fermer" severity="secondary" onClick={handleHide} />
				</div>
			</div>
		) : (
			<div className="flex justify-end">
				<Button type="button" label="Fermer" severity="secondary" onClick={handleHide} />
			</div>
		);

	return (
		<Dialog
			visible={visible}
			onHide={handleHide}
			header={
				step === "ia-result"
					? "Comparaison CV ↔ fiche métier"
					: selected
						? `${selected.appellationLibelle}`
						: "Fiche métier"
			}
			className="dialog-fiche-metier w-full max-w-2xl"
			modal
			dismissableMask={!iaLoading}
			closable={!iaLoading}
			footer={footer}
		>
			{step === "search" ? (
				<div className="flex flex-col gap-3">
					<label className="flex flex-col gap-1" htmlFor="fiche-metier-search">
						<span className="text-sm font-medium">Rechercher un métier</span>
						<AutoComplete
							inputId="fiche-metier-search"
							value={query}
							suggestions={suggestions}
							completeMethod={onComplete}
							delay={300}
							minLength={2}
							field="appellationLibelle"
							forceSelection={false}
							dropdown={false}
							className="w-full"
							inputClassName="w-full"
							placeholder="Ex. développeur, infirmier…"
							onChange={(e) => {
								if (typeof e.value === "string") {
									setQuery(e.value);
									if (selected) setSelected(null);
									if (e.value.trim().length < 2) {
										setDebouncedQ("");
										setSuggestions([]);
									}
									return;
								}
								const hit = e.value as RomeAppellationHitDto | null;
								if (hit?.codeRome) {
									setSelected(hit);
									setQuery(hit.appellationLibelle);
								}
							}}
							onSelect={(e) => {
								const hit = e.value as RomeAppellationHitDto;
								if (hit?.codeRome) {
									setSelected(hit);
									setQuery(hit.appellationLibelle);
								}
							}}
							itemTemplate={(item: RomeAppellationHitDto) => (
								<div className="flex flex-col gap-0.5 py-0.5">
									<span className="text-sm">{item.appellationLibelle}</span>
									<span className="text-xs text-zinc-500">
										{item.codeRome} — {item.libelleRome}
									</span>
								</div>
							)}
						/>
					</label>
					{searchQuery.isFetching ? (
						<p className="m-0 text-sm text-zinc-500">Recherche…</p>
					) : null}
					{searchQuery.isError ? (
						<p className="m-0 text-sm text-red-600">
							{getClientErrorMessage(searchQuery.error)}
						</p>
					) : null}
					{debouncedQ.length >= 2 &&
					!searchQuery.isFetching &&
					searchQuery.data &&
					searchQuery.data.hits.length === 0 ? (
						<p className="m-0 text-sm text-zinc-500">Aucun métier trouvé.</p>
					) : null}
					<p className="m-0 text-xs text-zinc-500 dark:text-zinc-400">
						Données issues de France Travail / ROME
					</p>
				</div>
			) : null}

			{step === "fiche" ? (
				<div className="flex flex-col gap-3">
					{ficheQuery.isLoading ? (
						<div className="flex justify-center py-8">
							<ProgressSpinner style={{ width: "40px", height: "40px" }} />
						</div>
					) : null}
					{ficheQuery.isError ? (
						<p className="m-0 text-sm text-red-600">
							{getClientErrorMessage(ficheQuery.error)}
						</p>
					) : null}
					{fiche ? (
						<>
							<p className="m-0 text-sm text-zinc-600 dark:text-zinc-300">
								<span className="font-medium">{fiche.libelle}</span>
								<span className="text-zinc-400"> · {fiche.codeRome}</span>
							</p>
							{fiche.definition ? (
								<Section title="Définition">
									<p className="m-0 whitespace-pre-wrap text-sm leading-relaxed">
										{fiche.definition}
									</p>
								</Section>
							) : null}
							{fiche.accesMetier ? (
								<Section title="Accès au métier">
									<p className="m-0 whitespace-pre-wrap text-sm leading-relaxed">
										{fiche.accesMetier}
									</p>
								</Section>
							) : null}
							{fiche.competences.length > 0 ? (
								<Section title="Compétences">
									<ul className="m-0 list-disc space-y-1 pl-4 text-sm">
										{fiche.competences.slice(0, 40).map((c) => (
											<li key={`${c.code ?? ""}-${c.libelle}`}>{c.libelle}</li>
										))}
									</ul>
								</Section>
							) : null}
							{fiche.savoirs.length > 0 ? (
								<Section title="Savoirs">
									<ul className="m-0 list-disc space-y-1 pl-4 text-sm">
										{fiche.savoirs.slice(0, 40).map((s) => (
											<li key={`${s.code ?? ""}-${s.libelle}`}>{s.libelle}</li>
										))}
									</ul>
								</Section>
							) : null}
							<p className="m-0 text-xs text-zinc-500 dark:text-zinc-400">
								Données issues de France Travail / ROME
							</p>
						</>
					) : null}
				</div>
			) : null}

			{step === "ia-loading" ? (
				<div className="flex flex-col items-center gap-3 py-10">
					<ProgressSpinner style={{ width: "40px", height: "40px" }} />
					<p className="m-0 text-sm text-zinc-500">Comparaison en cours…</p>
				</div>
			) : null}

			{step === "ia-result" && iaResult ? (
				<div className="flex flex-col gap-3">
					{iaResult.score != null ? (
						<p className="m-0 text-sm">
							Adéquation :{" "}
							<span className="font-semibold">{iaResult.score}/10</span>
						</p>
					) : null}
					<Section title="Synthèse">
						<p className="m-0 whitespace-pre-wrap text-sm leading-relaxed">
							{iaResult.summary}
						</p>
					</Section>
					{iaResult.matched.length > 0 ? (
						<Section title="Points qui collent">
							<ul className="m-0 list-disc space-y-1 pl-4 text-sm">
								{iaResult.matched.map((m) => (
									<li key={m}>{m}</li>
								))}
							</ul>
						</Section>
					) : null}
					{iaResult.gaps.length > 0 ? (
						<Section title="Écarts / suggestions">
							<ul className="m-0 list-none space-y-2 p-0 text-sm">
								{iaResult.gaps.map((g) => (
									<li key={`${g.area}-${g.suggestion}`}>
										<span className="font-medium">{g.area}</span>
										{g.priority ? (
											<span className="text-zinc-500">
												{" "}
												· {priorityLabel[g.priority] ?? g.priority}
											</span>
										) : null}
										<p className="m-0 mt-0.5 text-zinc-600 dark:text-zinc-300">
											{g.suggestion}
										</p>
									</li>
								))}
							</ul>
						</Section>
					) : null}
					{iaResult.keywordsToAdd.length > 0 ? (
						<Section title="Mots-clés à renforcer">
							<p className="m-0 text-sm">{iaResult.keywordsToAdd.join(" · ")}</p>
						</Section>
					) : null}
				</div>
			) : null}
		</Dialog>
	);
};
