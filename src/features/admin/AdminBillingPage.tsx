import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import { TitleAppOne } from "@/components/title/TitleAppOne";
import { AppCard } from "@/components/card/AppCard";
import { trpc } from "@utils/trpc";
import type { BillableAiFeature } from "@/services/ai/aiBillingService";
import { getClientErrorMessage } from "@/utils/clientError";

const FEATURE_LABELS: Record<BillableAiFeature, string> = {
	REVIEW_CV: "Relecture",
	REWRITE_SECTION: "Reformulation",
	COVER_LETTER: "Lettre de motivation",
};

function formatPrice(cents: number) {
	return new Intl.NumberFormat("fr-FR", {
		style: "currency",
		currency: "EUR",
	}).format(cents / 100);
}

type PackRow = {
	id: string;
	name: string;
	description: string | null;
	priceCents: number;
	downloadCredits: number;
	freeDownloads: number;
	sortOrder: number;
	isActive: boolean;
	stripePriceId: string | null;
};

export function AdminBillingPage() {
	const router = useRouter();
	const toast = useRef<Toast>(null);
	const { data: session, status } = useSession();
	const isAdmin = session?.user?.role === "ADMIN";
	const utils = trpc.useUtils();

	const pricesQuery = trpc.admin.listAiFeaturePrices.useQuery(undefined, {
		enabled: status === "authenticated" && isAdmin,
	});
	const packsQuery = trpc.admin.listCreditPacks.useQuery(undefined, {
		enabled: status === "authenticated" && isAdmin,
	});

	const [priceDrafts, setPriceDrafts] = useState<
		Record<
			BillableAiFeature,
			{ costFree: number | null; costPaid: number | null }
		>
	>({
		REVIEW_CV: { costFree: null, costPaid: null },
		REWRITE_SECTION: { costFree: null, costPaid: null },
		COVER_LETTER: { costFree: null, costPaid: null },
	});

	useEffect(() => {
		if (status === "loading") return;
		if (status !== "authenticated" || !isAdmin) {
			void router.replace("/");
		}
	}, [status, isAdmin, router]);

	useEffect(() => {
		if (!pricesQuery.data) return;
		const next = { ...priceDrafts };
		for (const row of pricesQuery.data) {
			next[row.feature] = {
				costFree: row.costFree,
				costPaid: row.costPaid,
			};
		}
		setPriceDrafts(next);
		// eslint-disable-next-line react-hooks/exhaustive-deps -- sync from server only
	}, [pricesQuery.data]);

	const upsertPriceMutation = trpc.admin.upsertAiFeaturePrice.useMutation({
		onSuccess: async () => {
			await utils.admin.listAiFeaturePrices.invalidate();
			toast.current?.show({
				severity: "success",
				summary: "Tarif enregistré",
				life: 2500,
			});
		},
		onError: (err) => {
			toast.current?.show({
				severity: "error",
				summary: "Erreur",
				detail: getClientErrorMessage(err, "Impossible d’enregistrer"),
				life: 4000,
			});
		},
	});

	const [editingPack, setEditingPack] = useState<PackRow | null>(null);
	const [creating, setCreating] = useState(false);
	const [draftName, setDraftName] = useState("");
	const [draftDescription, setDraftDescription] = useState("");
	const [draftPriceEuros, setDraftPriceEuros] = useState<number | null>(null);
	const [draftCredits, setDraftCredits] = useState<number | null>(null);
	const [draftFree, setDraftFree] = useState<number | null>(0);
	const [draftSort, setDraftSort] = useState(0);
	const [draftActive, setDraftActive] = useState(true);

	const openCreate = () => {
		setEditingPack(null);
		setCreating(true);
		setDraftName("");
		setDraftDescription("");
		setDraftPriceEuros(4.99);
		setDraftCredits(3);
		setDraftFree(1);
		setDraftSort(0);
		setDraftActive(true);
	};

	const openEdit = (pack: PackRow) => {
		setCreating(false);
		setEditingPack(pack);
		setDraftName(pack.name);
		setDraftDescription(pack.description ?? "");
		setDraftPriceEuros(pack.priceCents / 100);
		setDraftCredits(pack.downloadCredits);
		setDraftFree(pack.freeDownloads);
		setDraftSort(pack.sortOrder);
		setDraftActive(pack.isActive);
	};

	const closePackDialog = () => {
		setCreating(false);
		setEditingPack(null);
	};

	const createMutation = trpc.admin.createCreditPack.useMutation({
		onSuccess: async () => {
			await utils.admin.listCreditPacks.invalidate();
			closePackDialog();
			toast.current?.show({
				severity: "success",
				summary: "Pack créé",
				life: 2500,
			});
		},
		onError: (err) => {
			toast.current?.show({
				severity: "error",
				summary: "Erreur",
				detail: getClientErrorMessage(err, "Impossible de créer"),
				life: 4000,
			});
		},
	});

	const updateMutation = trpc.admin.updateCreditPack.useMutation({
		onSuccess: async () => {
			await utils.admin.listCreditPacks.invalidate();
			closePackDialog();
			toast.current?.show({
				severity: "success",
				summary: "Pack mis à jour",
				life: 2500,
			});
		},
		onError: (err) => {
			toast.current?.show({
				severity: "error",
				summary: "Erreur",
				detail: getClientErrorMessage(err, "Impossible d’enregistrer"),
				life: 4000,
			});
		},
	});

	const deleteMutation = trpc.admin.deleteCreditPack.useMutation({
		onSuccess: async () => {
			await utils.admin.listCreditPacks.invalidate();
			toast.current?.show({
				severity: "success",
				summary: "Pack supprimé",
				life: 2500,
			});
		},
		onError: (err) => {
			toast.current?.show({
				severity: "error",
				summary: "Erreur",
				detail: getClientErrorMessage(err, "Impossible de supprimer"),
				life: 4000,
			});
		},
	});

	const savePack = () => {
		if (!draftName.trim() || draftPriceEuros == null || draftCredits == null) {
			toast.current?.show({
				severity: "warn",
				summary: "Champs requis",
				detail: "Nom, prix et crédits payants sont obligatoires.",
				life: 3500,
			});
			return;
		}
		const payload = {
			name: draftName.trim(),
			description: draftDescription.trim() || null,
			priceCents: Math.round(draftPriceEuros * 100),
			downloadCredits: draftCredits,
			freeDownloads: draftFree ?? 0,
			sortOrder: draftSort,
			isActive: draftActive,
		};
		if (editingPack) {
			updateMutation.mutate({ id: editingPack.id, ...payload });
		} else {
			createMutation.mutate(payload);
		}
	};

	if (status === "loading") {
		return (
			<div className="mx-auto max-w-5xl px-4 py-10">
				<p className="text-sm text-zinc-500">Chargement…</p>
			</div>
		);
	}

	if (status !== "authenticated" || !isAdmin) {
		return (
			<div className="mx-auto max-w-5xl px-4 py-10">
				<p className="text-sm text-zinc-500">Accès réservé aux admins.</p>
			</div>
		);
	}

	const packDialogOpen = creating || editingPack != null;

	return (
		<div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
			<Toast ref={toast} position="top-center" />
			<div className="mb-6">
				<Link
					href="/admin"
					className="mb-2 inline-block text-xs text-zinc-500 hover:text-primary dark:hover:text-primary-dark"
				>
					← Dashboard
				</Link>
				<TitleAppOne
					firstPart="Admin"
					secondPart="tarifs"
					withSpace
					classNameSize="text-3xl sm:text-4xl"
				/>
			</div>

			<section className="mb-8">
				<h3 className="mb-1.5 m-0 text-sm font-semibold uppercase tracking-wide text-zinc-500">
					Tarifs IA (crédits)
				</h3>
				<p className="mb-3 m-0 text-xs text-zinc-500 dark:text-zinc-400">
					Import PDF reste sur quotas gratuits. Null = option non proposée.
				</p>
				<AppCard className="admin-filters overflow-x-auto p-0">
					<table className="w-full min-w-[36rem] border-collapse text-sm">
						<thead>
							<tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-700">
								<th className="px-4 py-3 font-semibold">Service</th>
								<th className="px-4 py-3 font-semibold">Coût free</th>
								<th className="px-4 py-3 font-semibold">Coût payant</th>
								<th className="px-4 py-3 font-semibold" />
							</tr>
						</thead>
						<tbody>
							{(
								[
									"REVIEW_CV",
									"REWRITE_SECTION",
									"COVER_LETTER",
								] as BillableAiFeature[]
							).map((feature) => {
								const draft = priceDrafts[feature];
								return (
									<tr
										key={feature}
										className="border-b border-zinc-100 dark:border-zinc-800"
									>
										<td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
											{FEATURE_LABELS[feature]}
										</td>
										<td className="px-4 py-3">
											<InputNumber
												value={draft.costFree}
												onValueChange={(e) =>
													setPriceDrafts((prev) => ({
														...prev,
														[feature]: {
															...prev[feature],
															costFree: e.value ?? null,
														},
													}))
												}
												min={1}
												max={100}
												showButtons={false}
												placeholder="—"
												className="w-24"
											/>
										</td>
										<td className="px-4 py-3">
											<InputNumber
												value={draft.costPaid}
												onValueChange={(e) =>
													setPriceDrafts((prev) => ({
														...prev,
														[feature]: {
															...prev[feature],
															costPaid: e.value ?? null,
														},
													}))
												}
												min={1}
												max={100}
												showButtons={false}
												placeholder="—"
												className="w-24"
											/>
										</td>
										<td className="px-4 py-3 text-right">
											<Button
												type="button"
												label="Enregistrer"
												size="small"
												loading={
													upsertPriceMutation.isPending &&
													upsertPriceMutation.variables
														?.feature === feature
												}
												onClick={() =>
													upsertPriceMutation.mutate({
														feature,
														costFree: draft.costFree,
														costPaid: draft.costPaid,
													})
												}
											/>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</AppCard>
			</section>

			<section>
				<div className="mb-1.5 flex items-center justify-between gap-3">
					<h3 className="m-0 text-sm font-semibold uppercase tracking-wide text-zinc-500">
						Packs de crédits
					</h3>
					<Button
						type="button"
						label="Nouveau pack"
						size="small"
						onClick={openCreate}
					/>
				</div>
				<p className="mb-3 m-0 text-xs text-zinc-500 dark:text-zinc-400">
					Vitrine configurée — achat Stripe bientôt.
				</p>
				{packsQuery.isLoading ? (
					<p className="text-sm text-zinc-500">Chargement…</p>
				) : (packsQuery.data?.length ?? 0) === 0 ? (
					<AppCard>
						<p className="m-0 text-sm text-zinc-500">Aucun pack.</p>
					</AppCard>
				) : (
					<div className="flex flex-col gap-2">
						{packsQuery.data?.map((pack) => (
							<AppCard
								key={pack.id}
								className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
							>
								<div>
									<p className="m-0 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
										{pack.name}
										{!pack.isActive ? (
											<span className="ml-2 text-xs font-normal text-zinc-400">
												(inactif)
											</span>
										) : null}
									</p>
									<p className="m-0 mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
										{formatPrice(pack.priceCents)} ·{" "}
										{pack.downloadCredits} cr. payants
										{pack.freeDownloads > 0
											? ` · ${pack.freeDownloads} free`
											: ""}
										{" · "}ord. {pack.sortOrder}
									</p>
									{pack.description ? (
										<p className="m-0 mt-1 text-xs text-zinc-600 dark:text-zinc-400">
											{pack.description}
										</p>
									) : null}
								</div>
								<div className="flex gap-2">
									<Button
										type="button"
										label="Éditer"
										size="small"
										outlined
										onClick={() => openEdit(pack)}
									/>
									<Button
										type="button"
										label="Supprimer"
										size="small"
										severity="danger"
										outlined
										loading={
											deleteMutation.isPending &&
											deleteMutation.variables?.id === pack.id
										}
										onClick={() => {
											if (
												typeof window !== "undefined" &&
												!window.confirm(
													`Supprimer le pack « ${pack.name} » ?`,
												)
											) {
												return;
											}
											deleteMutation.mutate({ id: pack.id });
										}}
									/>
								</div>
							</AppCard>
						))}
					</div>
				)}
			</section>

			<Dialog
				visible={packDialogOpen}
				onHide={closePackDialog}
				header={editingPack ? "Éditer le pack" : "Nouveau pack"}
				style={{ width: "480px", maxWidth: "92vw" }}
				footer={
					<div className="flex justify-end gap-2">
						<Button
							type="button"
							label="Annuler"
							outlined
							onClick={closePackDialog}
						/>
						<Button
							type="button"
							label="Enregistrer"
							loading={
								createMutation.isPending || updateMutation.isPending
							}
							onClick={savePack}
						/>
					</div>
				}
			>
				<div className="admin-filters flex flex-col gap-3">
					<label className="flex flex-col gap-1 text-sm">
						<span className="text-zinc-600 dark:text-zinc-400">Nom</span>
						<InputText
							value={draftName}
							onChange={(e) => setDraftName(e.target.value)}
						/>
					</label>
					<label className="flex flex-col gap-1 text-sm">
						<span className="text-zinc-600 dark:text-zinc-400">
							Description
						</span>
						<InputTextarea
							value={draftDescription}
							onChange={(e) => setDraftDescription(e.target.value)}
							rows={2}
							autoResize
						/>
					</label>
					<div className="grid grid-cols-2 gap-3">
						<label className="flex flex-col gap-1 text-sm">
							<span className="text-zinc-600 dark:text-zinc-400">
								Prix (€)
							</span>
							<InputNumber
								value={draftPriceEuros}
								onValueChange={(e) =>
									setDraftPriceEuros(e.value ?? null)
								}
								mode="currency"
								currency="EUR"
								locale="fr-FR"
								minFractionDigits={2}
							/>
						</label>
						<label className="flex flex-col gap-1 text-sm">
							<span className="text-zinc-600 dark:text-zinc-400">
								Ordre
							</span>
							<InputNumber
								value={draftSort}
								onValueChange={(e) =>
									setDraftSort(e.value ?? 0)
								}
								min={0}
							/>
						</label>
						<label className="flex flex-col gap-1 text-sm">
							<span className="text-zinc-600 dark:text-zinc-400">
								Crédits payants
							</span>
							<InputNumber
								value={draftCredits}
								onValueChange={(e) =>
									setDraftCredits(e.value ?? null)
								}
								min={1}
							/>
						</label>
						<label className="flex flex-col gap-1 text-sm">
							<span className="text-zinc-600 dark:text-zinc-400">
								Free DL (bonus)
							</span>
							<InputNumber
								value={draftFree}
								onValueChange={(e) =>
									setDraftFree(e.value ?? 0)
								}
								min={0}
							/>
						</label>
					</div>
					<label className="flex items-center gap-2 text-sm">
						<Checkbox
							checked={draftActive}
							onChange={(e) => setDraftActive(!!e.checked)}
						/>
						<span>Actif (visible vitrine)</span>
					</label>
				</div>
			</Dialog>
		</div>
	);
}
