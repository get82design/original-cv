import { Button } from "primereact/button";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { trpc } from "@utils/trpc";
import { DialogDeleteAccount } from "@/components/dialog/DialogDeleteAccount";
import { getClientErrorMessage } from "@/utils/clientError";
import { Toast } from "primereact/toast";
import { useRef } from "react";

/**
 * Zone dangereuse profil — suppression de compte (RGPD).
 */
export const ProfileDangerZone = () => {
	const [visible, setVisible] = useState(false);
	const toast = useRef<Toast>(null);
	const router = useRouter();
	const deleteMutation = trpc.user.deleteAccount.useMutation();

	const onConfirm = async (confirmation: string) => {
		try {
			await deleteMutation.mutateAsync({ confirmation });
			setVisible(false);
			await signOut({ redirect: false });
			await router.replace("/");
		} catch (err) {
			toast.current?.show({
				severity: "error",
				summary: "Suppression impossible",
				detail: getClientErrorMessage(err, "Une erreur est survenue."),
				life: 5000,
			});
		}
	};

	return (
		<>
			<Toast ref={toast} position="top-center" />
			<section className="mt-8 rounded-lg border border-red-200 bg-red-50/60 p-4 dark:border-red-900/60 dark:bg-red-950/30">
				<p className="m-0 text-sm font-semibold text-red-800 dark:text-red-200">
					Zone dangereuse
				</p>
				<p className="m-0 mt-1 text-xs leading-relaxed text-red-700/90 dark:text-red-300/90">
					La suppression de compte est immédiate et irréversible.
				</p>
				<Button
					type="button"
					label="Supprimer mon compte"
					icon="pi pi-trash"
					severity="danger"
					outlined
					className="mt-3"
					onClick={() => setVisible(true)}
				/>
			</section>
			<DialogDeleteAccount
				visible={visible}
				loading={deleteMutation.isPending}
				onHide={() => {
					if (deleteMutation.isPending) return;
					setVisible(false);
				}}
				onConfirm={(confirmation) => {
					void onConfirm(confirmation);
				}}
			/>
		</>
	);
};
