import { tagService, TagService } from "../../src/services/commons/tagService";
import { CvSaveService } from "../../src/services/cv/cvSaveService";
import { stockholmTokens } from "./themeTokens";
import type { ThemeTokens } from "./themeTokens";
import {
    buildAchievementModule,
    buildCertificationModule,
    buildCompetenceModule,
	buildDescriptionModule,
	buildEducationModule,
	buildExperienceModule,
	buildExpertiseModule,
	buildFormationModule,
	buildLanguageModule,
	buildPassionModule,
	buildPhilosophyModule,
	buildPrizeModule,
	buildProjectModule,
	buildPublicationModule,
	buildSkillModule,
	buildSocialMediaModule,
	buildStrengthModule,
	buildTagModule,
    buildVolunteeringModule,
} from "./buildTemplateModules";
import { CompetenceService } from "@/services/commons/competenceService";
import { stockholm } from "./cv-template/one-column/stockholm";
import type { TemplateDefaultStyles, TemplateLayout } from "@/services/schemas/cvTemplate.schema";

/** Nettoie textAlign: null → undefined pour matcher le schéma Zod */
function sectionTitle(t: ThemeTokens) {
	const { textAlign, ...rest } = t.sectionTitle;
	return { ...rest, ...(textAlign != null ? { textAlign } : {}) };
}

const competenceService = new CompetenceService();
const cvSaveService = new CvSaveService();

