import { AppCard } from "@/components/card/AppCard";
import { trpc } from "@utils/trpc";
import { useRouter } from "next/router";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useState } from "react";

export const ResetPasswordCompo = () => {
    const router = useRouter();
    const token = typeof router.query.token === "string" ? router.query.token : "";
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const reset = trpc.user.resetPassword.useMutation();

    const onSubmit = () => {
        setError(null);
        setMessage(null);
        if (password.length < 8) {
          setError("Le mot de passe doit contenir au moins 8 caractères");
          return; // stop — pas d'appel API
        }
        if (password !== confirm) {
          setError("Les mots de passe ne correspondent pas");
          return;
        }
        reset.mutate(
          { token, password },
          {
            onSuccess: () => {
              setMessage("Mot de passe mis à jour. Vous pouvez vous connecter.");
              setTimeout(() => router.push("/login"), 1500);
            },
            onError: (e) => {
              setError(
                e.message ||
                  "Lien de réinitialisation invalide ou expiré. Demandez-en un nouveau.",
              );
            },
          },
        );
    };

    if (!router.isReady) return null;
    
    if (!token) {
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
                    <p className="text-center text-xl font-semibold text-gray-400 dark:text-gray-600">Réinitialiser mot de passe</p>
                    <p className="text-center mt-8 text-sm text-gray-400 dark:text-gray-600">Le lien de réinitialisation est invalide ou a expiré.</p>
                    <Button
                        label="Retour à la page de connexion"
                        className="w-full"
                        onClick={() => router.push("/login")}
                    />
                </AppCard>
            </div>
        )
    }
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
                <p className="text-center text-xl font-semibold text-gray-400 dark:text-gray-600">Réinitialiser mot de passe</p>
                <div className="flex flex-col gap-3 mt-6">
                    <InputText
                        type="password"
                        placeholder="Nouveau mot de passe"
                        className="w-full"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <InputText
                        type="password"
                        placeholder="Confirmer le nouveau mot de passe"
                        className="w-full"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                    />
                </div>
                <Button
                    label="Réinitialiser"
                    className="w-full"
                    disabled={reset.isPending}
                    loading={reset.isPending}
                    onClick={onSubmit}
                />
                {message && <p className="text-green-600 text-center text-sm">{message}</p>}
                {error && <p className="text-red-500 text-center text-sm">{error}</p>}
            </AppCard>
		</div>
	);
};