/** Illustration d'un tip — assets dans `public/tips/`. `srcDark` optionnel si la capture jure en dark. */
export interface CvTipMedia {
	src: string;
	srcDark?: string;
	alt: string;
	/** Dimensions réelles de l'asset (next/image) — évite le saut de mise en page. */
	width: number;
	height: number;
}

export interface CvTip {
	/** Identifiant stable : clé de rendu, cible d'ouverture directe, suivi « déjà lu ». */
	id: string;
	title: string;
	text: string;
	media?: CvTipMedia;
}

export interface CvTipGroup {
	id: string;
	title: string;
	icon: string;
	tips: CvTip[];
}

export const CV_TIP_GROUPS: CvTipGroup[] = [
	{
		id: "contenu",
		title: "Contenu",
		icon: "pi pi-pencil",
		tips: [
			{
				id: "accroche-ciblee",
				title: "Une phrase d’accroche ciblée",
				text: "3 lignes max : votre métier, vos années d’expérience et ce que vous cherchez. Adaptez-la à chaque candidature.",
			},
			{
				id: "resultats-chiffres",
				title: "Des résultats, pas des tâches",
				text: "Préférez « augmenté les ventes de 20 % » à « responsable des ventes ». Les chiffres rassurent le recruteur.",
			},
			{
				id: "mots-cles-annonce",
				title: "Les mots-clés de l’annonce",
				text: "Reprenez le vocabulaire de l’offre : beaucoup de CV sont filtrés automatiquement avant lecture humaine.",
			},
		],
	},
	{
		id: "mise-en-page",
		title: "Mise en page",
		icon: "pi pi-table",
		tips: [
			{
				id: "une-ou-deux-pages",
				title: "1 page si possible, 2 maximum",
				text: "Le dock de droite permet de désactiver une section ou de réduire les espacements pour tenir sur une page.",
			},
			{
				id: "reorganiser-dnd",
				title: "Réorganisez par glisser-déposer",
				text: "Placez en haut les sections qui vous vendent le mieux : expériences si vous en avez, formation si vous débutez.",
			},
			{
				id: "annuler-ctrl-z",
				title: "Annuler sans rien perdre",
				text: "Ctrl+Z annule la dernière modification de structure, Ctrl+Y la rétablit. Vous pouvez tester librement.",
			},
		],
	},
	{
		id: "aller-plus-vite",
		title: "Aller plus vite",
		icon: "pi pi-bolt",
		tips: [
			{
				id: "partir-du-profil",
				title: "Partez de votre profil",
				text: "« Données du profil » injecte vos expériences déjà saisies : vous ne retapez rien d’un CV à l’autre.",
			},
			{
				id: "relecture-ia",
				title: "Faites relire par l’IA",
				text: "L’assistant IA reformule une section ou relit tout le CV et pointe ce qui manque avant l’envoi.",
			},
			{
				id: "relire-avant-dl",
				title: "Relisez avant de télécharger",
				text: "Vérifiez email et téléphone, puis contrôlez l’aperçu du dialog de téléchargement : c’est ce que le recruteur verra.",
			},
		],
	},
];
