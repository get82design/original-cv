export interface CvOnboardingStep {
	/** Identifiant stable pour le rendu et les tests. */
	id: string;
	title: string;
	text: string;
	icon: string;
}

/** Guide « première utilisation » — distinct des Tips (`cvTips.ts`). */
export const CV_ONBOARDING_STEPS: CvOnboardingStep[] = [
	{
		id: "bienvenue",
		title: "Bienvenue",
		text: "Voici l’éditeur A4 : ce que vous voyez est ce que vous téléchargez. Ce tour rapide dure environ une minute.",
		icon: "pi pi-home",
	},
	{
		id: "sections",
		title: "Remplir les sections",
		text: "Cliquez dans une zone pour éditer. Les modules (expériences, formations…) et leur ordre dépendent du modèle choisi.",
		icon: "pi pi-pencil",
	},
	{
		id: "dock",
		title: "Dock / mise en page",
		text: "Sur grand écran, le panneau latéral permet de gérer couleurs, modules et options de mise en page sans quitter le CV.",
		icon: "pi pi-th-large",
	},
	{
		id: "sauvegarder",
		title: "Sauvegarder",
		text: "Pensez à enregistrer régulièrement. Le profil est votre vivier de données ; chaque CV reste une instance indépendante.",
		icon: "pi pi-save",
	},
	{
		id: "telecharger-tips",
		title: "Télécharger + Tips",
		text: "Exportez en gratuit (avec logo) ou payant. Retrouvez ce guide et des conseils rédaction à tout moment via « Quelques tips » (SpeedDial, icône info).",
		icon: "pi pi-download",
	},
];
