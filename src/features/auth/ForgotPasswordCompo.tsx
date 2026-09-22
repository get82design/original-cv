import { AppCard } from "@/components/card/AppCard";
import { trpc } from "@utils/trpc";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useState } from "react";

export const ForgotPasswordCompo = () => {
	const forgot = trpc.user.forgotPassword.useMutation();
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
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
					Mot de passe oublié
				</p>
				<div className="flex flex-col gap-3 mt-6">
					<InputText
						type="email"
						placeholder="Email"
						className="w-full"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
					<Button
						label="Envoyer"
						className="w-full"
						disabled={forgot.isPending}
						loading={forgot.isPending}
						onClick={() =>
							forgot.mutate(
								{ email: email }, // ou TON email de compte
								{
									onSuccess: () => {
										setError(null);
										setMessage(
											"Si un compte est associé à cet email, vous recevrez un lien de réinitialisation.",
										);
									},
									onError: (e) => {
										setMessage(null);
										setMessage(null);
										setError("Impossible d'envoyer l'email. Réessayez plus tard.");
										// ou e.message si tu préfères
									},
								},
							)
						}
					/>
					{message && <p className="text-green-600 text-center text-sm">{message}</p>}
					{error && <p className="text-red-500 text-center text-sm">{error}</p>}
				</div>
			</AppCard>
		</div>
	);
};
