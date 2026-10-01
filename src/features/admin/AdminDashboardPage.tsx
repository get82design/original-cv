import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SelectButton } from "primereact/selectbutton";
import { TitleAppOne } from "@/components/title/TitleAppOne";
import { AppCard } from "@/components/card/AppCard";
import { trpc } from "@utils/trpc";
import type { AdminDashboardPeriod } from "@/services/admin/adminDashboardService";

const PERIOD_OPTIONS: { label: string; value: AdminDashboardPeriod }[] = [
	{ label: "24 h", value: "1d" },
	{ label: "7 j", value: "7d" },
	{ label: "30 j", value: "30d" },
	{ label: "90 j", value: "90d" },
	{ label: "1 an", value: "365d" },
	{ label: "Toujours", value: "all" },
];

function MetricValue({
	ready,
	value,
	suffix,
}: {
	ready: boolean;
	value: number | null;
	suffix?: string | undefined;
}) {
	if (!ready) {
		return <span className="text-2xl font-semibold text-zinc-400 dark:text-zinc-500">—</span>;
	}
	return (
		<span className="text-2xl font-semibold text-zinc-900 dark:text-white">
			{value ?? 0}
			{suffix ? <span className="ml-1 text-sm font-normal text-zinc-500">{suffix}</span> : null}
		</span>
	);
}

function formatDelta(delta: number): string {
	if (delta > 0) return `+${delta}`;
	return String(delta);
}

/** Comparaison de rang : précédent → actuel (index 0 = 1er). */
type RankMove = "up" | "down" | "same";

function rankMoveFromPrevious(previousIndex: number, currentIndex: number | undefined): RankMove {
	if (currentIndex === undefined) return "down";
	if (currentIndex < previousIndex) return "up";
	if (currentIndex > previousIndex) return "down";
	return "same";
}

function previousRankClass(move: RankMove): string {
	if (move === "up") return "text-emerald-600 dark:text-emerald-400";
	if (move === "down") return "text-rose-600 dark:text-rose-400";
	return "text-zinc-600 dark:text-zinc-300";
}

function MetricCard({
	title,
	hint,
	ready,
	value,
	suffix,
	periodTag,
	delta,
	/** Hausse = mauvais (rouge), baisse = bon (vert) — ex. erreurs API */
	deltaInverted = false,
}: {
	title: string;
	hint?: string | undefined;
	ready: boolean;
	value: number | null;
	suffix?: string | undefined;
	/** Affiché en bout de ligne du chiffre (ex. « 7 j », « 15 min ») */
	periodTag?: string | undefined;
	/** Écart vs période précédente (null = non applicable) */
	delta?: number | null | undefined;
	deltaInverted?: boolean | undefined;
}) {
	const upClass = deltaInverted
		? "text-rose-600 dark:text-rose-400"
		: "text-emerald-600 dark:text-emerald-400";
	const downClass = deltaInverted
		? "text-emerald-600 dark:text-emerald-400"
		: "text-rose-600 dark:text-rose-400";
	const deltaClass =
		delta == null
			? ""
			: delta > 0
				? upClass
				: delta < 0
					? downClass
					: "text-zinc-500 dark:text-zinc-400";

	return (
		<AppCard className="flex min-h-[7.5rem] flex-col justify-between gap-2">
			<div>
				<p className="m-0 text-sm font-semibold text-zinc-800 dark:text-zinc-100">{title}</p>
				{hint ? (
					<p className="m-0 mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
				) : null}
			</div>
			<div className="flex items-end justify-between gap-2">
				<MetricValue ready={ready} value={value} suffix={suffix} />
				{!ready ? (
					<span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
						Bientôt
					</span>
				) : periodTag || delta != null ? (
					<span className="flex shrink-0 items-baseline gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
						{delta != null ? (
							<span className={`font-medium tabular-nums ${deltaClass}`}>{formatDelta(delta)}</span>
						) : null}
						{periodTag ? <span>{periodTag}</span> : null}
					</span>
				) : null}
			</div>
		</AppCard>
	);
}

