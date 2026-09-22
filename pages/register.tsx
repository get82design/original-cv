// import { signIn } from "next-auth/react";
// import { useRouter } from "next/router";
// import { useState } from "react";
// import { trpc } from "../utils/trpc";
import { RegisterCompo } from "../src/features/auth/RegisterCompo";

export default function RegisterPage() {
	// const router = useRouter();
	// const [error, setError] = useState<string | null>(null);
	// const register = trpc.user.register.useMutation();

	// async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
	// 	e.preventDefault();
	// 	setError(null);

	// 	const form = new FormData(e.currentTarget);
	// 	const email = String(form.get("email"));
	// 	const password = String(form.get("password"));
	// 	const name = String(form.get("name") || "");

	// 	try {
	// 		await register.mutateAsync({
	// 			email,
	// 			password,
	// 			...(name ? { name } : {}),
	// 		});

	// 		const result = await signIn("credentials", {
	// 			email,
	// 			password,
	// 			redirect: false,
	// 		});

	// 		if (result?.ok) router.push("/");
	// 		else setError("Compte créé, mais connexion impossible");
	// 	} catch {
	// 		setError("Impossible de créer le compte");
	// 	}
	// }

	return (
		// <form onSubmit={onSubmit}>
		// 	<input name="name" type="text" placeholder="Nom" />
		// 	<input name="email" type="email" required />
		// 	<input name="password" type="password" minLength={8} required />
		// 	<button type="submit" disabled={register.isPending}>
		// 		Créer un compte
		// 	</button>
		// 	{error && <p>{error}</p>}
		// </form>
		<RegisterCompo />
	);
}
