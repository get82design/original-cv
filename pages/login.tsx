import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

export default function LoginPage() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
		const result = await signIn("credentials", {
			email: String(form.get("email")),
			password: String(form.get("password")),
			redirect: false,
		});
		if (result?.ok) router.push("/");
		else setError("Email ou mot de passe incorrect");
	}

	return (
		<form onSubmit={onSubmit}>
			<input name="email" type="email" required />
			<input name="password" type="password" required />
			<button type="submit">Connexion</button>
			{error && <p>{error}</p>}
		</form>
	);
}