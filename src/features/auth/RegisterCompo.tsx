import { Button } from "primereact/button";
import { AppCard } from "../../components/card/AppCard";
import { Divider } from "primereact/divider";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { trpc } from "@utils/trpc";
import { signIn } from "next-auth/react";
import { TRPCClientError } from "@trpc/client";
import { hasGuestCvDraft } from "../cv-editor/utils/guestCvDraft";

export const RegisterCompo = () => {
	const router = useRouter();
	const register = trpc.user.register.useMutation();
	const [form, setForm] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
		acceptTerms: false,
	});
	const [error, setError] = useState<string | null>(null);

	const handleRegister = async () => {
		setError(null);

		if (!form.acceptTerms) {
			setError("Vous devez accepter les CGU et la politique de confidentialité");
			return;
		}

		if (form.password !== form.confirmPassword) {
			setError("Les mots de passe ne correspondent pas");
			return;
		}

		if (form.password.length < 8) {
			setError("Le mot de passe doit contenir au moins 8 caractères");
			return;
		}

		try {
			await register.mutateAsync({
				email: form.email,
				password: form.password,
				acceptTerms: true,
				...(form.name ? { name: form.name } : {}),
			});

			const result = await signIn("credentials", {
				email: form.email,
				password: form.password,
				redirect: false,
			});

			if (result?.ok) router.push(hasGuestCvDraft() ? "/cv/0" : "/");
			else setError("Compte créé, mais connexion impossible");
		} catch (err) {
			if (err instanceof TRPCClientError && err.data?.code === "CONFLICT") {
				setError("Cet email est déjà utilisé");
				return;
			}
			setError("Impossible de créer le compte");
		}
	};

	return (
		<div
			className="flex flex-col items-center justify-center"
			style={{ height: "calc(100vh - 58px)" }}
		>
			<AppCard className="auth-form w-1/2 flex flex-col gap-3 p-8">
				<h1 className="font-light text-4xl text-center mt-4">
					Original
					<span className="text-primary dark:text-primary-dark font-bold">CV</span>
				</h1>
				<p className="text-center text-xl font-semibold text-gray-400 dark:text-gray-600">
					Créer un compte
				</p>
				<div className="flex justify-around gap-4 my-4">
					{/* OAuth : pas encore d’acceptation CGU avant signIn — voir TODO.md / business-rules */}
					<Button
						onClick={() =>
							signIn("google", {
								callbackUrl: hasGuestCvDraft() ? "/cv/0" : "/",
							})
						}
						outlined
						color="light"
						className="w-full text-black dark:text-white flex justify-center items-center gap-2"
					>
						<FaGoogle />
						Google
					</Button>
					<Button
						onClick={() =>
							signIn("github", {
								callbackUrl: hasGuestCvDraft() ? "/cv/0" : "/",
							})
						}
						outlined
						color="light"
						className="w-full text-black dark:text-white flex justify-center items-center gap-2"
					>
						<FaGithub />
						Github
					</Button>
				</div>
				<Divider align="center">
					<span className="bg-white dark:bg-black p-2">Ou</span>
				</Divider>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						void handleRegister();
					}}
				>
					<div className="w-full flex flex-col gap-3 mt-4">
						<FloatLabel>
							<InputText
								id="name"
								name="name"
								type="text"
								value={form.name}
								onChange={(e) => setForm({ ...form, name: e.target.value })}
								className="w-full rounded-md"
								required
							/>
							<label htmlFor="name">Nom</label>
						</FloatLabel>
						<FloatLabel>
							<InputText
								id="email"
								name="email"
								type="email"
								value={form.email}
								onChange={(e) => setForm({ ...form, email: e.target.value })}
								className="w-full rounded-md"
								required
							/>
							<label htmlFor="email">Email</label>
						</FloatLabel>
						<FloatLabel>
							<InputText
								id="password"
								name="password"
								type="password"
								value={form.password}
								onChange={(e) => setForm({ ...form, password: e.target.value })}
								className="w-full rounded-md"
								required
							/>
							<label htmlFor="password">Mot de passe</label>
						</FloatLabel>
						<FloatLabel>
							<InputText
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								value={form.confirmPassword}
								onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
								className="w-full rounded-md"
								required
							/>
							<label htmlFor="confirmPassword">Confirmation du mot de passe</label>
						</FloatLabel>

						<div className="flex items-start gap-2 py-1">
							<Checkbox
								inputId="acceptTerms"
								checked={form.acceptTerms}
								onChange={(e) => setForm({ ...form, acceptTerms: !!e.checked })}
							/>
							<label
								htmlFor="acceptTerms"
								className="m-0 cursor-pointer text-sm leading-snug text-zinc-600 dark:text-zinc-400"
							>
								J’accepte les{" "}
								<Link
									href="/cgu"
									target="_blank"
									className="text-primary hover:underline dark:text-primary-dark"
								>
									CGU
								</Link>{" "}
								et la{" "}
								<Link
									href="/politique-de-confidentialite"
									target="_blank"
									className="text-primary hover:underline dark:text-primary-dark"
								>
									politique de confidentialité
								</Link>
							</label>
						</div>

						{error && <p className="text-red-500">{error}</p>}
						<Button
							type="submit"
							disabled={register.isPending || !form.acceptTerms}
							className="w-full bg-primary hover:bg-primary-dark font-semibold uppercase flex justify-center dark:bg-primary-dark hover:dark:bg-primary text-white dark:text-black rounded-md"
						>
							Créer un compte
						</Button>
					</div>
					<p className="text-center text-sm text-gray-400 dark:text-gray-600 mt-3">
						Vous avez déjà un compte ?{" "}
						<Link
							href="/login"
							className="text-primary hover:text-primary-dark dark:text-primary-dark hover:dark:text-primary hover:underline"
						>
							Se connecter
						</Link>
					</p>
				</form>
			</AppCard>
		</div>
	);
};
