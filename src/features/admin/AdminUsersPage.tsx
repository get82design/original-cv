import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";
import { TitleAppOne } from "@/components/title/TitleAppOne";
import { AppCard } from "@/components/card/AppCard";
import { trpc } from "@utils/trpc";
import { PlanRole } from "../../../generated/prisma/enums";

const PLAN_OPTIONS: { label: string; value: PlanRole | null }[] = [
	{ label: "Tous les plans", value: null },
	{ label: "FREE", value: PlanRole.FREE },
	{ label: "STANDARD", value: PlanRole.STANDARD },
	{ label: "PREMIUM", value: PlanRole.PREMIUM },
	{ label: "PREMIUM+IA", value: PlanRole.PREMIUM_PLUS_IA },
];

const ACTIVE_OPTIONS: { label: string; value: boolean | null }[] = [
	{ label: "Tous", value: null },
	{ label: "Actifs", value: true },
	{ label: "Inactifs", value: false },
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

export function AdminUsersPage() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const isAdmin = session?.user?.role === "ADMIN";

	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");
	const [plan, setPlan] = useState<PlanRole | null>(null);
	const [isActive, setIsActive] = useState<boolean | null>(null);
	const [page, setPage] = useState(1);
	const pageSize = 20;

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

	const listQuery = trpc.admin.listUsers.useQuery(
		{
			page,
			pageSize,
			...(search ? { search } : {}),
			...(plan ? { plan } : {}),
			...(typeof isActive === "boolean" ? { isActive } : {}),
		},
		{ enabled: status === "authenticated" && isAdmin },
	);

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
						secondPart="users"
						withSpace
						classNameSize="text-3xl sm:text-4xl"
					/>
				</div>
				<p className="m-0 text-sm text-zinc-500 dark:text-zinc-400">
					{total} utilisateur{total > 1 ? "s" : ""}
				</p>
			</div>

			<AppCard className="admin-filters mb-4">
				<div className="flex flex-col gap-3 lg:flex-row lg:items-end">
					<div className="flex-1">
						<label className="mb-1 block text-xs text-zinc-500">
							Recherche
						</label>
						<div className="relative w-full">
							<i className="pi pi-search pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-sm text-zinc-500 dark:text-zinc-400" />
							<InputText
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								placeholder="Email ou nom…"
								className="w-full !pl-10"
							/>
						</div>
					</div>
					<div className="w-full lg:w-44">
						<label className="mb-1 block text-xs text-zinc-500">
							Plan
						</label>
						<Dropdown
							value={plan}
							options={PLAN_OPTIONS}
							onChange={(e) => {
								setPlan(e.value as PlanRole | null);
								setPage(1);
							}}
							optionLabel="label"
							optionValue="value"
							className="w-full"
						/>
					</div>
					<div className="w-full lg:w-40">
						<label className="mb-1 block text-xs text-zinc-500">
							Statut
						</label>
						<Dropdown
							value={isActive}
							options={ACTIVE_OPTIONS}
							onChange={(e) => {
								setIsActive(e.value as boolean | null);
								setPage(1);
							}}
							optionLabel="label"
							optionValue="value"
							className="w-full"
						/>
					</div>
				</div>
			</AppCard>

			<AppCard className="overflow-x-auto !p-0">
				<Tooltip
					target=".admin-users-status-tip"
					position="top"
					className="text-xs"
				/>
				<table className="w-full min-w-[52rem] border-collapse text-left text-sm">
					<thead>
						<tr className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400">
							<th className="px-4 py-3 font-semibold">Utilisateur</th>
							<th className="px-3 py-3 font-semibold">Plan</th>
							<th className="px-3 py-3 font-semibold">Rôle</th>
							<th className="px-3 py-3 font-semibold">Crédits</th>
							<th className="px-3 py-3 font-semibold">Free DL</th>
							<th className="px-3 py-3 font-semibold">CV</th>
							<th className="px-3 py-3 font-semibold">Downloads</th>
							<th className="px-3 py-3 font-semibold">Profil</th>
							<th className="px-3 py-3 font-semibold">Dernière co.</th>
							<th className="px-3 py-3 font-semibold">Créé</th>
							<th className="px-3 py-3 font-semibold">
								<span
									className="admin-users-status-tip inline-flex cursor-help items-center gap-1 border-b border-dotted border-zinc-400"
									data-pr-tooltip="Actif = peut se connecter. Inactif = compte désactivé (login refusé)."
								>
									Statut
									<i className="pi pi-info-circle text-[10px] opacity-70" />
								</span>
							</th>
						</tr>
					</thead>
					<tbody>
						{listQuery.isLoading ? (
							<tr>
								<td
									colSpan={11}
									className="px-4 py-8 text-center text-zinc-500"
								>
									Chargement…
								</td>
							</tr>
						) : (listQuery.data?.items.length ?? 0) === 0 ? (
							<tr>
								<td
									colSpan={11}
									className="px-4 py-8 text-center text-zinc-500"
								>
									Aucun utilisateur.
								</td>
							</tr>
						) : (
							listQuery.data?.items.map((u) => (
								<tr
									key={u.id}
									className="border-b border-zinc-100 text-zinc-800 dark:border-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
								>
									<td className="px-4 py-3">
										<Link
											href={`/admin/users/${u.id}`}
											className="block hover:text-primary dark:hover:text-primary-dark"
										>
											<p className="m-0 font-medium">{u.email}</p>
											{u.name ? (
												<p className="m-0 text-xs text-zinc-500">
													{u.name}
												</p>
											) : null}
										</Link>
									</td>
									<td className="px-3 py-3 text-xs">{u.plan}</td>
									<td className="px-3 py-3 text-xs">{u.role}</td>
									<td className="px-3 py-3">{u.downloadCredits}</td>
									<td className="px-3 py-3">
										{u.freeDownloadsRemaining}
									</td>
									<td className="px-3 py-3">{u.cvCount}</td>
									<td className="px-3 py-3">{u.downloadCount}</td>
									<td className="px-3 py-3 text-xs">
										{u.hasProfile ? (
											<span className="font-medium text-emerald-600 dark:text-emerald-400">
												Oui
											</span>
										) : (
											<span className="text-zinc-400">Non</span>
										)}
									</td>
									<td className="px-3 py-3 text-xs whitespace-nowrap">
										{formatDate(u.lastLoginAt)}
									</td>
									<td className="px-3 py-3 text-xs whitespace-nowrap">
										{formatDate(u.createdAt)}
									</td>
									<td className="px-3 py-3">
										<span
											className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
												u.isActive
													? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
													: "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
											}`}
										>
											{u.isActive ? "Actif" : "Inactif"}
										</span>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</AppCard>

			{totalPages > 1 ? (
				<div className="mt-4 flex items-center justify-between gap-2">
					<Button
						type="button"
						label="Précédent"
						outlined
						disabled={page <= 1 || listQuery.isFetching}
						onClick={() => setPage((p) => Math.max(1, p - 1))}
					/>
					<span className="text-xs text-zinc-500">
						Page {page} / {totalPages}
					</span>
					<Button
						type="button"
						label="Suivant"
						outlined
						disabled={page >= totalPages || listQuery.isFetching}
						onClick={() =>
							setPage((p) => Math.min(totalPages, p + 1))
						}
					/>
				</div>
			) : null}
		</div>
	);
}
