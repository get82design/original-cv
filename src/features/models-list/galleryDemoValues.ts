import type { CvFormValues } from "@/services/schemas/cvSave.schema";
import { classiqueTokens } from "../../../prisma/seedDatas/themeTokens";

/** Contenu Clara Delorme (seed.cvs), adapté form / galerie — pas d’IDs DB */
export const galleryDemoValues: CvFormValues = {
	templateId: "",
	title: "CV - Clara Delorme",
	photo: null,
	layoutGeneral: undefined,
	modules: [],
	datas: {
		header: {
			title: "Clara Delorme",
			subtitle: "Conseillère de Vente & Customer Experience Specialist",
			prenom: "Clara",
			nom: "Delorme",
			email: "clara.delorme@email.com",
			phone: "06 78 90 12 34",
			location: "Paris, France",
		},
		description: {
			content: {
				description:
					"Professionnelle du retail passionnée par la culture de marque et la psychologie du consommateur. Spécialiste de la vente conseil à forte valeur ajoutée, j’associe une excellente maîtrise des outils phygitaux (CRM, caisse mobile, e-reservation) à un sens aigu du merchandising visuel.",
			},
			settings: {
				title: classiqueTokens.sectionTitle,
				content: classiqueTokens.body,
			},
		},
		experience: {
			content: [
				{
					clientKey: "demo-exp-1",
					order: 1,
					content: {
						title: "Senior Sales Assistant – Mode & Maison",
						company: "Boutique L'Élégance",
						location: "Paris",
						start: new Date("2023-01-01"),
						end: new Date("2025-06-30"),
						description: "",
						missions: [
							{
								clientKey: "demo-m1-1",
								order: 1,
								content: {
									content:
										"Accueil, conseil personnalisé et accompagnement d'une clientèle internationale.",
								},
							},
							{
								clientKey: "demo-m1-2",
								order: 2,
								content: {
									content: "Réalisation du merchandising vitrine hebdomadaire.",
								},
							},
							{
								clientKey: "demo-m1-3",
								order: 3,
								content: {
									content:
										"Formation et intégration de 4 nouveaux vendeurs saisonniers.",
								},
							},
							{
								clientKey: "demo-m1-4",
								content: {
									content:
										"+18% de ventes incitatives réalisées en 2024 ; 98% de satisfaction client sur les enquêtes Mystère.",
								},
							},
						],
						settings: {
							title: classiqueTokens.itemTitle,
							company: {...classiqueTokens.meta, colorSelect: "primaryColor"},
							periode: classiqueTokens.meta,
							location: {...classiqueTokens.meta, colorSelect: "primaryColor"},
							description: classiqueTokens.body,
							missions: classiqueTokens.body,
							withTitle: true,
							withCompany: true,
							withPeriode: true,
							withLocation: true,
							withDescription: false,
							withListMissions: true,
						  }
					},
				},
				{
					clientKey: "demo-exp-2",
					order: 2,
					content: {
						title: "Vendeuse Polyvalente",
						company: "Retail Fast-Fashion",
						location: "Lyon",
						start: new Date("2021-09-01"),
						end: new Date("2023-01-01"),
						description: "",
						missions: [
							{
								clientKey: "demo-m2-1",
								order: 1,
								content: {
									content:
										"Gestion de la caisse, réassort en rayon et traitement des livraisons matinales.",
								},
							},
						],
						settings: {
							title: classiqueTokens.itemTitle,
							company: {...classiqueTokens.meta, colorSelect: "primaryColor"},
							periode: classiqueTokens.meta,
							location: {...classiqueTokens.meta, colorSelect: "primaryColor"},
							description: classiqueTokens.body,
							missions: classiqueTokens.body,
							withTitle: true,
							withCompany: true,
							withPeriode: true,
							withLocation: true,
							withDescription: false,
							withListMissions: true,
						  }
					},
				},
			],
			settings: {
				title: classiqueTokens.sectionTitle,
			},
		},
		education: {
			content: [
				{
					clientKey: "demo-edu-1",
					order: 1,
					content: {
						title: "BTS Négociation et Digitalisation de la Relation Client",
						school: "NDRC",
						city: "Paris",
						degree: "BTS",
						start: new Date("2019-09-01"),
						end: new Date("2021-06-30"),
						settings: {
							diplome: classiqueTokens.itemTitle,
							etablissement: {...classiqueTokens.meta, colorSelect: 'gray'},
							ville: {...classiqueTokens.meta, colorSelect: 'gray'},
							year: classiqueTokens.meta,	
							withEtablissement: true,
							withVille: true,
							withYear: true,
						}
					},
				},
				{
					clientKey: "demo-edu-2",
					order: 2,
					content: {
						title: "Bac STMG – Option Marketing",
						school: "Lycée La République",
						city: "Paris",
						degree: "Baccalauréat",
						start: new Date("2017-09-01"),
						end: new Date("2019-06-30"),
						settings: {
							diplome: classiqueTokens.itemTitle,
							etablissement: {...classiqueTokens.meta, colorSelect: 'gray'},
							ville: {...classiqueTokens.meta, colorSelect: 'gray'},
							year: classiqueTokens.meta,	
							withEtablissement: true,
							withVille: true,
							withYear: true,
						}
					},
				},
			],
			settings: {
				title: classiqueTokens.sectionTitle,
			},
		},
		language: {
			content: [
				{
					clientKey: "demo-lang-1",
					order: 1,
					content: { 
						name: "Français", 
						level: "Expert", 
				 	},
				},
				{
					clientKey: "demo-lang-2",
					order: 2,
					content: { 
						name: "Anglais", 
						level: "Senior",
					},
				},
				{
					clientKey: "demo-lang-3",
					order: 3,
					content: { 
						name: "Espagnol", 
						level: "Intermédiaire",
					},
				},
			],
			settings: {
				title: classiqueTokens.sectionTitle,
			},
		},
		strength: {
			content: [
				{
					clientKey: "demo-str-1",
					order: 1,
					content: {
						title: "Intelligence émotionnelle",
						description:
							"Capacité à décoder rapidement les attentes du client.",
						icon: "faBrain",
						settings: {
							strength: classiqueTokens.itemTitle,
							description: classiqueTokens.body,
							withStrength: true,
							withDescription: true,
							withIcon: true,
							iconColor: "primaryColor",
							columns: 2,
						}
					},
				},
				{
					clientKey: "demo-str-2",
					order: 2,
					content: {
						title: "Résilience & Gestion du stress",
						description: "Calme constant lors des pics de fréquentation.",
						icon: "faSeedling",
						settings: {
							strength: classiqueTokens.itemTitle,
							description: classiqueTokens.body,
							withStrength: true,
							withDescription: true,
							withIcon: true,
							iconColor: "primaryColor",
							columns: 2,
						}
					},
				},
				{
					clientKey: "demo-str-3",
					order: 3,
					content: {
						title: "Esprit d'équipe",
						description: "Moteur de la motivation collective.",
						icon: "faHandsHelping",
						settings: {
							strength: classiqueTokens.itemTitle,
							description: classiqueTokens.body,
							withStrength: true,
							withDescription: true,
							withIcon: true,
							iconColor: "primaryColor",
							columns: 2,
						}
					},
				},
				{
					clientKey: "demo-str-4",
					order: 4,
					content: { 
						title: "Proactivité", 
						description: "Force de proposition constante pour améliorer la présentation des rayons ou fluidifier l'organisation interne.",
						icon: "faChartLine",
						settings: {
							strength: classiqueTokens.itemTitle,
							description: classiqueTokens.body,
							withStrength: true,
							withDescription: true,
							withIcon: true,
							iconColor: "primaryColor",
							columns: 2,
						}
					},
				},
			],
			settings: {
				title: classiqueTokens.sectionTitle,
			},
		},
		passion: {
			content: [
				{
					clientKey: "demo-pas-1",
					order: 1,
					content: {
						title: "Mode & seconde main",
						icon: "faTshirt",
						settings: {
							passion: classiqueTokens.itemTitle,
							withIcon: true,
							iconColor: "primaryColor",
						}
					},
				},
				{
					clientKey: "demo-pas-2",
					order: 2,
					content: {
						title: "Podcasts psychologie",
						icon: "faHeadphones",
						settings: {
							passion: classiqueTokens.itemTitle,
							withIcon: true,
							iconColor: "primaryColor",
						}
					},
				},
				{
					clientKey: "demo-pas-3",
					order: 3,
					content: {
						title: "Running",
						icon: "faRunning",
						settings: {
							passion: classiqueTokens.itemTitle,
							withIcon: true,
							iconColor: "primaryColor",
						}
					},
				},
			],
			settings: {
				title: classiqueTokens.sectionTitle,
			},
		},
		// Formulaire = .name (pas competenceId / tagId du seed)
		competenceGroup: {
			content: [
				{
					clientKey: "demo-cg-hard",
					order: 1,
					content: {
						title: "Hard Skills",
						competences: [
							"Merchandising visuel",
							"Gestion de caisse (Cegid)",
							"Vente conseil B2C",
							"Fidélisation CRM",
						].map((name, i) => ({
							clientKey: `demo-comp-h-${i}`,
							order: i + 1,
							content: {
								name,
								competenceId: `demo-comp-h-${i}`, // faux id, pas en DB
							},
						})),
						settings: {
							groupTitle: classiqueTokens.itemTitle,
							competences: classiqueTokens.body,
							withGroupTitle: true,
						}
					},
				},
				{
					clientKey: "demo-cg-soft",
					order: 2,
					content: {
						title: "Soft Skills",
						competences: [
							"Écoute active",
							"Empathie",
							"Gestion du stress",
							"Esprit d'équipe",
						].map((name, i) => ({
							clientKey: `demo-comp-h-${i}`,
							order: i + 1,
							content: {
								name,
								competenceId: `demo-comp-h-${i}`, // faux id, pas en DB
							},
						})),
						settings: {
							groupTitle: classiqueTokens.itemTitle,
							competences: classiqueTokens.body,
							withGroupTitle: true,
						}
					},
				},
			],
			settings: {
				title: classiqueTokens.sectionTitle,
			},
		},
		tagGroup: {
			content: [
				{
					clientKey: "demo-tg-1",
					order: 1,
					content: {
						title: "Hard Skills",
						tags: [
							"Merchandising visuel",
							"Gestion de caisse (Cegid)",
							"Gestion de stocks & inventaires",
							"Vente conseil B2C",
							"Fidélisation CRM",
						].map((name, i) => ({
							clientKey: `demo-tag-${i}`,
							order: i + 1,
							content: { name, tagId: `demo-tag-${i}` },
						})),
						settings: {
							groupTitle: {...classiqueTokens.itemTitle, colorSelect: 'black', weightSelect: 'xl'},
							tags: classiqueTokens.body,
							withGroupTitle: true,
							design: "border",
						}
					},
				},
				{
					clientKey: "demo-tg-2",
					order: 2,
					content: {
						title: "Soft Skills",
						tags: [
							"Écoute active",
							"Empathie",
							"Gestion du stress",
							"Esprit d'équipe",
							"Négociation",
						].map((name, i) => ({
							clientKey: `demo-tag-${i}`,
							order: i + 1,
							content: { name, tagId: `demo-tag-${i}` },
						})),
						settings: {
							groupTitle: {...classiqueTokens.itemTitle, colorSelect: 'black', weightSelect: 'xl'},
							tags: classiqueTokens.body,
							withGroupTitle: true,
							design: "border",
						}
					},
				},
			],
			settings: {
				title: classiqueTokens.sectionTitle,
			},
		},
		socialMedia: {
			content: [
				{
					clientKey: "demo-soc-1",
					order: 1,
					content: {
						socialNetwork: "LinkedIn",
						username: "clara.delorme",
						icon: "faLinkedin",
						settings: {
							socialNetwork: classiqueTokens.itemTitle,
							username: classiqueTokens.body,
							withSocialNetwork: true,
							withUsername: true,
							withIcon: true,
							iconColor: "primaryColor",
							columns: 3,
						}
					},
				},
				{
					clientKey: "demo-soc-2",
					order: 2,
					content: {
						socialNetwork: "Instagram",
						username: "@clara.delorme75",
						icon: "faInstagram",
						settings: {
							socialNetwork: classiqueTokens.itemTitle,
							username: classiqueTokens.body,
							withSocialNetwork: true,
							withUsername: true,
							withIcon: true,
							iconColor: "primaryColor",
							columns: 3,
						}
					},
				},
				{
					clientKey: "demo-soc-3",
					order: 3,
					content: {
						socialNetwork: "Facebook",
						username: "clara.delorme",
						icon: "faFacebook",
						settings: {
							socialNetwork: classiqueTokens.itemTitle,
							username: classiqueTokens.body,
							withSocialNetwork: true,
							withUsername: true,
							withIcon: true,
							iconColor: "primaryColor",
							columns: 3,
						}
					},
				},
			],
			settings: {
				title: classiqueTokens.sectionTitle,
			},
		},
		project: {
			content: [
				{
					clientKey: "demo-proj-1",
					order: 1,
					content: {
						title: "Refonte du Parcours Client Phygital & Merchandising",
						description: "Contexte : Baisse de la fréquentation physique de 10 % face à la montée de la vente en ligne.",
						technology: '',
						location: "Boutique L'Élégance (Paris)",
						start: new Date("2024-01-01"),
						end: new Date("2024-06-30"),
						missions: [
							{
								clientKey: "m1-1",
								order: 1,
								content: { 
									content: "Pilotage d'un projet pilote d'intégration de caisses mobiles (tablettes)." },
							},
							{
								clientKey: "m1-2",
								order: 2,
								content: { 
									content: "Réorganisation de la zone d'essayage VIP." },
							},
							{
								clientKey: "m1-3",
								order: 3,
								content: { 
									content: "Élaboration d'un guide de recommandations visuelles pour la mise en valeur des pièces phares." },
							},
						],
						settings: {
							title: classiqueTokens.itemTitle,
							description: classiqueTokens.body,
							technology: classiqueTokens.body,
							location: classiqueTokens.body,
							periode: classiqueTokens.body,
							missions: classiqueTokens.body,
							withTitle: true,
							withDescription: true,
							withTechnology: true,
							withLocation: true,
							withPeriode: true,
							withMissions: true,
						}
					},
				},
			],
			settings: {
				title: classiqueTokens.sectionTitle,
			},
		},
	},
};