export function AdminDashboardPage() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [period, setPeriod] = useState<AdminDashboardPeriod>("7d");

	const isAdmin = session?.user?.role === "ADMIN";

	useEffect(() => {
		if (status === "loading") return;
		if (status !== "authenticated" || !isAdmin) {
			void router.replace("/");
		}
	}, [status, isAdmin, router]);

	const overviewQuery = trpc.admin.dashboardOverview.useQuery(
		{ period },
		{ enabled: status === "authenticated" && isAdmin },
	);

	const data = overviewQuery.data;

	const periodLabel = useMemo(
		() => PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? period,
		[period],
	);

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
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
			<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<TitleAppOne
					firstPart="Admin"
					secondPart="dashboard"
					withSpace
					classNameSize="text-3xl sm:text-4xl"
				/>
				<div className="flex flex-col items-start gap-1 sm:items-end">
					<span className="text-xs text-zinc-500 dark:text-zinc-400">Période</span>
					<SelectButton
						value={period}
						onChange={(e) => {
							if (e.value) setPeriod(e.value as AdminDashboardPeriod);
						}}
						options={PERIOD_OPTIONS}
						optionLabel="label"
						optionValue="value"
						allowEmpty={false}
						className="flex flex-wrap"
					/>
				</div>
			</div>

			<div className="mb-5 grid gap-5 lg:grid-cols-2">
				{/* Colonne gauche : métriques */}
				<div className="flex flex-col gap-5">
					<section>
						<div className="mb-1.5 flex items-center justify-between gap-3">
							<h3 className="m-0 text-sm font-semibold uppercase tracking-wide text-zinc-500">
								Utilisateurs
							</h3>
							<Link
								href="/admin/users"
								className="text-xs font-medium text-primary hover:underline dark:text-primary-dark"
							>
								Voir la liste →
							</Link>
						</div>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
							<MetricCard
								title="Nouveaux"
								hint="Comptes créés"
								ready={data?.users.ready ?? false}
								value={data?.users.newCount ?? null}
								periodTag={periodLabel}
								delta={data?.users.newCountDelta}
							/>
							<MetricCard
								title="Actifs"
								hint="Au moins une connexion"
								ready={data?.users.ready ?? false}
								value={data?.users.activeCount ?? null}
								periodTag={periodLabel}
								delta={data?.users.activeCountDelta}
							/>
							<MetricCard
								title="Connectés"
								hint="En ligne récemment"
								ready={data?.users.ready ?? false}
								value={data?.users.connectedCount ?? null}
								periodTag="15 min"
							/>
						</div>
					</section>

					<section>
						<div className="mb-1.5 flex items-center justify-between gap-3">
							<h3 className="m-0 text-sm font-semibold uppercase tracking-wide text-zinc-500">
								Téléchargements
							</h3>
							<Link
								href="/admin/downloads"
								className="text-xs font-medium text-primary hover:underline dark:text-primary-dark"
							>
								Voir le feed →
							</Link>
						</div>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
							<AppCard className="flex min-h-[7.5rem] flex-col gap-2">
								<div>
									<p className="m-0 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
										CV téléchargés
									</p>
									<p className="m-0 mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
										Total depuis toujours
									</p>
								</div>
								{!(data?.downloads.ready ?? false) ? (
									<span className="text-2xl font-semibold text-zinc-400 dark:text-zinc-500">—</span>
								) : (
									<>
										<span className="text-2xl font-semibold text-zinc-900 dark:text-white">
											{(data?.downloads.withLogoAllTime ?? 0) +
												(data?.downloads.withoutLogoAllTime ?? 0)}
										</span>
										<p className="m-0 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
											<span className="font-semibold text-sky-600 dark:text-sky-400">
												{data?.downloads.withLogoAllTime ?? 0} gratuits
											</span>
											{" · "}
											<span className="font-semibold text-emerald-600 dark:text-emerald-400">
												{data?.downloads.withoutLogoAllTime ?? 0} payants
											</span>
										</p>
									</>
								)}
							</AppCard>
							<MetricCard
								title="Avec logo"
								hint="Exports gratuits"
								ready={data?.downloads.ready ?? false}
								value={data?.downloads.withLogo ?? null}
								periodTag={periodLabel}
								delta={data?.downloads.withLogoDelta}
							/>
							<MetricCard
								title="Sans logo"
								hint="Exports crédits"
								ready={data?.downloads.ready ?? false}
								value={data?.downloads.withoutLogo ?? null}
								periodTag={periodLabel}
								delta={data?.downloads.withoutLogoDelta}
							/>
						</div>
					</section>

					<section>
						<div className="mb-1.5 flex items-center justify-between gap-3">
							<h3 className="m-0 text-sm font-semibold uppercase tracking-wide text-zinc-500">
								CV & modèles
							</h3>
							<div className="flex flex-wrap items-center justify-end gap-3">
								<Link
									href="/admin/templates"
									className="text-xs font-medium text-primary hover:underline dark:text-primary-dark"
								>
									Catalogue →
								</Link>
								<Link
									href="/admin/colors"
									className="text-xs font-medium text-primary hover:underline dark:text-primary-dark"
								>
									Couleurs →
								</Link>
								<Link
									href="/admin/unlocks"
									className="text-xs font-medium text-primary hover:underline dark:text-primary-dark"
								>
									Unlocks →
								</Link>
								<Link
									href="/admin/cvs?view=feed"
									className="text-xs font-medium text-primary hover:underline dark:text-primary-dark"
								>
									Voir le détail →
								</Link>
							</div>
						</div>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
							<MetricCard
								title="CV existants"
								hint="Stock actuel"
								ready={data?.cvs.ready ?? false}
								value={data?.cvs.existingCount ?? null}
							/>
							<MetricCard
								title="CV créés"
								hint="Créés"
								ready={data?.cvs.ready ?? false}
								value={data?.cvs.createdCount ?? null}
								periodTag={periodLabel}
								delta={data?.cvs.createdCountDelta}
							/>
							<MetricCard
								title="Modèles utilisés"
								hint="Templates distincts"
								ready={data?.cvs.ready ?? false}
								value={data?.cvs.templatesUsed ?? null}
								periodTag={periodLabel}
								delta={data?.cvs.templatesUsedDelta}
							/>
						</div>
					</section>

					<section>
						<div className="mb-1.5 flex items-center justify-between gap-3">
							<h3 className="m-0 text-sm font-semibold uppercase tracking-wide text-zinc-500">
								Ventes
							</h3>
							<Link
								href="/admin/billing"
								className="text-xs font-medium text-primary hover:underline dark:text-primary-dark"
							>
								Tarifs & packs →
							</Link>
						</div>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<MetricCard
								title="CA"
								hint="Sur la période"
								ready={data?.sales.ready ?? false}
								value={
									data?.sales.revenueCents != null
										? Math.round(data.sales.revenueCents / 100)
										: null
								}
								suffix="€"
							/>
							<MetricCard
								title="Commandes"
								ready={data?.sales.ready ?? false}
								value={data?.sales.ordersCount ?? null}
							/>
						</div>
					</section>
				</div>

				{/* Colonne droite : tops + IA */}
				<div className="flex flex-col gap-5">
					<div className="flex flex-col gap-3">
						<AppCard className="flex min-h-[7.5rem] flex-col gap-2">
							<div className="flex items-start justify-between gap-2">
								<div>
									<p className="m-0 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
										Top modèles
									</p>
									<p className="m-0 text-xs text-zinc-500 dark:text-zinc-400">
										Popularité = moyenne (achats + CV + DL)
									</p>
								</div>
								<Link
									href="/admin/cvs?view=templates"
									className="shrink-0 text-xs font-medium text-primary hover:underline dark:text-primary-dark"
								>
									Tout →
								</Link>
							</div>
							{!(data?.cvs.ready ?? false) ? (
								<p className="m-0 text-sm text-zinc-400">—</p>
							) : (data?.cvs.topTemplates.length ?? 0) === 0 &&
								(data?.cvs.previousTopTemplates?.length ?? 0) === 0 ? (
								<p className="m-0 text-sm text-zinc-500 dark:text-zinc-400">
									Aucune activité sur cette période.
								</p>
							) : (
								<div className="grid gap-4 sm:grid-cols-2">
									<div>
										<p className="mb-1.5 m-0 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
											{periodLabel}
										</p>
										{(data?.cvs.topTemplates.length ?? 0) === 0 ? (
											<p className="m-0 text-sm text-zinc-500 dark:text-zinc-400">
												Aucune activité.
											</p>
										) : (
											<ol className="m-0 flex list-decimal flex-col gap-1.5 pl-4 text-sm text-zinc-700 dark:text-zinc-300">
												{data?.cvs.topTemplates.map((t) => (
													<li key={t.templateId}>
														<span className="font-medium text-zinc-900 dark:text-zinc-100">
															{t.name}
														</span>
														<span className="text-zinc-500 dark:text-zinc-400">
															{" "}
															· {t.popularityScore.toFixed(1)} pop · {t.unlockCount} achat
															{t.unlockCount > 1 ? "s" : ""} · {t.cvCount} CV · {t.downloadCount} DL
														</span>
													</li>
												))}
											</ol>
										)}
									</div>
									{data?.cvs.previousTopTemplates != null ? (
										<div>
											<p className="mb-1.5 m-0 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
												Période préc.
											</p>
											{data.cvs.previousTopTemplates.length === 0 ? (
												<p className="m-0 text-xs text-zinc-500 dark:text-zinc-400">
													Aucune activité.
												</p>
											) : (
												<ol className="m-0 flex list-decimal flex-col gap-1 pl-4 text-xs">
													{data.cvs.previousTopTemplates.map((t, prevIndex) => {
														const currentIndex = data.cvs.topTemplates.findIndex(
															(c) => c.templateId === t.templateId,
														);
														const move = rankMoveFromPrevious(
															prevIndex,
															currentIndex >= 0 ? currentIndex : undefined,
														);
														return (
															<li
																key={t.templateId}
																className={`font-medium ${previousRankClass(move)}`}
															>
																{t.name}
															</li>
														);
													})}
												</ol>
											)}
										</div>
									) : null}
								</div>
							)}
						</AppCard>
						<AppCard className="flex min-h-[7.5rem] flex-col gap-2">
							<div className="flex items-start justify-between gap-2">
								<div>
									<p className="m-0 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
										Top couleurs
									</p>
									<p className="m-0 text-xs text-zinc-500 dark:text-zinc-400">
										Popularité = moyenne (CV + DL)
									</p>
								</div>
								<Link
									href="/admin/cvs?view=colors"
									className="shrink-0 text-xs font-medium text-primary hover:underline dark:text-primary-dark"
								>
									Stats →
								</Link>
								<Link
									href="/admin/colors"
									className="shrink-0 text-xs font-medium text-primary hover:underline dark:text-primary-dark"
								>
									Gérer →
								</Link>
							</div>
							{!(data?.cvs.ready ?? false) ? (
								<p className="m-0 text-sm text-zinc-400">—</p>
							) : (data?.cvs.topColors.length ?? 0) === 0 &&
								(data?.cvs.previousTopColors?.length ?? 0) === 0 ? (
								<p className="m-0 text-sm text-zinc-500 dark:text-zinc-400">
									Aucune couleur renseignée sur cette période.
								</p>
							) : (
								<div className="grid gap-4 sm:grid-cols-2">
									<div>
										<p className="mb-1.5 m-0 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
											{periodLabel}
										</p>
										{(data?.cvs.topColors.length ?? 0) === 0 ? (
											<p className="m-0 text-sm text-zinc-500 dark:text-zinc-400">
												Aucune couleur.
											</p>
										) : (
											<ol className="m-0 flex list-decimal flex-col gap-1.5 pl-4 text-sm text-zinc-700 dark:text-zinc-300">
												{data?.cvs.topColors.map((c) => (
													<li key={c.name} className="flex items-center gap-2">
														<span
															className="inline-block h-3 w-3 shrink-0 rounded-full border border-zinc-200 dark:border-zinc-600"
															style={{
																backgroundColor: `var(--${c.name}${c.primary ?? "-600"})`,
															}}
															title={`${c.name}${c.primary ?? ""}`}
														/>
														<span className="font-medium text-zinc-900 dark:text-zinc-100">
															{c.name}
														</span>
														<span className="text-zinc-500 dark:text-zinc-400">
															· {c.popularityScore.toFixed(1)} · {c.cvCount} CV · {c.downloadCount}{" "}
															DL
														</span>
													</li>
												))}
											</ol>
										)}
									</div>
									{data?.cvs.previousTopColors != null ? (
										<div>
											<p className="mb-1.5 m-0 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
												Période préc.
											</p>
											{data.cvs.previousTopColors.length === 0 ? (
												<p className="m-0 text-xs text-zinc-500 dark:text-zinc-400">
													Aucune couleur.
												</p>
											) : (
												<ol className="m-0 flex list-decimal flex-col gap-1 pl-4 text-xs">
													{data.cvs.previousTopColors.map((c, prevIndex) => {
														const currentIndex = data.cvs.topColors.findIndex(
															(cur) => cur.name === c.name,
														);
														const move = rankMoveFromPrevious(
															prevIndex,
															currentIndex >= 0 ? currentIndex : undefined,
														);
														const stayColor =
															move === "same"
																? {
																		color: `var(--${c.name}${c.primary ?? "-600"})`,
																	}
																: undefined;
														return (
															<li
																key={c.name}
																className={`flex items-center gap-1.5 font-medium ${
																	move === "same" ? "" : previousRankClass(move)
																}`}
																style={stayColor}
															>
																<span
																	className="inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-zinc-200 dark:border-zinc-600"
																	style={{
																		backgroundColor: `var(--${c.name}${c.primary ?? "-600"})`,
																	}}
																	title={`${c.name}${c.primary ?? ""}`}
																/>
																{c.name}
															</li>
														);
													})}
												</ol>
											)}
										</div>
									) : null}
								</div>
							)}
						</AppCard>
					</div>

					<section>
						<div className="mb-1.5 flex items-center justify-between gap-3">
							<h3 className="m-0 text-sm font-semibold uppercase tracking-wide text-zinc-500">
								IA
							</h3>
							<Link
								href="/admin/ai"
								className="text-xs font-medium text-primary hover:underline dark:text-primary-dark"
							>
								Voir le feed →
							</Link>
						</div>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
							<MetricCard
								title="Requêtes IA"
								hint={`${data?.ai.totalAllTime ?? 0} depuis toujours`}
								ready={data?.ai.ready ?? false}
								value={data?.ai.total ?? null}
								periodTag={periodLabel}
								delta={data?.ai.totalDelta}
							/>
							<MetricCard
								title="Import PDF"
								ready={data?.ai.ready ?? false}
								value={data?.ai.importCv ?? null}
								periodTag={periodLabel}
								delta={data?.ai.importCvDelta}
							/>
							<MetricCard
								title="Relecture"
								ready={data?.ai.ready ?? false}
								value={data?.ai.reviewCv ?? null}
								periodTag={periodLabel}
								delta={data?.ai.reviewCvDelta}
							/>
							<MetricCard
								title="Reformulation"
								ready={data?.ai.ready ?? false}
								value={data?.ai.rewriteSection ?? null}
								periodTag={periodLabel}
								delta={data?.ai.rewriteSectionDelta}
							/>
							<MetricCard
								title="Users IA"
								hint="Utilisateurs distincts"
								ready={data?.ai.ready ?? false}
								value={data?.ai.uniqueUsers ?? null}
								periodTag={periodLabel}
								delta={data?.ai.uniqueUsersDelta}
							/>
						</div>
					</section>
				</div>
			</div>

			{/* Suite : inchangé pour l’instant */}
			{/* 6. Santé */}
			<section className="mb-5">
				<div className="mb-1.5 flex items-center justify-between gap-3">
					<h3 className="m-0 text-sm font-semibold uppercase tracking-wide text-zinc-500">
						Erreurs API
					</h3>
					<Link
						href="/admin/errors"
						className="text-xs font-medium text-primary hover:underline dark:text-primary-dark"
					>
						Voir le feed →
					</Link>
				</div>
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					<MetricCard
						title="Erreurs"
						hint={`${data?.apiErrors.totalAllTime ?? 0} depuis toujours`}
						ready={data?.apiErrors.ready ?? false}
						value={data?.apiErrors.total ?? null}
						periodTag={periodLabel}
						delta={data?.apiErrors.totalDelta}
						deltaInverted
					/>
					<MetricCard
						title="5xx / interne"
						hint="INTERNAL_SERVER_ERROR"
						ready={data?.apiErrors.ready ?? false}
						value={data?.apiErrors.internalServerError ?? null}
						periodTag={periodLabel}
						delta={data?.apiErrors.internalServerErrorDelta}
						deltaInverted
					/>
					<MetricCard
						title="429"
						hint="TOO_MANY_REQUESTS"
						ready={data?.apiErrors.ready ?? false}
						value={data?.apiErrors.tooManyRequests ?? null}
						periodTag={periodLabel}
						delta={data?.apiErrors.tooManyRequestsDelta}
						deltaInverted
					/>
					<MetricCard
						title="Timeouts"
						ready={data?.apiErrors.ready ?? false}
						value={data?.apiErrors.timeout ?? null}
						periodTag={periodLabel}
						delta={data?.apiErrors.timeoutDelta}
						deltaInverted
					/>
					<MetricCard
						title="Users impactés"
						hint="Utilisateurs distincts"
						ready={data?.apiErrors.ready ?? false}
						value={data?.apiErrors.uniqueUsers ?? null}
						periodTag={periodLabel}
						delta={data?.apiErrors.uniqueUsersDelta}
						deltaInverted
					/>
				</div>
			</section>

			{/* 7. Audit */}
			<section className="mb-5">
				<div className="mb-1.5 flex items-center justify-between gap-3">
					<h3 className="m-0 text-sm font-semibold uppercase tracking-wide text-zinc-500">
						Crédits admin
					</h3>
					<Link
						href="/admin/credit-logs"
						className="text-xs font-medium text-primary hover:underline dark:text-primary-dark"
					>
						Voir le journal →
					</Link>
				</div>
				<AppCard>
					<p className="m-0 text-sm text-zinc-600 dark:text-zinc-400">
						Qui a réglé / remis à zéro les crédits ou free DL de qui (fiche user).
					</p>
				</AppCard>
			</section>

			{/* 8. Placeholder */}
			<section>
				<h3 className="mb-1.5 m-0 text-sm font-semibold uppercase tracking-wide text-zinc-500">
					Funnel
				</h3>
				<AppCard>
					<p className="m-0 text-sm text-zinc-600 dark:text-zinc-400">
						Visite → compte → CV → download → achat —{" "}
						{data?.funnel.ready ? "données à venir" : "placeholder (GA + events produit)."}
					</p>
				</AppCard>
			</section>
		</div>
	);
}
