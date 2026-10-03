import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { TitleAppOne } from "@/components/title/TitleAppOne";
import { AppCard } from "@/components/card/AppCard";
import { trpc } from "@utils/trpc";
import type { AdminTemplateListItem } from "@/services/admin/adminTemplateService";
import { TemplateStyleCategory } from "../../../generated/prisma/enums";
import { TEMPLATE_STYLE_OPTIONS, templateStyleLabel } from "@/utils/templateStyleCategory";

type TemplateRow = AdminTemplateListItem;

const BOOL_OPTIONS: { label: string; value: boolean | null }[] = [
	{ label: "Tous", value: null },
	{ label: "Oui", value: true },
	{ label: "Non", value: false },
];

const STYLE_FILTER_OPTIONS: { label: string; value: TemplateStyleCategory | null }[] = [
	{ label: "Tous", value: null },
	...TEMPLATE_STYLE_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
];

function formatPrice(cents: number | null) {
	if (cents == null) return "—";
	return new Intl.NumberFormat("fr-FR", {
		style: "currency",
		currency: "EUR",
	}).format(cents / 100);
}

function formatCredits(credits: number | null) {
	if (credits == null) return "—";
	return `${credits} cr.`;
}

export function AdminTemplatesPage() {
	const router = useRouter();
	const toast = useRef<Toast>(null);
	const { data: session, status } = useSession();
	const isAdmin = session?.user?.role === "ADMIN";

	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");
	const [isActive, setIsActive] = useState<boolean | null>(null);
	const [isPremium, setIsPremium] = useState<boolean | null>(null);
	const [isFeatured, setIsFeatured] = useState<boolean | null>(null);
	const [styleCategory, setStyleCategory] = useState<TemplateStyleCategory | null>(null);
	const [page, setPage] = useState(1);
	const pageSize = 20;

	const [editing, setEditing] = useState<TemplateRow | null>(null);
	const [draftActive, setDraftActive] = useState(true);
	const [draftPremium, setDraftPremium] = useState(false);
	const [draftFeatured, setDraftFeatured] = useState(false);
	const [draftStyleCategory, setDraftStyleCategory] = useState<TemplateStyleCategory>(
		TemplateStyleCategory.CLASSIC,
	);
	const [draftSort, setDraftSort] = useState(0);
	const [draftPriceEuros, setDraftPriceEuros] = useState<number | null>(null);
	const [draftPriceCredits, setDraftPriceCredits] = useState<number | null>(null);
	const [draftGiftCredits, setDraftGiftCredits] = useState<number | null>(null);
	const [draftGiftFree, setDraftGiftFree] = useState<number | null>(null);

	useEffect(() => {
		if (status === "loading") return;
		if (status !== "authenticated" || !isAdmin) {
			void router.replace("/");
		}
	}, [status, isAdmin, router]);

	useEffect(() => {
		const t = setTimeout(() => {
			setSearch(searchInput.trim());
			setPage(1);
		}, 300);
		return () => clearTimeout(t);
	}, [searchInput]);

	const utils = trpc.useUtils();
	const listQuery = trpc.admin.listTemplates.useQuery(
		{
			page,
			pageSize,
			...(search ? { search } : {}),
			...(typeof isActive === "boolean" ? { isActive } : {}),
			...(typeof isPremium === "boolean" ? { isPremium } : {}),
			...(typeof isFeatured === "boolean" ? { isFeatured } : {}),
			...(styleCategory ? { styleCategory } : {}),
		},
		{ enabled: status === "authenticated" && isAdmin },
	);

	const updateMutation = trpc.admin.updateTemplateCatalog.useMutation({
		onSuccess: async () => {
			toast.current?.show({
				severity: "success",
				summary: "Catalogue",
				detail: "Modèle mis à jour.",
				life: 2500,
			});
			setEditing(null);
			await utils.admin.listTemplates.invalidate();
		},
		onError: (err) => {
			toast.current?.show({
				severity: "error",
				summary: "Erreur",
				detail: err.message || "Mise à jour impossible.",
				life: 4000,
			});
		},
	});

	const openEdit = (row: TemplateRow) => {
		setEditing(row);
		setDraftActive(row.isActive);
		setDraftPremium(row.isPremium);
		setDraftFeatured(row.isFeatured);
		setDraftStyleCategory(row.styleCategory);
		setDraftSort(row.sortOrder);
		setDraftPriceEuros(row.priceCents != null ? row.priceCents / 100 : null);
		setDraftPriceCredits(row.priceCredits);
		setDraftGiftCredits(row.unlockGifts?.downloadCredits ?? null);
		setDraftGiftFree(row.unlockGifts?.freeDownloads ?? null);
	};

	const saveEdit = () => {
		if (!editing) return;

		const hasGifts =
			(draftGiftCredits != null && draftGiftCredits > 0) ||
			(draftGiftFree != null && draftGiftFree > 0);

		updateMutation.mutate({
			id: editing.id,
			isActive: draftActive,
			isPremium: draftPremium,
			isFeatured: draftFeatured,
			styleCategory: draftStyleCategory,
			sortOrder: draftSort,
			priceCents: draftPriceEuros == null ? null : Math.round(draftPriceEuros * 100),
			priceCredits: draftPriceCredits,
			unlockGifts: hasGifts
				? {
						...(draftGiftCredits != null && draftGiftCredits > 0
							? { downloadCredits: draftGiftCredits }
							: {}),
						...(draftGiftFree != null && draftGiftFree > 0 ? { freeDownloads: draftGiftFree } : {}),
					}
				: null,
		});
	};

	const total = listQuery.data?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	if (status === "loading") {
		return (
			<div className="mx-auto max-w-6xl px-4 py-10">
				<p className="text-sm text-zinc-500">Chargement…</p>
			</div>
		);
	}

	if (status !== "authenticated" || !isAdmin) {
		return (
			<div className="mx-auto max-w-6xl px-4 py-10">
				<p className="text-sm text-zinc-500">Accès réservé aux admins.</p>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
			<Toast ref={toast} position="top-center" />

			<div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<Link
						href="/admin"
						className="mb-2 inline-block text-xs text-zinc-500 hover:text-primary dark:hover:text-primary-dark"
					>
						← Dashboard
					</Link>
					<TitleAppOne
						firstPart="Admin"
						secondPart="templates"
						withSpace
						classNameSize="text-3xl sm:text-4xl"
					/>
				</div>
				<p className="m-0 text-sm text-zinc-500 dark:text-zinc-400">
					{total} modèle{total > 1 ? "s" : ""}
				</p>
			</div>

			<AppCard className="admin-filters mb-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<div className="min-w-0 flex-1 sm:max-w-md">
						<label htmlFor="admin-templates-search" className="mb-1 block text-xs text-zinc-500">Recherche</label>
						<div className="relative w-full">
							<i className="pi pi-search pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-sm text-zinc-500 dark:text-zinc-400" />
							<InputText
								id="admin-templates-search"
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								placeholder="Nom du modèle…"
								className="w-full !pl-10"
							/>
						</div>
					</div>
					<div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
						<div className="w-full sm:w-32">
							<label htmlFor="admin-templates-active" className="mb-1 block text-xs text-zinc-500">Actif</label>
							<Dropdown
								id="admin-templates-active"
								value={isActive}
								options={BOOL_OPTIONS}
								onChange={(e) => {
									setIsActive(e.value as boolean | null);
									setPage(1);
								}}
								optionLabel="label"
								optionValue="value"
								className="w-full"
							/>
						</div>
						<div className="w-full sm:w-32">
							<label htmlFor="admin-templates-premium" className="mb-1 block text-xs text-zinc-500">Premium</label>
							<Dropdown
								id="admin-templates-premium"
								value={isPremium}
								options={BOOL_OPTIONS}
								onChange={(e) => {
									setIsPremium(e.value as boolean | null);
									setPage(1);
								}}
								optionLabel="label"
								optionValue="value"
								className="w-full"
							/>
						</div>
						<div className="w-full sm:w-36">
							<label htmlFor="admin-templates-featured" className="mb-1 block text-xs text-zinc-500">À la une</label>
							<Dropdown
								id="admin-templates-featured"
								value={isFeatured}
								options={BOOL_OPTIONS}
								onChange={(e) => {
									setIsFeatured(e.value as boolean | null);
									setPage(1);
								}}
								optionLabel="label"
								optionValue="value"
								className="w-full"
							/>
						</div>
						<div className="w-full sm:w-40">
							<label htmlFor="admin-templates-style" className="mb-1 block text-xs text-zinc-500">Style</label>
							<Dropdown
								id="admin-templates-style"
								value={styleCategory}
								options={STYLE_FILTER_OPTIONS}
								onChange={(e) => {
									setStyleCategory(e.value as TemplateStyleCategory | null);
									setPage(1);
								}}
								optionLabel="label"
								optionValue="value"
								className="w-full"
							/>
						</div>
					</div>
				</div>
			</AppCard>

			<AppCard className="overflow-x-auto !p-0">
				<table className="w-full min-w-[56rem] border-collapse text-left text-sm">
					<thead>
						<tr className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400">
							<th className="px-4 py-3 font-semibold">Modèle</th>
							<th className="px-3 py-3 font-semibold">Statut</th>
							<th className="px-3 py-3 font-semibold">Type</th>
							<th className="px-3 py-3 font-semibold">Style</th>
							<th className="px-3 py-3 font-semibold">€</th>
							<th className="px-3 py-3 font-semibold">Crédits</th>
							<th className="px-3 py-3 font-semibold">Ordre</th>
							<th className="px-3 py-3 font-semibold">CV</th>
							<th className="px-3 py-3 font-semibold">Unlocks</th>
							<th className="px-3 py-3 font-semibold" />
						</tr>
					</thead>
					<tbody>
						{listQuery.isLoading ? (
							<tr>
								<td colSpan={10} className="px-4 py-8 text-center text-zinc-500">
									Chargement…
								</td>
							</tr>
						) : (listQuery.data?.items.length ?? 0) === 0 ? (
							<tr>
								<td colSpan={10} className="px-4 py-8 text-center text-zinc-500">
									Aucun modèle.
								</td>
							</tr>
						) : (
							listQuery.data!.items.map((t) => (
								<tr key={t.id} className="border-b border-zinc-100 dark:border-zinc-800">
									<td className="px-4 py-3">
										<span className="font-medium text-zinc-900 dark:text-zinc-100">{t.name}</span>
										{t.isFeatured ? (
											<span className="ml-2 text-xs font-medium text-amber-600 dark:text-amber-400">
												★ À la une
											</span>
										) : null}
									</td>
									<td className="px-3 py-3 text-xs">
										{t.isActive ? (
											<span className="font-medium text-emerald-600 dark:text-emerald-400">
												Actif
											</span>
										) : (
											<span className="text-zinc-500">Inactif</span>
										)}
									</td>
									<td className="px-3 py-3 text-xs">
										{t.isPremium ? (
											<span className="font-medium text-amber-600 dark:text-amber-400">
												Premium
											</span>
										) : (
											<span className="text-zinc-500">Free</span>
										)}
									</td>
									<td className="px-3 py-3 text-xs text-zinc-600 dark:text-zinc-400">
										{templateStyleLabel(t.styleCategory)}
									</td>
									<td className="px-3 py-3 text-zinc-700 dark:text-zinc-300">
										{formatPrice(t.priceCents)}
									</td>
									<td className="px-3 py-3 text-zinc-700 dark:text-zinc-300">
										{formatCredits(t.priceCredits)}
									</td>
									<td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">{t.sortOrder}</td>
									<td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">{t.cvCount}</td>
									<td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">{t.unlockCount}</td>
									<td className="px-3 py-3 text-right">
										<Button
											type="button"
											size="small"
											outlined
											label="Éditer"
											onClick={() => openEdit(t)}
										/>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</AppCard>

			{totalPages > 1 ? (
				<div className="mt-4 flex items-center justify-between gap-3">
					<p className="m-0 text-xs text-zinc-500">
						Page {page} / {totalPages}
					</p>
					<div className="flex gap-2">
						<Button
							type="button"
							size="small"
							outlined
							label="Précédent"
							disabled={page <= 1 || listQuery.isFetching}
							onClick={() => setPage((p) => Math.max(1, p - 1))}
						/>
						<Button
							type="button"
							size="small"
							outlined
							label="Suivant"
							disabled={page >= totalPages || listQuery.isFetching}
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
						/>
					</div>
				</div>
			) : null}

			<Dialog
				header={editing ? `Éditer — ${editing.name}` : "Éditer"}
				visible={editing != null}
				onHide={() => setEditing(null)}
				style={{ width: "min(32rem, 94vw)" }}
				className="dialog-admin-template"
				modal
				draggable={false}
				footer={
					<div className="flex justify-end gap-2">
						<Button
							type="button"
							label="Annuler"
							outlined
							onClick={() => setEditing(null)}
							disabled={updateMutation.isPending}
						/>
						<Button
							type="button"
							label="Enregistrer"
							onClick={saveEdit}
							loading={updateMutation.isPending}
						/>
					</div>
				}
			>
				{editing ? (
					<div className="admin-user-actions flex flex-col gap-4">
						<div className="flex flex-wrap gap-4">
							<label htmlFor="admin-templates-active" className="flex items-center gap-2 text-sm">
								<Checkbox id="admin-templates-active" checked={draftActive} onChange={(e) => setDraftActive(!!e.checked)} />
								Actif
							</label>
							<label htmlFor="admin-templates-premium" className="flex items-center gap-2 text-sm">
								<Checkbox id="admin-templates-premium" checked={draftPremium} onChange={(e) => setDraftPremium(!!e.checked)} />
								Premium
							</label>
							<label htmlFor="admin-templates-featured" className="flex items-center gap-2 text-sm">
								<Checkbox id="admin-templates-featured" checked={draftFeatured} onChange={(e) => setDraftFeatured(!!e.checked)} />
								À la une
							</label>
						</div>

						<div>
							<label htmlFor="admin-templates-draft-style" className="mb-1 block text-xs text-zinc-500">
								Style marketing
							</label>
							<Dropdown
								id="admin-templates-draft-style"
								value={draftStyleCategory}
								options={TEMPLATE_STYLE_OPTIONS}
								onChange={(e) => setDraftStyleCategory(e.value as TemplateStyleCategory)}
								optionLabel="label"
								optionValue="value"
								className="w-full"
							/>
						</div>

						<div className="grid gap-3 sm:grid-cols-3">
							<div>
								<label htmlFor="admin-templates-price-euros" className="mb-1 block text-xs text-zinc-500">Prix (€)</label>
								<InputNumber
									id="admin-templates-price-euros"
									value={draftPriceEuros}
									onValueChange={(e) =>
										setDraftPriceEuros(e.value == null ? null : Number(e.value))
									}
									mode="currency"
									currency="EUR"
									locale="fr-FR"
									min={0}
									className="w-full"
									inputClassName="w-full"
								/>
							</div>
							<div>
								<label htmlFor="admin-templates-price-credits" className="mb-1 block text-xs text-zinc-500">Prix (crédits)</label>
								<InputNumber
									id="admin-templates-price-credits"
									value={draftPriceCredits}
									onValueChange={(e) =>
										setDraftPriceCredits(e.value == null ? null : Number(e.value))
									}
									min={0}
									showButtons
									className="w-full"
									inputClassName="w-full"
								/>
							</div>
							<div>
								<label htmlFor="admin-templates-sort" className="mb-1 block text-xs text-zinc-500">Ordre</label>
								<InputNumber
									id="admin-templates-sort"
									value={draftSort}
									onValueChange={(e) => setDraftSort(typeof e.value === "number" ? e.value : 0)}
									min={0}
									showButtons
									className="w-full"
									inputClassName="w-full"
								/>
							</div>
						</div>

						<div>
							<p className="mb-2 m-0 text-xs font-medium uppercase tracking-wide text-zinc-500">
								Cadeaux à l’unlock
							</p>
							<div className="grid gap-3 sm:grid-cols-2">
								<div>
									<label htmlFor="admin-templates-gift-credits" className="mb-1 block text-xs text-zinc-500">Crédits DL</label>
									<InputNumber
										id="admin-templates-gift-credits"
										value={draftGiftCredits}
										onValueChange={(e) =>
											setDraftGiftCredits(e.value == null ? null : Number(e.value))
										}
										min={0}
										className="w-full"
										inputClassName="w-full"
									/>
								</div>
								<div>
									<label htmlFor="admin-templates-gift-free" className="mb-1 block text-xs text-zinc-500">Free DL</label>
									<InputNumber
										id="admin-templates-gift-free"
										value={draftGiftFree}
										onValueChange={(e) =>
											setDraftGiftFree(e.value == null ? null : Number(e.value))
										}
										min={0}
										className="w-full"
										inputClassName="w-full"
									/>
								</div>
							</div>
						</div>
					</div>
				) : null}
			</Dialog>
		</div>
	);
}
