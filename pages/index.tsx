import { signOut, useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

export default function Home() {
	const utils = trpc.useUtils();
	
	const { data: session, status } = useSession();

	const { data: userData, isLoading } = trpc.user.me.useQuery();

	const { data: cvs, isLoading: cvsLoading } = trpc.cv.allByUser.useQuery();
	console.info("^^cvs", cvs);

	const { data: templates, isLoading: templatesLoading } = trpc.cvTemplate.findAll.useQuery();
	console.info("^^templates", templates);

	const createCv = trpc.cv.create.useMutation({
		onSuccess: () => {
			// invalide la liste typée tRPC (mieux que queryClient brut)
			void utils.cv.allByUser.invalidate();
		},
	});

	const handleCreateCv = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
		const templateId = String(form.get("templateId") ?? "");
		const title = String(form.get("title") ?? "");
		if (!templateId || !title) return;
		createCv.mutateAsync(
			{ templateId, title },
			// {
			// 	onError: (err) => {
			// 		console.error(err.message); // quota, doublon, etc.
			// 	},
			// },
		);
	};

	if (isLoading) return <div>Loading...</div>;

	return (
		<div>
			<h1>User</h1>
			<p>
				{userData?.name} ({userData?.email})
			</p>
			{status === "authenticated" && 
				<button type="button" onClick={() => signOut({ callbackUrl: "/login" })}>
					Déconnexion
				</button>
			}
			<h2>Mes cvs</h2>
			{cvsLoading ? <div>Loading cvs...</div> : cvs?.map((cv) => (
				<div key={cv.id}>
					<Link href={`/cv/${cv.id}`}>{cv.title}</Link>
					<p>{templates?.find((template) => template.id === cv.templateId)?.name || "Template non trouvé"}</p>
				</div>
			))}
			<h2>Créer un cv</h2>
			<form onSubmit={handleCreateCv}>
				<select name="templateId" id="templateId">
					{templates?.map((template) => (
						<option key={template.id} value={template.id}>{template.name}</option>
					))}
				</select>
				<input type="text" name="title" id="title" placeholder="Titre du cv" />
				<button type="submit">Créer</button>
				{createCv.error && <p>{createCv.error.message}</p>}
			</form>
		</div>
	);
}