/** Clara Delorme — Conseillère de Vente */
export async function buildCvClaraDelorme(userId: string, templateId: string) {
	// 1. Créer les tags (idempotent : TagService retourne l'existant si déjà présent)
	const hardCompNames = [
		"Merchandising visuel",
		"Gestion de caisse (Cegid)",
		"Gestion de stocks & inventaires",
		"Vente conseil B2C",
		"Fidélisation CRM",
	];
	const softCompNames = [
		"Écoute active",
		"Empathie",
		"Gestion du stress",
		"Esprit d'équipe",
		"Négociation",
	];

	const hardComps = await Promise.all(
		hardCompNames.map((name) => competenceService.create({ name })),
	);
	const softComps = await Promise.all(
		softCompNames.map((name) => competenceService.create({ name })),
	);
    const hardTags = await Promise.all(
		hardCompNames.map((name) => tagService.create({ name })),
	);
	const softTags = await Promise.all(
		softCompNames.map((name) => tagService.create({ name })),
	);

	// 2. Modules du CV (basés sur le template Classique, on active ce qu'on renseigne)
	const modules = [
		{ ...buildDescriptionModule(stockholmTokens, { order: 1, title: "A propos de moi" }), column: 0 },
		{ ...buildExperienceModule(stockholmTokens, { order: 2, title: "Expériences" }), column: 0 },
		{ ...buildEducationModule(stockholmTokens, { order: 3, title: "Formations", columns: 2 }), column: 0 },
		{ ...buildLanguageModule(stockholmTokens, { order: 4, title: "Langues", design: "stars" as const, columns: 3 }), column: 0 },
        { ...buildStrengthModule(stockholmTokens, { order: 5, title: "Atouts", isActive: true, columns: 2 }), column: 0 },
		{ ...buildCompetenceModule(stockholmTokens, { order: 6  , title: "Compétences", isActive: true, columns: 2 }), column: 0 },
		{ ...buildPassionModule(stockholmTokens, { order: 7, title: "Centres d'intérêt", isActive: true, columns: 3 }), column: 0 },
        { ...buildTagModule(stockholmTokens, { order: 8, title: "Tags", isActive: false }), column: 0 },
        { ...buildCertificationModule(stockholmTokens, { order: 9, title: "Certifications", isActive: false }), column: 0 },
        { ...buildPrizeModule(stockholmTokens, { order: 10, title: "Prix", isActive: false }), column: 0 },
        { ...buildPublicationModule(stockholmTokens, { order: 11, title: "Publications", isActive: false }), column: 0 },
        { ...buildAchievementModule(stockholmTokens, { order: 12, title: "Réalisations", isActive: false }), column: 0 },
        { ...buildVolunteeringModule(stockholmTokens, { order: 13, title: "Volontariat", isActive: false }), column: 0 },
        { ...buildExpertiseModule(stockholmTokens, { order: 14, title: "Expertises", isActive: false }), column: 0 },
        { ...buildFormationModule(stockholmTokens, { order: 15, title: "Formations", isActive: false }), column: 0 },
        { ...buildSkillModule(stockholmTokens, { order: 16, title: "Skills", isActive: false }), column: 0 },
        { ...buildSocialMediaModule(stockholmTokens, { order: 17, title: "Social Media", isActive: false }), column: 0 },
        { ...buildPhilosophyModule(stockholmTokens, { order: 18, title: "Ma philosophie", isActive: false }), column: 0 },
        { ...buildProjectModule(stockholmTokens, { order: 19, title: "Projects", isActive: false }), column: 0 },
	];

	// 3. Payload CvSaveInput
	await cvSaveService.save(userId, {
		templateId,
		title: "CV - Clara Delorme",
        layoutGeneral: {
            layout: stockholm.structure.layout as TemplateLayout,       // sharedLayout + overrides
            defaultStyles: stockholm.defaultStyles as TemplateDefaultStyles,   // déjà complet
          },
		datas: {
			header: {
                title: "Clara Delorme",
				subtitle: "Conseillère de Vente & Customer Experience Specialist",
				prenom: "Clara",
				nom: "Delorme",
				email: "clara.delorme@email.com",
				phone: "06 78 90 12 34",
				location: "Paris, France",
                settings: stockholm.structure.header.settings,
			},
			description: {
				content: {
					description:
						"Professionnelle du retail passionnée par la culture de marque et la psychologie du consommateur. Spécialiste de la vente conseil à forte valeur ajoutée, j’associe une excellente maîtrise des outils phygitaux (CRM, caisse mobile, e-reservation) à un sens aigu du merchandising visuel. Mon objectif est d'intégrer une maison exigeante où l'expérience client est placée au cœur de la stratégie.",
				},
				settings: {
					title: sectionTitle(stockholmTokens),
					content: { ...sectionTitle(stockholmTokens), textAlign: "justify" as const },
				},
			},
            philosophy: {
                content: {
                    citation: "Vendre ne consiste pas à pousser un produit, mais à créer une rencontre mémorable. Chaque client qui franchit la porte doit repartir enrichi d’une expérience fluide, humaine et sur-mesure. La fidélité ne s’achète pas, elle se cultive par la confiance et l'écoute active.",
                },
                settings: {
                    title: sectionTitle(stockholmTokens),
                    content: { 
                        withAuthor: false,
                        citation: { ...stockholmTokens.body, textAlign: "justify" as const },
                        author: { ...stockholmTokens.meta, textAlign: "right" as const }, 
                    },
                },
            },
			experience: {
				content: [
					{
						clientKey: "exp-1",
						order: 1,
						content: {
							title: "Senior Sales Assistant – Mode & Maison",
							company: "Boutique L'Élégance",
							location: "Paris",
							start: new Date("2023-01-01"),
							end: new Date("2025-06-30"),
							missions: [
								{
									clientKey: "m1-1",
									content: {
										content:
											"Accueil, conseil personnalisé et accompagnement d'une clientèle internationale.",
									},
								},
								{
									clientKey: "m1-2",
									content: {
										content: "Réalisation du merchandising vitrine hebdomadaire.",
									},
								},
								{
									clientKey: "m1-3",
									content: {
										content:
											"Formation et intégration de 4 nouveaux vendeurs saisonniers.",
									},
								},
								{
									clientKey: "m1-4",
									content: {
										content:
											"+18% de ventes incitatives réalisées en 2024 ; 98% de satisfaction client sur les enquêtes Mystère.",
									},
								},
							],
							settings: {
								title: { ...stockholmTokens.itemTitle }, // ou body selon ton design
                                company: { ...stockholmTokens.meta, colorSelect: 'primaryColor' },
                                location: { ...stockholmTokens.meta, colorSelect: 'primaryColor' },
                                periode: { ...stockholmTokens.meta },
                                description: { ...stockholmTokens.body },
                                missions: { ...stockholmTokens.body },
                                withCompany: true,
                                withLocation: true,
                                withPeriode: true,
                                withListMissions: true,
                                withTitle: true,
                                withDescription: false,
							},
						},
					},
					{
						clientKey: "exp-2",
						order: 2,
						content: {
							title: "Vendeuse Polyvalente",
							company: "Retail Fast-Fashion",
							location: "Lyon",
							start: new Date("2021-09-01"),
							end: new Date("2023-01-01"),
							missions: [
								{
									clientKey: "m2-1",
									content: {
										content:
											"Gestion de la caisse, réassort en rayon et traitement des livraisons matinales.",
									},
								},
							],
							settings: {
								title: { ...stockholmTokens.itemTitle }, // ou body selon ton design
                                company: { ...stockholmTokens.meta, colorSelect: 'primaryColor' },
                                location: { ...stockholmTokens.meta, colorSelect: 'primaryColor' },
                                periode: { ...stockholmTokens.meta },
                                description: { ...stockholmTokens.body },
                                missions: { ...stockholmTokens.body },
                                withCompany: true,
                                withLocation: true,
                                withPeriode: true,
                                withListMissions: true,
                                withTitle: true,
                                withDescription: false,
							},
						},
					},
				],
				settings: { title: sectionTitle(stockholmTokens) },
			},
			education: {
				content: [
					{
						clientKey: "edu-1",
						order: 1,
						content: {
							title: "BTS Négociation et Digitalisation de la Relation Client",
							school: "NDRC",
                            city: "Paris",
							degree: "BTS",
							start: new Date("2019-09-01"),
							end: new Date("2021-06-30"),
                            settings: {
                                diplome: { ...stockholmTokens.itemTitle },
                                etablissement: { ...stockholmTokens.meta, colorSelect: 'gray' },
                                ville: { ...stockholmTokens.meta, colorSelect: 'gray' },
                                year: { ...stockholmTokens.meta },
                                withYear: true,
                                withEtablissement: true,
                                withVille: true,
                                columns: 2,
                            },
						},
					},
					{
						clientKey: "edu-2",
						order: 2,
						content: {
							title: "Bac STMG – Option Marketing",
							school: "Lycée La République",
							city: "Paris",
							degree: "Baccalauréat",
							start: new Date("2017-09-01"),
							end: new Date("2019-06-30"),
                            settings: {
                                diplome: { ...stockholmTokens.itemTitle },
                                etablissement: { ...stockholmTokens.meta, colorSelect: 'gray' },
                                ville: { ...stockholmTokens.meta, colorSelect: 'gray' },
                                year: { ...stockholmTokens.meta },
                                withYear: true,
                                withEtablissement: true,
                                withVille: true,
                                columns: 2,
                            },
						},
					},
				],
				settings: { title: sectionTitle(stockholmTokens) },
			},
			language: {
				content: [
					{
						clientKey: "lang-1",
						order: 1,
						content: { name: "Français", level: "Expert" as const },
					},
					{
						clientKey: "lang-2",
						order: 2,
						content: { name: "Anglais", level: "Senior" as const },
					},
					{
						clientKey: "lang-3",
						order: 3,
						content: { name: "Espagnol", level: "Intermédiaire" as const },
					},
				],
				settings: { title: sectionTitle(stockholmTokens) },
			},
			competenceGroup: {
                content: [
                  {
                    clientKey: "cg-hard",
                    order: 1,
                    content: {
                      title: "Hard Skills",
                      competences: hardComps.map((c, i) => ({
                        clientKey: `comp-hard-${i}`,
                        order: i + 1,
                        content: { competenceId: c.id, order: i + 1 },
                      })),
                      settings: {
                        groupTitle: { ...stockholmTokens.itemTitle, colorSelect: 'primaryColor', weightSelect: 'xl' },
                        competences: { ...stockholmTokens.body },
                        withGroupTitle: true,
                        columns: 2,
                      },
                    },
                  },
                  {
                    clientKey: "cg-soft",
                    order: 2,
                    content: {
                      title: "Soft Skills",
                      competences: softComps.map((c, i) => ({
                        clientKey: `comp-soft-${i}`,
                        order: i + 1,
                        content: { competenceId: c.id, order: i + 1 },
                      })),
                      settings: {
                        groupTitle: { ...stockholmTokens.itemTitle, colorSelect: 'primaryColor', weightSelect: 'xl' },
                        competences: { ...stockholmTokens.body },
                        withGroupTitle: true,
                        columns: 2,
                      },
                    },
                  },
                ],
                settings: { title: sectionTitle(stockholmTokens) },
            },
            tagGroup: {
                content: [
                  {
                    clientKey: "cg-hard",
                    order: 1,
                    content: {
                      title: "Hard Skills",
                      tags: hardTags.map((t, i) => ({
                        clientKey: `tag-hard-${i}`,
                        order: i + 1,
                        content: { tagId: t.id, order: i + 1 },
                      })),
                      settings: {
                        groupTitle: { ...stockholmTokens.itemTitle, colorSelect: 'black', weightSelect: 'xl' },
                        tags: { ...stockholmTokens.body },
                        withGroupTitle: true,
                        design: "border",
                      },
                    },
                  },
                  {
                    clientKey: "cg-soft",
                    order: 2,
                    content: {
                      title: "Soft Skills",
                      tags: softTags.map((t, i) => ({
                        clientKey: `tag-soft-${i}`,
                        order: i + 1,
                        content: { tagId: t.id, order: i + 1 },
                      })),
                      settings: {
                        groupTitle: { ...stockholmTokens.itemTitle, colorSelect: 'black', weightSelect: 'xl' },
                        tags: { ...stockholmTokens.body },
                        withGroupTitle: true,
                        design: "border",
                      },
                    },
                  },
                ],
                settings: { title: sectionTitle(stockholmTokens) },
            },
			passion: {
				content: [
					{
						clientKey: "passion-1",
						order: 1,
						content: { title: "Mode & seconde main", icon: "faTshirt" },
					},
					{
						clientKey: "passion-2",
						order: 2,
						content: {
							title: "Podcasts psychologie du consommateur",
							icon: "faHeadphones",
						},
					},
					{
						clientKey: "passion-3",
						order: 3,
						content: { title: "Running (semi-marathon)", icon: "faRunning" },
					},
				],
				settings: { title: sectionTitle(stockholmTokens) },
			},
            socialMedia: {
                content: [
                    {
                        clientKey: "social-1",
                        order: 1,
                        content: { socialNetwork: "Facebook", username: "clara.delorme", icon: "faFacebook", settings: {
                            socialNetwork: { ...stockholmTokens.itemTitle },
                            username: { ...stockholmTokens.meta },
                            withSocialNetwork: true,
                            withUsername: true,
                            withIcon: true,
                            iconColor: "primaryColor",
                            columns: 3,
                          }, },
                    },
                    {
                        clientKey: "social-2",
                        order: 2,
                        content: { socialNetwork: "LinkedIn", username: "clara.delorme", icon: "faLinkedin", settings: {
                            socialNetwork: { ...stockholmTokens.itemTitle },
                            username: { ...stockholmTokens.meta },
                            withSocialNetwork: true,
                            withUsername: true,
                            withIcon: true,
                            iconColor: "primaryColor",
                            columns: 3,
                          }, },
                    },
                    {
                        clientKey: "social-3",
                        order: 3,
                        content: { socialNetwork: "Instagram", username: "@clara.delorme75", icon: "faInstagram", settings: {
                            socialNetwork: { ...stockholmTokens.itemTitle },
                            username: { ...stockholmTokens.meta },
                            withSocialNetwork: true,
                            withUsername: true,
                            withIcon: true,
                            iconColor: "primaryColor",
                            columns: 3,
                          }, },
                    },
                ],
                settings: { title: sectionTitle(stockholmTokens) },
            },
            project: {
                content: [
                    {
                        clientKey: "projet-1",
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
                        },
                    },
                ],
                settings: { title: sectionTitle(stockholmTokens) },
            },
            strength: {
                content: [
                    {
                        clientKey: "strength-1",
                        order: 1,
                        content: { 
                            title: "Intelligence émotionnelle", 
                            description: "Capacité à décoder rapidement les attentes, hésitations et besoins non exprimés du client.",
                            icon: "faBrain"
                        }, 
                    },
                    {
                        clientKey: "strength-2",
                        order: 2,
                        content: { 
                            title: "Résilience & Gestion du stress", 
                            description: "Calme constant et efficacité préservée lors des pics de fréquentation (flux fêtes, soldes).",
                            icon: "faSeedling"
                        },
                    },
                    {
                        clientKey: "strength-3",
                        order: 3,
                        content: { 
                            title: "Esprit d'équipe & Leadership naturel", 
                            description: "Moteur de la motivation collective et facilitatrice de communication au sein de l'équipe.",
                            icon: "faHandsHelping"
                        },
                    },
                    {
                        clientKey: "strength-4",
                        order: 4,
                        content: { 
                            title: "Proactivité", 
                            description: "Force de proposition constante pour améliorer la présentation des rayons ou fluidifier l'organisation interne.",
                            icon: "faChartLine"
                        },
                    },
                ],
                settings: { title: sectionTitle(stockholmTokens) },
            },
		},
		modules,
	});
}
