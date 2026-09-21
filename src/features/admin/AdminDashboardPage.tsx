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
		return (
			<span className="text-2xl font-semibold text-zinc-400 dark:text-zinc-500">
				—
			</span>
		);
	}
	return (
		<span className="text-2xl font-semibold text-zinc-900 dark:text-white">
			{value ?? 0}
			{suffix ? (
				<span className="ml-1 text-sm font-normal text-zinc-500">
					{suffix}
				</span>
			) : null}
		</span>
	);
}

function MetricCard({
	title,
	hint,
	ready,
	value,
	suffix,
}: {
	title: string;
	hint?: string | undefined;
	ready: boolean;
	value: number | null;
	suffix?: string | undefined;
}) {
	return (
		<AppCard className="flex min-h-[7.5rem] flex-col justify-between gap-2">
			<div>
				<p className="m-0 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
					{title}
				</p>
				{hint ? (
					<p className="m-0 mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
						{hint}
					</p>
				) : null}
			</div>
			<div className="flex items-end justify-between gap-2">
				<MetricValue ready={ready} value={value} suffix={suffix} />
				{!ready ? (
					<span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
						Bientôt
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
		<div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
			<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<TitleAppOne
					firstPart="Admin"
					secondPart="dashboard"
					withSpace
					classNameSize="text-3xl sm:text-4xl"
				/>
				<div className="flex flex-col items-start gap-1 sm:items-end">
					<span className="text-xs text-zinc-500 dark:text-zinc-400">
						Période
					</span>
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

			<p className="mb-6 m-0 text-sm text-zinc-600 dark:text-zinc-400">
				Vue d’ensemble · {periodLabel}. Les cartes se rempliront au fur et à
				mesure.
			</p>

			<section className="mb-8">
				<div className="mb-3 flex items-center justify-between gap-3">
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
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					<MetricCard
						title="Nouveaux"
						hint="Comptes créés sur la période"
						ready={data?.users.ready ?? false}
						value={data?.users.newCount ?? null}
					/>
					<MetricCard
						title="Actifs"
						hint="Au moins une connexion sur la période"
						ready={data?.users.ready ?? false}
						value={data?.users.activeCount ?? null}
					/>
					<MetricCard
						title="Connectés"
						hint="Connexion ces 15 dernières minutes"
						ready={data?.users.ready ?? false}
						value={data?.users.connectedCount ?? null}
					/>
				</div>
			</section>

			<section className="mb-8">
				<div className="mb-3 flex items-center justify-between gap-3">
					<h3 className="m-0 text-sm font-semibold uppercase tracking-wide text-zinc-500">
						CV & modèles
					</h3>
					<div className="flex items-center gap-3">
						<Link
							href="/admin/templates"
							className="text-xs font-medium text-primary hover:underline dark:text-primary-dark"
						>
							Catalogue →
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
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					<MetricCard
						title="CV créés"
						hint="Créés sur la période"
						ready={data?.cvs.ready ?? false}
						value={data?.cvs.createdCount ?? null}
					/>
					<MetricCard
						title="CV existants"
						hint="Stock actuel (hors période)"
						ready={data?.cvs.ready ?? false}
						value={data?.cvs.existingCount ?? null}
					/>
					<MetricCard
						title="Modèles utilisés"
						hint="Templates distincts sur la période"
						ready={data?.cvs.ready ?? false}
						value={data?.cvs.templatesUsed ?? null}
					/>
				</div>
				<div className="mt-3 grid gap-3 sm:grid-cols-2">
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
						) : (data?.cvs.topTemplates.length ?? 0) === 0 ? (
							<p className="m-0 text-sm text-zinc-500 dark:text-zinc-400">
								Aucune activité sur cette période.
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
											· {t.popularityScore.toFixed(1)} pop
											· {t.unlockCount} achat
											{t.unlockCount > 1 ? "s" : ""} ·{" "}
											{t.cvCount} CV · {t.downloadCount}{" "}
											DL
										</span>
									</li>
								))}
							</ol>
						)}
					</AppCard>
					<AppCard className="flex min-h-[7.5rem] flex-col gap-2">
						<div className="flex items-start justify-between gap-2">
							<div>
								<p className="m-0 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
									Top couleurs
								</p>
								<p className="m-0 text-xs text-zinc-500 dark:text-zinc-400">
									CV créés sur la période (primaryColorName)
								</p>
							</div>
							<Link
								href="/admin/cvs?view=colors"
								className="shrink-0 text-xs font-medium text-primary hover:underline dark:text-primary-dark"
							>
								Tout →
							</Link>
						</div>
						{!(data?.cvs.ready ?? false) ? (
							<p className="m-0 text-sm text-zinc-400">—</p>
						) : (data?.cvs.topColors.length ?? 0) === 0 ? (
							<p className="m-0 text-sm text-zinc-500 dark:text-zinc-400">
								Aucune couleur renseignée sur cette période.
							</p>
						) : (
							<ol className="m-0 flex list-decimal flex-col gap-1.5 pl-4 text-sm text-zinc-700 dark:text-zinc-300">
								{data?.cvs.topColors.map((c) => (
									<li
										key={c.name}
										className="flex items-center gap-2"
									>
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
											· {c.cvCount} CV
										</span>
									</li>
								))}
							</ol>
						)}
					</AppCard>
				</div>
			</section>

			<section className="mb-8">
				<div className="mb-3 flex items-center justify-between gap-3">
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
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
							<span className="text-2xl font-semibold text-zinc-400 dark:text-zinc-500">
								—
							</span>
						) : (
							<>
								<span className="text-2xl font-semibold text-zinc-900 dark:text-white">
									{(data?.downloads.withLogoAllTime ?? 0) +
										(data?.downloads.withoutLogoAllTime ?? 0)}
								</span>
								<p className="m-0 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
									<span className="font-semibold text-emerald-600 dark:text-emerald-400">
										{data?.downloads.withLogoAllTime ?? 0}{" "}
										gratuits
									</span>
									{" · "}
									<span className="font-semibold text-amber-600 dark:text-amber-400">
										{data?.downloads.withoutLogoAllTime ?? 0}{" "}
										payants
									</span>
								</p>
							</>
						)}
					</AppCard>
					<MetricCard
						title="Avec logo"
						hint="Exports gratuits sur la période"
						ready={data?.downloads.ready ?? false}
						value={data?.downloads.withLogo ?? null}
					/>
					<MetricCard
						title="Sans logo"
						hint="Exports crédits sur la période"
						ready={data?.downloads.ready ?? false}
						value={data?.downloads.withoutLogo ?? null}
					/>
				</div>
			</section>

			<section className="mb-8">
				<div className="mb-3 flex items-center justify-between gap-3">
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
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					<AppCard className="flex min-h-[7.5rem] flex-col gap-2">
						<div>
							<p className="m-0 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
								Requêtes IA
							</p>
							<p className="m-0 mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
								Sur la période ·{" "}
								{data?.ai.totalAllTime ?? 0} depuis toujours
							</p>
						</div>
						{!(data?.ai.ready ?? false) ? (
							<span className="text-2xl font-semibold text-zinc-400 dark:text-zinc-500">
								—
							</span>
						) : (
							<span className="text-2xl font-semibold text-zinc-900 dark:text-white">
								{data?.ai.total ?? 0}
							</span>
						)}
					</AppCard>
					<MetricCard
						title="Import PDF"
						hint="Sur la période"
						ready={data?.ai.ready ?? false}
						value={data?.ai.importCv ?? null}
					/>
					<MetricCard
						title="Relecture"
						hint="Sur la période"
						ready={data?.ai.ready ?? false}
						value={data?.ai.reviewCv ?? null}
					/>
					<MetricCard
						title="Reformulation"
						hint="Sur la période"
						ready={data?.ai.ready ?? false}
						value={data?.ai.rewriteSection ?? null}
					/>
					<MetricCard
						title="Users IA"
						hint="Utilisateurs distincts sur la période"
						ready={data?.ai.ready ?? false}
						value={data?.ai.uniqueUsers ?? null}
					/>
				</div>
			</section>

			<section className="mb-8">
				<h3 className="mb-3 m-0 text-sm font-semibold uppercase tracking-wide text-zinc-500">
					Ventes
				</h3>
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

			<section>
				<h3 className="mb-3 m-0 text-sm font-semibold uppercase tracking-wide text-zinc-500">
					Funnel
				</h3>
				<AppCard>
					<p className="m-0 text-sm text-zinc-600 dark:text-zinc-400">
						Visite → compte → CV → download → achat —{" "}
						{data?.funnel.ready
							? "données à venir"
							: "placeholder (GA + events produit)."}
					</p>
				</AppCard>
			</section>
		</div>
	);
}
