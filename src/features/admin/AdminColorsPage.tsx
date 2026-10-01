import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { TitleAppOne } from "@/components/title/TitleAppOne";
import { AppCard } from "@/components/card/AppCard";
import { getClientErrorMessage } from "@/utils/clientError";
import { trpc } from "@utils/trpc";
import type { Color } from "@utils/trpc.types";

const SHADE_OPTIONS: { label: string; value: string }[] = [
	{ label: "(aucune)", value: "" },
	{ label: "-100", value: "-100" },
	{ label: "-200", value: "-200" },
	{ label: "-300", value: "-300" },
	{ label: "-400", value: "-400" },
	{ label: "-500", value: "-500" },
	{ label: "-600", value: "-600" },
	{ label: "-700", value: "-700" },
	{ label: "-800", value: "-800" },
	{ label: "-900", value: "-900" },
];

function cssToken(name: string, primary: string) {
	return primary ? `var(--${name}${primary})` : `var(--${name})`;
}

export function AdminColorsPage() {
	const router = useRouter();
	const toast = useRef<Toast>(null);
	const { data: session, status } = useSession();
	const isAdmin = session?.user?.role === "ADMIN";

	const [dialogOpen, setDialogOpen] = useState(false);
	const [editing, setEditing] = useState<Color | null>(null);
	const [draftName, setDraftName] = useState("");
	const [draftPrimary, setDraftPrimary] = useState("-600");
	const [deleteTarget, setDeleteTarget] = useState<Color | null>(null);

	useEffect(() => {
		if (status === "loading") return;
		if (status !== "authenticated" || !isAdmin) {
			void router.replace("/");
		}
	}, [status, isAdmin, router]);

	const utils = trpc.useUtils();
	const listQuery = trpc.color.findAll.useQuery(undefined, {
		enabled: status === "authenticated" && isAdmin,
	});

	const createMutation = trpc.color.create.useMutation({
		onSuccess: async () => {
			toast.current?.show({
				severity: "success",
				summary: "Couleurs",
				detail: "Couleur créée.",
				life: 2500,
			});
			setDialogOpen(false);
			await utils.color.findAll.invalidate();
		},
		onError: (err) => {
			toast.current?.show({
				severity: "error",
				summary: "Erreur",
				detail: getClientErrorMessage(err, "Création impossible."),
				life: 4000,
			});
		},
	});

	const updateMutation = trpc.color.update.useMutation({
		onSuccess: async () => {
			toast.current?.show({
				severity: "success",
				summary: "Couleurs",
				detail: "Couleur mise à jour.",
				life: 2500,
			});
			setDialogOpen(false);
			setEditing(null);
			await utils.color.findAll.invalidate();
		},
		onError: (err) => {
			toast.current?.show({
				severity: "error",
				summary: "Erreur",
				detail: getClientErrorMessage(err, "Mise à jour impossible."),
				life: 4000,
			});
		},
	});

	const deleteMutation = trpc.color.delete.useMutation({
		onSuccess: async () => {
			toast.current?.show({
				severity: "success",
				summary: "Couleurs",
				detail: "Couleur supprimée.",
				life: 2500,
			});
			setDeleteTarget(null);
			await utils.color.findAll.invalidate();
		},
		onError: (err) => {
			toast.current?.show({
				severity: "error",
				summary: "Erreur",
				detail: getClientErrorMessage(err, "Suppression impossible."),
				life: 4000,
			});
		},
	});

	const moveMutation = trpc.color.move.useMutation({
		onSuccess: async (list) => {
			utils.color.findAll.setData(undefined, list);
			await utils.color.findAll.invalidate();
		},
		onError: (err) => {
			toast.current?.show({
				severity: "error",
				summary: "Erreur",
				detail: getClientErrorMessage(err, "Réordonnancement impossible."),
				life: 3500,
			});
		},
	});

	const openCreate = () => {
		setEditing(null);
		setDraftName("");
		setDraftPrimary("-600");
		setDialogOpen(true);
	};

	const openEdit = (row: Color) => {
		setEditing(row);
		setDraftName(row.name);
		setDraftPrimary(row.primary ?? "");
		setDialogOpen(true);
	};

	const save = () => {
		const name = draftName.trim();
		if (!name) {
			toast.current?.show({
				severity: "warn",
				summary: "Nom requis",
				detail: "Indiquez un nom de couleur (ex. teal).",
				life: 3000,
			});
			return;
		}
		if (editing) {
			updateMutation.mutate({
				id: editing.id,
				data: { name, primary: draftPrimary },
			});
			return;
		}
		createMutation.mutate({ name, primary: draftPrimary });
	};

	const saving = createMutation.isPending || updateMutation.isPending;
	const colors = listQuery.data ?? [];

	if (status === "loading") {
		return (
			<div className="mx-auto max-w-4xl px-4 py-10">
				<p className="text-sm text-zinc-500">Chargement…</p>
			</div>
		);
	}

	if (status !== "authenticated" || !isAdmin) {
		return (
			<div className="mx-auto max-w-4xl px-4 py-10">
				<p className="text-sm text-zinc-500">Accès réservé aux admins.</p>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
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
						secondPart="couleurs"
						withSpace
						classNameSize="text-3xl sm:text-4xl"
					/>
					<p className="mt-1 m-0 text-sm text-zinc-500 dark:text-zinc-400">
						Catalogue des teintes du sélecteur CV (`name` + shade CSS).
					</p>
				</div>
				<div className="flex items-center gap-3">
					<p className="m-0 text-sm text-zinc-500 dark:text-zinc-400">
						{colors.length} couleur{colors.length > 1 ? "s" : ""}
					</p>
					<Button
						type="button"
						label="Ajouter"
						icon="pi pi-plus"
						size="small"
						onClick={openCreate}
					/>
				</div>
			</div>

			<AppCard className="overflow-x-auto !p-0">
				<table className="w-full min-w-[32rem] border-collapse text-left text-sm">
					<thead>
						<tr className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400">
							<th className="px-4 py-3 font-semibold">Aperçu</th>
							<th className="px-3 py-3 font-semibold">Nom</th>
							<th className="px-3 py-3 font-semibold">Shade</th>
							<th className="px-3 py-3 font-semibold">Ordre</th>
							<th className="px-3 py-3 font-semibold" />
						</tr>
					</thead>
					<tbody>
						{listQuery.isLoading ? (
							<tr>
								<td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
									Chargement…
								</td>
							</tr>
						) : colors.length === 0 ? (
							<tr>
								<td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
									Aucune couleur. Ajoutez-en ou lancez le seed.
								</td>
							</tr>
						) : (
							colors.map((c, index) => (
								<tr key={c.id} className="border-b border-zinc-100 dark:border-zinc-800">
									<td className="px-4 py-3">
										<span
											className="inline-block h-7 w-7 rounded-full ring-1 ring-inset ring-zinc-300 dark:ring-zinc-600"
											style={{ backgroundColor: cssToken(c.name, c.primary) }}
											title={cssToken(c.name, c.primary)}
										/>
									</td>
									<td className="px-3 py-3 font-medium text-zinc-900 dark:text-zinc-100">
										{c.name}
									</td>
									<td className="px-3 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-300">
										{c.primary || "—"}
									</td>
									<td className="px-3 py-3">
										<div className="flex items-center gap-1">
											<span className="w-6 text-zinc-600 dark:text-zinc-300">{c.order}</span>
											<Button
												type="button"
												text
												size="small"
												icon="pi pi-arrow-up"
												aria-label={`Monter ${c.name}`}
												disabled={index === 0 || moveMutation.isPending}
												onClick={() =>
													moveMutation.mutate({ id: c.id, direction: "up" })
												}
											/>
											<Button
												type="button"
												text
												size="small"
												icon="pi pi-arrow-down"
												aria-label={`Descendre ${c.name}`}
												disabled={index === colors.length - 1 || moveMutation.isPending}
												onClick={() =>
													moveMutation.mutate({ id: c.id, direction: "down" })
												}
											/>
										</div>
									</td>
									<td className="px-3 py-3 text-right">
										<div className="flex justify-end gap-1">
											<Button
												type="button"
												text
												size="small"
												icon="pi pi-pencil"
												aria-label={`Modifier ${c.name}`}
												onClick={() => openEdit(c)}
											/>
											<Button
												type="button"
												text
												severity="danger"
												size="small"
												icon="pi pi-trash"
												aria-label={`Supprimer ${c.name}`}
												onClick={() => setDeleteTarget(c)}
											/>
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</AppCard>

			<Dialog
				header={editing ? "Modifier la couleur" : "Nouvelle couleur"}
				visible={dialogOpen}
				onHide={() => {
					if (saving) return;
					setDialogOpen(false);
					setEditing(null);
				}}
				className="dialog-admin-color w-full max-w-md"
				footer={
					<div className="flex justify-end gap-2">
						<Button
							type="button"
							label="Annuler"
							text
							disabled={saving}
							onClick={() => {
								setDialogOpen(false);
								setEditing(null);
							}}
						/>
						<Button
							type="button"
							label="Enregistrer"
							loading={saving}
							onClick={save}
						/>
					</div>
				}
			>
				<div className="flex flex-col gap-4 pt-1">
					<div>
						<label htmlFor="admin-color-name" className="mb-1 block text-xs text-zinc-500">
							Nom (token CSS)
						</label>
						<InputText
							id="admin-color-name"
							value={draftName}
							onChange={(e) => setDraftName(e.target.value)}
							placeholder="ex. teal, indigo…"
							className="w-full"
						/>
					</div>
					<div>
						<label htmlFor="admin-color-shade" className="mb-1 block text-xs text-zinc-500">
							Shade
						</label>
						<Dropdown
							id="admin-color-shade"
							value={draftPrimary}
							options={SHADE_OPTIONS}
							onChange={(e) => setDraftPrimary((e.value as string) ?? "")}
							optionLabel="label"
							optionValue="value"
							className="w-full"
						/>
					</div>
					{draftName.trim() ? (
						<div className="flex items-center gap-3 rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-700">
							<span
								className="inline-block h-8 w-8 rounded-full ring-1 ring-inset ring-zinc-300 dark:ring-zinc-600"
								style={{
									backgroundColor: cssToken(draftName.trim().toLowerCase(), draftPrimary),
								}}
							/>
							<span className="font-mono text-xs text-zinc-600 dark:text-zinc-300">
								{cssToken(draftName.trim().toLowerCase(), draftPrimary)}
							</span>
						</div>
					) : null}
				</div>
			</Dialog>

			<Dialog
				header="Supprimer la couleur"
				visible={deleteTarget != null}
				onHide={() => {
					if (deleteMutation.isPending) return;
					setDeleteTarget(null);
				}}
				className="dialog-admin-color w-full max-w-sm"
				footer={
					<div className="flex justify-end gap-2">
						<Button
							type="button"
							label="Annuler"
							text
							disabled={deleteMutation.isPending}
							onClick={() => setDeleteTarget(null)}
						/>
						<Button
							type="button"
							label="Supprimer"
							severity="danger"
							loading={deleteMutation.isPending}
							onClick={() => {
								if (!deleteTarget) return;
								deleteMutation.mutate({ id: deleteTarget.id });
							}}
						/>
					</div>
				}
			>
				{deleteTarget ? (
					<p className="m-0 text-sm text-zinc-700 dark:text-zinc-200">
						Supprimer <strong>{deleteTarget.name}</strong> du catalogue ? Les CV qui
						l’utilisent garderont le nom en base, mais le swatch disparaîtra du sélecteur.
					</p>
				) : null}
			</Dialog>
		</div>
	);
}
