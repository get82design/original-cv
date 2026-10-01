import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import { trpc } from "@utils/trpc";
import { getClientErrorMessage } from "@/utils/clientError";

/**
 * Préférences compte (UX) — au-dessus de la zone dangereuse.
 */
export const ProfilePreferences = () => {
	const toast = useRef<Toast>(null);
	const utils = trpc.useUtils();
	const { data: me, isLoading } = trpc.user.me.useQuery();
	const updateMutation = trpc.user.updateProfile.useMutation({
		onSuccess: () => {
			void utils.user.me.invalidate();
		},
		onError: (err) => {
			toast.current?.show({
				severity: "error",
				summary: "Préférence non enregistrée",
				detail: getClientErrorMessage(err, "Une erreur est survenue."),
				life: 4000,
			});
		},
	});

	const showOnboarding = me ? !me.hideCvOnboarding : true;
	const disabled = isLoading || !me || updateMutation.isPending;

	const onToggle = (checked: boolean) => {
		updateMutation.mutate({ hideCvOnboarding: !checked });
	};

	return (
		<>
			<Toast ref={toast} position="top-center" />
			<section className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-900/50">
				<p className="m-0 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
					Préférences
				</p>
				<p className="m-0 mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
					Contrôlez l’affichage du guide de première utilisation dans l’éditeur CV.
				</p>
				<label
					htmlFor="profile-show-cv-onboarding"
					className="mt-3 flex items-start gap-2.5 text-sm text-zinc-800 dark:text-zinc-200 cursor-pointer select-none"
				>
					<Checkbox
						inputId="profile-show-cv-onboarding"
						checked={showOnboarding}
						disabled={disabled}
						onChange={(e) => onToggle(Boolean(e.checked))}
						className="mt-0.5"
					/>
					<span>
						Afficher le guide à la prochaine ouverture de l’éditeur
					</span>
				</label>
			</section>
		</>
	);
};
