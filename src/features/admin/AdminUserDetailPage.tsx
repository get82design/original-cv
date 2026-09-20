import { useEffect, useRef, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { TitleAppOne } from "@/components/title/TitleAppOne";
import { AppCard } from "@/components/card/AppCard";
import { trpc } from "@utils/trpc";
import { PlanRole } from "../../../generated/prisma/enums";

const PLAN_OPTIONS: { label: string; value: PlanRole }[] = [
	{ label: "FREE", value: PlanRole.FREE },
	{ label: "STANDARD", value: PlanRole.STANDARD },
	{ label: "PREMIUM", value: PlanRole.PREMIUM },
	{ label: "PREMIUM+IA", value: PlanRole.PREMIUM_PLUS_IA },
];

const PREMIUM_PLANS: PlanRole[] = [
	PlanRole.PREMIUM,
	PlanRole.PREMIUM_PLUS_IA,
];

function formatDate(d: Date | string | null | undefined) {
	if (!d) return "—";
	const date = typeof d === "string" ? new Date(d) : d;
	return date.toLocaleString("fr-FR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function aiFeatureLabel(
	feature: "IMPORT_CV" | "REVIEW_CV" | "REWRITE_SECTION",
) {
	switch (feature) {
		case "IMPORT_CV":
			return "Import PDF";
		case "REVIEW_CV":
			return "Relecture";
		case "REWRITE_SECTION":
			return "Reformulation";
	}
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
	return (
		<div className="flex flex-col gap-0.5 border-b border-zinc-100 py-2 last:border-0 dark:border-zinc-800 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
			<span className="text-xs font-medium text-zinc-500">{label}</span>
			<span className="text-sm text-zinc-900 dark:text-zinc-100">
				{value}
			</span>
		</div>
	);
}

export function AdminUserDetailPage() {
	const router = useRouter();
	const toast = useRef<Toast>(null);
	const { data: session, status } = useSession();
	const isAdmin = session?.user?.role === "ADMIN";
	const id = typeof router.query.id === "string" ? router.query.id : null;
	const isSelf = !!id && session?.user?.id === id;

	const [creditsDraft, setCreditsDraft] = useState<number | null>(null);
	const [freeDraft, setFreeDraft] = useState<number | null>(null);
	const [planDraft, setPlanDraft] = useState<PlanRole | null>(null);
	const [subEndDraft, setSubEndDraft] = useState<Date | null>(null);

	useEffect(() => {
		if (status === "loading") return;
		if (status !== "authenticated" || !isAdmin) {
			void router.replace("/");
		}
	}, [status, isAdmin, router]);

	const utils = trpc.useUtils();
	const detailQuery = trpc.admin.getUser.useQuery(
		{ id: id! },
		{ enabled: status === "authenticated" && isAdmin && !!id },
	);

	useEffect(() => {
		const user = detailQuery.data;
		if (!user) return;
		setCreditsDraft(user.downloadCredits);
		setFreeDraft(user.freeDownloadsRemaining);
		setPlanDraft(user.plan);
		setSubEndDraft(
			user.subscriptionEnd ? new Date(user.subscriptionEnd) : null,
		);
	}, [detailQuery.data]);

	const invalidateUser = async () => {
		if (!id) return;
		await utils.admin.getUser.invalidate({ id });
		await utils.admin.listUsers.invalidate();
	};

	const updateMutation = trpc.admin.updateUser.useMutation({
		onSuccess: async () => {
			toast.current?.show({
				severity: "success",
				summary: "Mis à jour",
				detail: "Utilisateur enregistré.",
				life: 2500,
			});
			await invalidateUser();
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

	const softResetMutation = trpc.admin.softResetUser.useMutation({
		onSuccess: async () => {
			toast.current?.show({
				severity: "success",
				summary: "Reset soft",
				detail: "Crédits, free DL et compteur IA remis à zéro.",
				life: 3000,
			});
			await invalidateUser();
		},
		onError: (err) => {
			toast.current?.show({
				severity: "error",
				summary: "Erreur",
				detail: err.message || "Reset impossible.",
				life: 4000,
			});
		},
	});

	if (status === "loading" || !router.isReady) {
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

	const user = detailQuery.data;
	const busy = updateMutation.isPending || softResetMutation.isPending;
	const planDirty =
		planDraft != null &&
		(planDraft !== user?.plan ||
			(subEndDraft?.getTime() ?? null) !==
				(user?.subscriptionEnd
					? new Date(user.subscriptionEnd).getTime()
					: null));
	const planNeedsEnd =
		planDraft != null && PREMIUM_PLANS.includes(planDraft);

	return (
		<div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
			<Toast ref={toast} position="top-center" />
			<div className="mb-6">
				<Link
					href="/admin/users"
					className="mb-2 inline-block text-xs text-zinc-500 hover:text-primary dark:hover:text-primary-dark"
				>
					← Liste users
				</Link>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<TitleAppOne
							firstPart="Fiche"
							secondPart="user"
							withSpace
							classNameSize="text-3xl sm:text-4xl"
						/>
						{user ? (
							<p className="mt-2 m-0 text-sm text-zinc-600 dark:text-zinc-400">
								{user.email}
								{user.name ? ` · ${user.name}` : ""}
							</p>
						) : null}
					</div>
					{user ? (
						<Button
							type="button"
							size="small"
							severity={user.isActive ? "danger" : "success"}
							outlined
							label={user.isActive ? "Désactiver" : "Réactiver"}
							disabled={busy || (isSelf && user.isActive)}
							loading={busy}
							onClick={() =>
								updateMutation.mutate({
									id: user.id,
									isActive: !user.isActive,
								})
							}
							tooltip={
								isSelf && user.isActive
									? "Impossible de désactiver votre propre compte"
									: undefined
							}
							tooltipOptions={{ position: "top" }}
						/>
					) : null}
				</div>
			</div>

			{detailQuery.isLoading ? (
				<p className="text-sm text-zinc-500">Chargement…</p>
			) : detailQuery.isError ? (
				<AppCard>
					<p className="m-0 text-sm text-red-600 dark:text-red-400">
						{detailQuery.error.message || "Utilisateur introuvable."}
					</p>
				</AppCard>
			) : user ? (
				<div className="flex flex-col gap-4">
					<section className="admin-user-actions">
						<h3 className="mb-2 m-0 text-sm font-semibold uppercase tracking-wide text-zinc-500">
							Actions
						</h3>
						<AppCard>
							<div className="grid gap-5 sm:grid-cols-2 sm:items-start">
								<div className="flex flex-col gap-2">
									<p className="m-0 text-sm font-medium text-zinc-900 dark:text-zinc-100">
										Abonnement
									</p>
									<div className="flex flex-wrap items-end gap-2">
										<div className="w-[7.5rem]">
											<label className="mb-1 block text-xs text-zinc-500">
												Plan
											</label>
											<Dropdown
												value={planDraft}
												options={PLAN_OPTIONS}
												onChange={(e) => {
													const next =
														e.value as PlanRole;
													setPlanDraft(next);
													if (
														!PREMIUM_PLANS.includes(
															next,
														)
													) {
														setSubEndDraft(null);
													}
												}}
												className="w-full"
												disabled={busy}
											/>
										</div>
										<div className="w-36">
											<label className="mb-1 block text-xs text-zinc-500">
												Fin abo
											</label>
											<Calendar
												value={subEndDraft}
												onChange={(e) =>
													setSubEndDraft(
														(e.value as Date | null) ??
															null,
													)
												}
												dateFormat="dd/mm/yy"
												showIcon
												disabled={busy || !planNeedsEnd}
												className="w-full"
												inputClassName="w-full text-sm"
											/>
										</div>
										<Button
											type="button"
											size="small"
											label="Appliquer"
											disabled={
												busy ||
												!planDirty ||
												(planNeedsEnd && !subEndDraft)
											}
											loading={busy}
											onClick={() => {
												if (!planDraft) return;
												updateMutation.mutate({
													id: user.id,
													plan: planDraft,
													subscriptionEnd:
														planNeedsEnd
															? subEndDraft
															: null,
												});
											}}
										/>
									</div>
								</div>

								<div className="flex flex-col gap-2">
									<p className="m-0 text-sm font-medium text-zinc-900 dark:text-zinc-100">
										Reset soft
									</p>
									<p className="m-0 text-xs text-zinc-500">
										Crédits, free DL et compteur IA → 0.
										Compte / CV / historique conservés.
									</p>
									<Button
										type="button"
										size="small"
										severity="warning"
										outlined
										label="Reset soft"
										className="self-start"
										disabled={busy}
										loading={softResetMutation.isPending}
										onClick={() => {
											if (
												!window.confirm(
													"Remettre crédits, free DL et compteur IA à zéro ?",
												)
											) {
												return;
											}
											softResetMutation.mutate({
												id: user.id,
											});
										}}
									/>
								</div>

								<div className="flex flex-col gap-2">
									<p className="m-0 text-sm font-medium text-zinc-900 dark:text-zinc-100">
										Crédits (sans logo)
									</p>
									<div className="flex flex-wrap items-center gap-2">
										<InputNumber
											value={creditsDraft}
											onValueChange={(e) =>
												setCreditsDraft(e.value ?? null)
											}
											min={0}
											max={10000}
											showButtons
											buttonLayout="stacked"
											decrementButtonClassName="admin-inputnumber-btn"
											incrementButtonClassName="admin-inputnumber-btn"
											className="w-24"
											inputClassName="w-full text-sm"
											disabled={busy}
										/>
										<Button
											type="button"
											size="small"
											label="Appliquer"
											disabled={
												busy ||
												creditsDraft === null ||
												creditsDraft ===
													user.downloadCredits
											}
											loading={busy}
											onClick={() => {
												if (creditsDraft === null)
													return;
												updateMutation.mutate({
													id: user.id,
													downloadCredits:
														creditsDraft,
												});
											}}
										/>
										<div className="flex gap-1">
											{[1, 3, 5].map((n) => (
												<Button
													key={n}
													type="button"
													size="small"
													outlined
													label={`+${n}`}
													disabled={busy}
													onClick={() =>
														updateMutation.mutate({
															id: user.id,
															downloadCredits:
																user.downloadCredits +
																n,
														})
													}
												/>
											))}
										</div>
									</div>
								</div>

								<div className="flex flex-col gap-2">
									<p className="m-0 text-sm font-medium text-zinc-900 dark:text-zinc-100">
										Free DL (avec logo)
									</p>
									<div className="flex flex-wrap items-center gap-2">
										<InputNumber
											value={freeDraft}
											onValueChange={(e) =>
												setFreeDraft(e.value ?? null)
											}
											min={0}
											max={10000}
											showButtons
											buttonLayout="stacked"
											decrementButtonClassName="admin-inputnumber-btn"
											incrementButtonClassName="admin-inputnumber-btn"
											className="w-24"
											inputClassName="w-full text-sm"
											disabled={busy}
										/>
										<Button
											type="button"
											size="small"
											label="Appliquer"
											disabled={
												busy ||
												freeDraft === null ||
												freeDraft ===
													user.freeDownloadsRemaining
											}
											loading={busy}
											onClick={() => {
												if (freeDraft === null) return;
												updateMutation.mutate({
													id: user.id,
													freeDownloadsRemaining:
														freeDraft,
												});
											}}
										/>
										<div className="flex gap-1">
											{[1, 3].map((n) => (
												<Button
													key={n}
													type="button"
													size="small"
													outlined
													label={`+${n}`}
													disabled={busy}
													onClick={() =>
														updateMutation.mutate({
															id: user.id,
															freeDownloadsRemaining:
																user.freeDownloadsRemaining +
																n,
														})
													}
												/>
											))}
										</div>
									</div>
								</div>
							</div>
						</AppCard>
					</section>

					<div className="grid gap-4 lg:grid-cols-2 lg:items-start">
						<section>
							<h3 className="mb-2 m-0 text-sm font-semibold uppercase tracking-wide text-zinc-500">
								Compte
							</h3>
							<AppCard>
								<InfoRow label="Email" value={user.email} />
								<InfoRow label="Nom" value={user.name || "—"} />
								<InfoRow label="Plan" value={user.plan} />
								<InfoRow
									label="Fin abo"
									value={formatDate(user.subscriptionEnd)}
								/>
								<InfoRow label="Rôle" value={user.role} />
								<InfoRow
									label="Statut"
									value={
										<span
											className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
												user.isActive
													? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
													: "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
											}`}
										>
											{user.isActive ? "Actif" : "Inactif"}
										</span>
									}
								/>
								<InfoRow
									label="Profil"
									value={
										user.hasProfile ? (
											<span className="font-medium text-emerald-600 dark:text-emerald-400">
												Oui
											</span>
										) : (
											<span className="text-zinc-500">Non</span>
										)
									}
								/>
								<InfoRow
									label="Créé"
									value={formatDate(user.createdAt)}
								/>
								<InfoRow
									label="Dernière co."
									value={formatDate(user.lastLoginAt)}
								/>
							</AppCard>
						</section>

						<section>
							<h3 className="mb-2 m-0 text-sm font-semibold uppercase tracking-wide text-zinc-500">
								Quotas
							</h3>
							<AppCard>
								<InfoRow
									label="Crédits (sans logo)"
									value={user.downloadCredits}
								/>
								<InfoRow
									label="Free DL (avec logo)"
									value={user.freeDownloadsRemaining}
								/>
								<InfoRow label="Max CV" value={user.maxCvs} />
								<InfoRow
									label="Requêtes IA (mois)"
									value={`${user.iaRequestsUsed} · reset ${formatDate(user.lastIaReset)}`}
								/>
								<InfoRow
									label="Downloads total"
									value={user.downloadCount}
								/>
							</AppCard>
						</section>
					</div>

					<section>
						<h3 className="mb-2 m-0 text-sm font-semibold uppercase tracking-wide text-zinc-500">
							CV ({user.cvCount})
						</h3>
						<AppCard className="overflow-x-auto !p-0">
							{user.cvs.length === 0 ? (
								<p className="m-0 px-4 py-6 text-sm text-zinc-500">
									Aucun CV.
								</p>
							) : (
								<table className="w-full min-w-[28rem] border-collapse text-left text-sm">
									<thead>
										<tr className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400">
											<th className="px-4 py-2 font-semibold">
												Titre
											</th>
											<th className="px-3 py-2 font-semibold">
												Modèle
											</th>
											<th className="px-3 py-2 font-semibold">
												Maj
											</th>
										</tr>
									</thead>
									<tbody>
										{user.cvs.map((cv) => (
											<tr
												key={cv.id}
												className="border-b border-zinc-100 dark:border-zinc-800"
											>
												<td className="px-4 py-2 font-medium text-zinc-900 dark:text-zinc-100">
													{cv.title}
												</td>
												<td className="px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400">
													{cv.templateName}
												</td>
												<td className="px-3 py-2 text-xs whitespace-nowrap text-zinc-500">
													{formatDate(cv.updatedAt)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</AppCard>
					</section>

					<section>
						<h3 className="mb-2 m-0 text-sm font-semibold uppercase tracking-wide text-zinc-500">
							Derniers downloads
						</h3>
						<AppCard className="overflow-x-auto !p-0">
							{user.recentDownloads.length === 0 ? (
								<p className="m-0 px-4 py-6 text-sm text-zinc-500">
									Aucun téléchargement.
								</p>
							) : (
								<table className="w-full min-w-[28rem] border-collapse text-left text-sm">
									<thead>
										<tr className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400">
											<th className="px-4 py-2 font-semibold">
												Date
											</th>
											<th className="px-3 py-2 font-semibold">
												Type
											</th>
											<th className="px-3 py-2 font-semibold">
												CV
											</th>
										</tr>
									</thead>
									<tbody>
										{user.recentDownloads.map((d) => (
											<tr
												key={d.id}
												className="border-b border-zinc-100 dark:border-zinc-800"
											>
												<td className="px-4 py-2 text-xs whitespace-nowrap text-zinc-500">
													{formatDate(d.createdAt)}
												</td>
												<td className="px-3 py-2 text-xs">
													{d.variant ===
													"WITH_LOGO" ? (
														<span className="font-medium text-emerald-600 dark:text-emerald-400">
															Gratuit
														</span>
													) : (
														<span className="font-medium text-amber-600 dark:text-amber-400">
															Payant
														</span>
													)}
												</td>
												<td className="px-3 py-2 text-zinc-800 dark:text-zinc-200">
													{d.cvTitle ?? "—"}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</AppCard>
					</section>

					<section>
						<h3 className="mb-2 m-0 text-sm font-semibold uppercase tracking-wide text-zinc-500">
							Achats & cadeaux
						</h3>
						<AppCard className="overflow-x-auto !p-0">
							{user.purchaseHistory.length === 0 ? (
								<p className="m-0 px-4 py-6 text-sm text-zinc-500">
									Aucun achat ni cadeau.
								</p>
							) : (
								<table className="w-full min-w-[28rem] border-collapse text-left text-sm">
									<thead>
										<tr className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400">
											<th className="px-4 py-2 font-semibold">
												Date
											</th>
											<th className="px-3 py-2 font-semibold">
												Type
											</th>
											<th className="px-3 py-2 font-semibold">
												Détail
											</th>
											<th className="px-3 py-2 font-semibold">
												Qté
											</th>
										</tr>
									</thead>
									<tbody>
										{user.purchaseHistory.map((p) => (
											<tr
												key={`${p.kind}-${p.id}`}
												className="border-b border-zinc-100 dark:border-zinc-800"
											>
												<td className="px-4 py-2 text-xs whitespace-nowrap text-zinc-500">
													{formatDate(p.createdAt)}
												</td>
												<td className="px-3 py-2 text-xs">
													{p.kind === "TEMPLATE" ? (
														<span className="font-medium text-violet-600 dark:text-violet-300">
															Template
														</span>
													) : (
														<span className="font-medium text-sky-600 dark:text-sky-300">
															Cadeau free
														</span>
													)}
												</td>
												<td className="px-3 py-2 text-zinc-800 dark:text-zinc-200">
													{p.label}
												</td>
												<td className="px-3 py-2 text-xs text-zinc-500">
													{p.amount ?? "—"}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</AppCard>
					</section>

					<section>
						<h3 className="mb-2 m-0 text-sm font-semibold uppercase tracking-wide text-zinc-500">
							Dernières requêtes IA
						</h3>
						<AppCard className="overflow-x-auto !p-0">
							{user.recentAiEvents.length === 0 ? (
								<p className="m-0 px-4 py-6 text-sm text-zinc-500">
									Aucune requête IA.
								</p>
							) : (
								<table className="w-full min-w-[28rem] border-collapse text-left text-sm">
									<thead>
										<tr className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400">
											<th className="px-4 py-2 font-semibold">
												Date
											</th>
											<th className="px-3 py-2 font-semibold">
												Fonction
											</th>
											<th className="px-3 py-2 font-semibold">
												Détail
											</th>
										</tr>
									</thead>
									<tbody>
										{user.recentAiEvents.map((e) => (
											<tr
												key={e.id}
												className="border-b border-zinc-100 dark:border-zinc-800"
											>
												<td className="px-4 py-2 text-xs whitespace-nowrap text-zinc-500">
													{formatDate(e.createdAt)}
												</td>
												<td className="px-3 py-2 text-xs font-medium text-zinc-800 dark:text-zinc-200">
													{aiFeatureLabel(e.feature)}
												</td>
												<td className="px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400">
													{e.detail ?? "—"}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</AppCard>
					</section>
				</div>
			) : null}
		</div>
	);
}
