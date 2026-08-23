import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { useState } from "react";
import { FaGoogle, FaFacebook, FaGithub } from "react-icons/fa";
import { AppCard } from "../../components/card/AppCard";
import { Checkbox } from "primereact/checkbox";
import Link from "next/link";
import { hasGuestCvDraft } from "../cv-editor/utils/guestCvDraft";

export const LoginCompo = () => {
	const router = useRouter();
	const [form, setForm] = useState({
		email: "",
		password: "",
	});
	const [error, setError] = useState<string | null>(null);

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
		const result = await signIn("credentials", {
			email: String(form.get("email")),
			password: String(form.get("password")),
			redirect: false,
		});
		if (result?.ok) router.push(hasGuestCvDraft() ? "/cv/0" : "/");
		else setError("Email ou mot de passe incorrect");
	};

	return (
		<div
			className="flex flex-col items-center justify-center"
			style={{ height: "calc(100vh - 58px)" }}
		>
			<AppCard className="w-1/2 flex flex-col gap-3 p-8">
				<h1 className="font-light text-4xl text-center mt-4">
					Original
					<span className="text-primary dark:text-primary-dark font-bold">
						CV
					</span>
				</h1>
				<p className="text-center text-xl font-semibold text-gray-400 dark:text-gray-600">
					Welcome back!
				</p>
				<div className="flex justify-around gap-4 my-4">
					{/* //! pas encore mis en place */}
					<Button
						outlined
						color="light"
						className="w-full text-black dark:text-white flex justify-center items-center gap-2"
					>
						<FaGoogle />
						Google
					</Button>
					<Button
						outlined
						color="light"
						className="w-full text-black dark:text-white flex justify-center items-center gap-2"
					>
						<FaFacebook />
						Facebook
					</Button>
					<Button
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
				<form onSubmit={onSubmit}>
					<div className="w-full flex flex-col gap-3 mt-4">
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
							{error && <p className="text-red-500">{error}</p>}
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
							<label htmlFor="password">Password</label>
							{error && <p className="text-red-500">{error}</p>}
						</FloatLabel>
						<div className="flex justify-between items-center my-2">
							{/* //! pas encore mis en place (checkbox et Link)*/}
							<div className="flex items-center gap-2">
								<Checkbox id="remember" name="remember" checked={false} />
								<label htmlFor="remember">Se souvenir de moi</label>
							</div>
							<Link
								href="/forgot-password"
								className="text-sm text-primary dark:text-primary-dark hover:underline"
							>
								Mot de passe oublié ?
							</Link>
						</div>
						<Button
							type="submit"
							className="w-full bg-primary hover:bg-primary-dark font-semibold uppercase flex justify-center dark:bg-primary-dark hover:dark:bg-primary text-white dark:text-black rounded-md"
						>
							Se connecter
						</Button>
					</div>
					<p className="text-center text-sm text-gray-400 dark:text-gray-600 mt-3">
						Vous n'avez pas de compte ?{" "}
						<Link
							href="/register"
							className="text-primary hover:text-primary-dark dark:text-primary-dark hover:dark:text-primary hover:underline"
						>
							S'inscrire
						</Link>
					</p>
				</form>
			</AppCard>
		</div>
	);
};
