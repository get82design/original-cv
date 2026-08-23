import z from "zod";

const baseModuleSchema = z.object({
	column: z.number().int().min(0).default(0),
	order: z.number().min(1),
	isActive: z.boolean(),
	title: z.string().min(1),
});

const sizeSelectSchema = z.enum(["xs", "sm", "md", "lg", "xl"]);
const weightSelectSchema = z.enum(["xs", "sm", "md", "lg", "xl"]);
const colorSelectSchema = z.enum(["primaryColor", "gray", "black", "white"]);
const textAlignSchema = z.enum(["left", "center", "right", "justify"]);

export const levelDisplaySchema = z.enum(["stars", "dots", "bars", "progress"]);
export const tagDisplaySchema = z.enum([
	"tag",
	"border",
	"none",
	"hashtag",
]);

export const baseSettingsSchema = z.object({
	sizeModel: z.string().min(1),
	weightModel: z.number().min(1),
	colorSelect: colorSelectSchema,
	sizeSelect: sizeSelectSchema,
	weightSelect: weightSelectSchema,
	withPrimaryColor: z.boolean(),
	textAlign: textAlignSchema.optional(),
});

// --- modules discriminés ---
const descriptionContentSchema = z.object({
	description: baseSettingsSchema,
});

const descriptionModuleSchema = baseModuleSchema.extend({
	type: z.literal("description"),
	settings: z.object({
		title: baseSettingsSchema,
		content: descriptionContentSchema,
	}),
});

export const philosophyContentSchema = z
	.object({
		citation: baseSettingsSchema,
		author: baseSettingsSchema,
	})
	.extend({
		withAuthor: z.boolean().default(true),
	});

const philosophyModuleSchema = baseModuleSchema.extend({
	type: z.literal("philosophy"),
	settings: z.object({
		title: baseSettingsSchema,
		content: philosophyContentSchema,
	}),
});

export const experienceContentSchema = z
	.object({
		title: baseSettingsSchema,
		company: baseSettingsSchema,
		periode: baseSettingsSchema,
		location: baseSettingsSchema,
		description: baseSettingsSchema,
		missions: baseSettingsSchema,
	})
	.extend({
		withDescription: z.boolean().default(true),
		withListMissions: z.boolean().default(true),
		withLocation: z.boolean().default(true),
		withPeriode: z.boolean().default(true),
		withTitle: z.boolean().default(true),
		withCompany: z.boolean().default(true),
	});

const experienceModuleSchema = baseModuleSchema.extend({
	type: z.literal("experience"),
	settings: z.object({
		title: baseSettingsSchema,
		content: experienceContentSchema,
	}),
});

export const educationContentSchema = z
	.object({
		diplome: baseSettingsSchema,
		etablissement: baseSettingsSchema,
		year: baseSettingsSchema,
		ville: baseSettingsSchema,
	})
	.extend({
		withYear: z.boolean().default(true),
		withVille: z.boolean().default(true),
		withEtablissement: z.boolean().default(true),
		columns: z.union([
			z.literal(1), z.literal(2), z.literal(3), z.literal(4),
		]).default(1),
	});

const educationModuleSchema = baseModuleSchema.extend({
	type: z.literal("education"),
	settings: z.object({
		title: baseSettingsSchema,
		content: educationContentSchema,
	}),
});

export const skillContentSchema = z
	.object({
		groupTitle: baseSettingsSchema,
		skills: baseSettingsSchema,
		design: levelDisplaySchema.default("stars"),
	})
	.extend({
		withGroupTitle: z.boolean().default(true),
		groupColumns: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(1),
		itemColumns: z.union([
		z.literal(1), z.literal(2), z.literal(3), z.literal(4),
		]).default(3),
	});

const skillModuleSchema = baseModuleSchema.extend({
	type: z.literal("skill"),
	settings: z.object({
		title: baseSettingsSchema,
		content: skillContentSchema,
	}),
});

export const competenceContentSchema = z
	.object({
		groupTitle: baseSettingsSchema,
		competences: baseSettingsSchema,
	})
	.extend({
		withGroupTitle: z.boolean().default(true),
		columns: z.union([
			z.literal(1), z.literal(2), z.literal(3), z.literal(4),
		  ]).default(1),
	});

const competenceModuleSchema = baseModuleSchema.extend({
	type: z.literal("competence"),
	settings: z.object({
		title: baseSettingsSchema,
		content: competenceContentSchema,
	}),
});

export const tagContentSchema = z
	.object({
		groupTitle: baseSettingsSchema,
		tags: baseSettingsSchema,
	})
	.extend({
		withGroupTitle: z.boolean().default(true),
		design: tagDisplaySchema.default("tag"),
	});

const tagModuleSchema = baseModuleSchema.extend({
	type: z.literal("tag"),
	settings: z.object({
		title: baseSettingsSchema,
		content: tagContentSchema,
	}),
});

export const languageContentSchema = z
	.object({
		language: baseSettingsSchema,
	})
	.extend({
		design: levelDisplaySchema.default("stars"),
		columns: z.union([
			z.literal(1), z.literal(2), z.literal(3), z.literal(4),
		  ]).default(3),
	});

const languageModulesSchema = baseModuleSchema.extend({
	type: z.literal("language"),
	settings: z.object({
		title: baseSettingsSchema,
		content: languageContentSchema,
	}),
});

export const projectContentSchema = z
	.object({
		title: baseSettingsSchema,
		description: baseSettingsSchema,
		location: baseSettingsSchema,
		periode: baseSettingsSchema,
		technology: baseSettingsSchema,
		missions: baseSettingsSchema,
	})
	.extend({
		withDescription: z.boolean().default(true),
		withLocation: z.boolean().default(true),
		withPeriode: z.boolean().default(true),
		withTechnology: z.boolean().default(true),
		withMissions: z.boolean().default(true),
		withTitle: z.boolean().default(true),
	});

const projectModuleSchema = baseModuleSchema.extend({
	type: z.literal("project"),
	settings: z.object({
		title: baseSettingsSchema,
		content: projectContentSchema,
	}),
});

export const socialMediaContentSchema = z
	.object({
		socialNetwork: baseSettingsSchema,
		username: baseSettingsSchema,
	})
	.extend({
		withSocialNetwork: z.boolean().default(true),
		withUsername: z.boolean().default(true),
		withIcon: z.boolean().default(true),
		iconColor: colorSelectSchema.optional(),
		columns: z.union([
			z.literal(1), z.literal(2), z.literal(3), z.literal(4),
		]).default(3),
	});

const socialMediaModuleSchema = baseModuleSchema.extend({
	type: z.literal("socialMedia"),
	settings: z.object({
		title: baseSettingsSchema,
		content: socialMediaContentSchema,
	}),
});

export const strengthContentSchema = z
	.object({
		strength: baseSettingsSchema,
		description: baseSettingsSchema,
	})
	.extend({
		withStrength: z.boolean().default(true),
		withIcon: z.boolean().default(true),
		iconColor: colorSelectSchema.optional(),
		withDescription: z.boolean().default(true),
		columns: z.union([
			z.literal(1), z.literal(2), z.literal(3), z.literal(4),
		]).default(1),
	});

const strengthModuleSchema = baseModuleSchema.extend({
	type: z.literal("strength"),
	settings: z.object({
		title: baseSettingsSchema,
		content: strengthContentSchema,
	}),
});

export const formationContentSchema = z
	.object({
		title: baseSettingsSchema,
		organismeFormation: baseSettingsSchema,
		periode: baseSettingsSchema,
		status: baseSettingsSchema,
	})
	.extend({
		withTitle: z.boolean().default(true),
		withOrganismeFormation: z.boolean().default(true),
		withPeriode: z.boolean().default(true),
		withStatus: z.boolean().default(true),
		columns: z.union([
			z.literal(1), z.literal(2), z.literal(3), z.literal(4),
		]).default(2),
	});

const formationModuleSchema = baseModuleSchema.extend({
	type: z.literal("formation"),
	settings: z.object({
		title: baseSettingsSchema,
		content: formationContentSchema,
	}),
});

export const certificationContentSchema = z
	.object({
		title: baseSettingsSchema,
		organismeCertification: baseSettingsSchema,
	})
	.extend({
		withTitle: z.boolean().default(true),
		withOrganismeCertification: z.boolean().default(true),
		columns: z.union([
			z.literal(1), z.literal(2), z.literal(3), z.literal(4),
		]).default(2),
	});

const certificationModuleSchema = baseModuleSchema.extend({
	type: z.literal("certification"),
	settings: z.object({
		title: baseSettingsSchema,
		content: certificationContentSchema,
	}),
});

export const prizeContentSchema = z
	.object({
		title: baseSettingsSchema,
		domaine: baseSettingsSchema,
		icon: z.string().optional(),
	})
	.extend({
		withTitle: z.boolean().default(true),
		withDomain: z.boolean().default(true),
		withIcon: z.boolean().default(true),
		iconColor: colorSelectSchema.optional(),
		columns: z.union([
			z.literal(1), z.literal(2), z.literal(3), z.literal(4),
		]).default(3),
	});

const prizeModuleSchema = baseModuleSchema.extend({
	type: z.literal("prize"),
	settings: z.object({
		title: baseSettingsSchema,
		content: prizeContentSchema,
	}),
});

export const passionContentSchema = z
	.object({
		passion: baseSettingsSchema,
	})
	.extend({
		withIcon: z.boolean().default(true),
		iconColor: colorSelectSchema.optional(),
		columns: z.union([
			z.literal(1), z.literal(2), z.literal(3), z.literal(4),
		  ]).default(3),
	});

const passionModuleSchema = baseModuleSchema.extend({
	type: z.literal("passion"),
	settings: z.object({
		title: baseSettingsSchema,
		content: passionContentSchema,
	}),
});

export const expertiseContentSchema = z
	.object({
		title: baseSettingsSchema,
	})
	.extend({
		design: levelDisplaySchema.default("stars"),
		columns: z.union([
			z.literal(1), z.literal(2), z.literal(3), z.literal(4),
		]).default(3),
	});

const expertiseModuleSchema = baseModuleSchema.extend({
	type: z.literal("expertise"),
	settings: z.object({
		title: baseSettingsSchema,
		content: expertiseContentSchema,
	}),
});

export const volunteeringContentSchema = z
	.object({
		title: baseSettingsSchema,
		organisation: baseSettingsSchema,
		description: baseSettingsSchema,
		periode: baseSettingsSchema,
		location: baseSettingsSchema,
		missions: baseSettingsSchema,
	})
	.extend({
		withTitle: z.boolean().default(true),
		withOrganisation: z.boolean().default(true),
		withDescription: z.boolean().default(true),
		withPeriode: z.boolean().default(true),
		withLocation: z.boolean().default(true),
		withMissions: z.boolean().default(true),
	});

const volunteeringModuleSchema = baseModuleSchema.extend({
	type: z.literal("volunteering"),
	settings: z.object({
		title: baseSettingsSchema,
		content: volunteeringContentSchema,
	}),
});

export const publicationContentSchema = z
	.object({
		title: baseSettingsSchema,
		periode: baseSettingsSchema,
		journalName: baseSettingsSchema,
		description: baseSettingsSchema,
		url: baseSettingsSchema,
	})
	.extend({
		withTitle: z.boolean().default(true),
		withDescription: z.boolean().default(true),
		withJournalName: z.boolean().default(true),
		withPeriode: z.boolean().default(true),
		withUrl: z.boolean().default(true),
	});

const publicationModuleSchema = baseModuleSchema.extend({
	type: z.literal("publication"),
	settings: z.object({
		title: baseSettingsSchema,
		content: publicationContentSchema,
	}),
});

export const achievementContentSchema = z
	.object({
		title: baseSettingsSchema,
		description: baseSettingsSchema,
		year: baseSettingsSchema,
		technology: baseSettingsSchema,
	})
	.extend({
		withTitle: z.boolean().default(true),
		withDescription: z.boolean().default(true),
		withYear: z.boolean().default(true),
		withTechnology: z.boolean().default(true),
	});

const achievementModuleSchema = baseModuleSchema.extend({
	type: z.literal("achievement"),
	settings: z.object({
		title: baseSettingsSchema,
		content: achievementContentSchema,
	}),
});

// modules du seed encore sans settings détaillés //! à virer après
// const pendingModuleSchema = baseModuleSchema.extend({
// 	type: z.enum(["competence"]),
// 	settings: z
// 		.object({
// 			title: baseSettingsSchema,
// 			content: z.record(z.string(), baseSettingsSchema),
// 		})
// 		.optional(),
// });

export const templateModuleSchema = z.discriminatedUnion("type", [
	descriptionModuleSchema,
	philosophyModuleSchema,
	experienceModuleSchema,
	educationModuleSchema,
	skillModuleSchema,
	languageModulesSchema,
	projectModuleSchema,
	socialMediaModuleSchema,
	strengthModuleSchema,
	formationModuleSchema,
	certificationModuleSchema,
	prizeModuleSchema,
	passionModuleSchema,
	expertiseModuleSchema,
	volunteeringModuleSchema,
	publicationModuleSchema,
	achievementModuleSchema,
	competenceModuleSchema,
	tagModuleSchema,
	// pendingModuleSchema,
]);

export const templateModulesSchema = z.array(templateModuleSchema);

const elmSizeSchema = z.enum(["sm", "md", "lg"]);

const fontSlugSchema = z.enum(["inter", "lora", "sourceSans", "playfair"]);

export const templateLayoutSchema = z.object({
	columns: z.number().min(1),
	marge: elmSizeSchema,
	space: elmSizeSchema,
	withPhoto: z.boolean(),
	typography: z
		.object({
			fontFamily: fontSlugSchema.default("inter"), // niveau 1 : choix user (plus tard)
			roles: z
				.object({
					body: fontSlugSchema.default("inter"),
					headerTitle: fontSlugSchema.default("inter"),
					headerSubTitle: fontSlugSchema.default("inter"),
					sectionTitle: fontSlugSchema.default("inter"),
					accent: fontSlugSchema.optional(),
				})
				.default({
					body: "inter",
					headerTitle: "inter",
					headerSubTitle: "inter",
					sectionTitle: "inter",
				}),
		})
		.default({
			fontFamily: "inter",
			roles: {
				body: "inter",
				headerTitle: "inter",
				headerSubTitle: "inter",
				sectionTitle: "inter",
			},
		}),
	stylePhoto: z.enum(["circle", "flat"]).default("circle"),
	listStyle: z.enum(["none", "line", "point"]).default("none"),
	titleSection: z.object({
		textTransform: z.enum(["capitalize", "uppercase"]).default("capitalize"),
		withIcon: z.boolean().default(false),
		iconStyle: z.enum(["icon", "flat", "rounded"]).default("icon"),
		iconColor: colorSelectSchema.optional(),
		withLigneDessous: z.boolean().default(false),
		withLigneDessus: z.boolean().default(false),
		lineWeight: z.enum(["sm", "md", "lg"]).default("sm"),
		bottomSpaceLine: z.enum(["sm", "md", "lg"]).default("sm"),
		topSpaceLine: z.enum(["sm", "md", "lg"]).default("sm"),
		bgColor: colorSelectSchema.optional(),
		textAlign: z.enum(["left", "center", "right", "justify"]).default("left"),
	}),
});

export const templateHeaderSettingsSchema = z.object({
	title: z.object({
		...baseSettingsSchema.shape,
	}),
	subTitle: z.object({
		...baseSettingsSchema.shape,
	}),
	nom: z.object({
		...baseSettingsSchema.shape,
	}),
	prenom: z.object({
		...baseSettingsSchema.shape,
	}),
	content: z.object({
		...baseSettingsSchema.shape,
	}),
});

export const templateStructureSchema = z.object({
	// sections: z.array(z.string().min(1)),
	layout: templateLayoutSchema,
	header: z.object({
		settings: z.object({
			...templateHeaderSettingsSchema.shape,
		}),
	}),
	modules: templateModulesSchema,
});

export const templateDefaultStylesSchema = z.object({
	primaryColor: z.object({
		name: z.string().min(1),
		primary: z.string().optional().nullable(),
	}),
	slugTemplate: z.string().min(1),
	components: z
		.object({
			pageLayout: z
				.enum([
					"OneColumnModel",
					"OneColumnWithLeftBar",
					"TwoColumnCenter",
					"TwoColumnLeftBar",
					"TwoColumnRightBar",
				])
				.default("OneColumnModel"),
			sectionHeader: z.enum(["HeaderOne", "HeaderTwo", "HeaderThree"]),
			sectionExperience: z.object({
				component: z.enum(["SectionExperienceOne", "SectionExperienceTwo"]),
				miniature: z.enum(["MiniExperienceOne"]),
				item: z.enum(["CardExperienceOne"]).default("CardExperienceOne"),
				Label: z.string().min(1),
				icon: z.enum(["BsListCheck"]),
			}),
			sectionDescription: z.object({
				component: z.enum(["SectionDescriptionOne", "SectionDescriptionTwo"]),
				miniature: z.enum(["MiniDescriptionOne"]),
				Label: z.string().min(1),
				icon: z.enum(["BsPerson"]),
			}),
			sectionEducation: z.object({
				component: z.enum(["SectionEducationOne", "SectionEducationTwo"]),
				miniature: z.enum(["MiniEducationOne"]),
				item: z.enum(["CardEducationOne"]).default("CardEducationOne"),
				Label: z.string().min(1),
				icon: z.enum(["MdSchool"]),
			}),
			sectionSkill: z.object({
				component: z.enum(["SectionSkillOne", "SectionSkillTwo"]),
				miniature: z.enum(["MiniSkillOne"]),
				item: z.enum(["CardSkillOne"]).default("CardSkillOne"),
				group: z.enum(["CardGroupSkillOne"]).default("CardGroupSkillOne"),
				Label: z.string().min(1),
				icon: z.enum(["MdTag"]),
			}),
			sectionLanguage: z.object({
				component: z.enum(["SectionLanguageOne", "SectionLanguageTwo"]),
				miniature: z.enum(["MiniLanguageOne"]),
				item: z.enum(["CardLanguageOne"]).default("CardLanguageOne"),
				Label: z.string().min(1),
				icon: z.enum(["MdLanguage"]),
			}),
			sectionProject: z.object({
				component: z.enum(["SectionProjectOne", "SectionProjectTwo"]),
				miniature: z.enum(["MiniProjectOne"]),
				item: z.enum(["CardProjectOne"]).default("CardProjectOne"),
				Label: z.string().min(1),
				icon: z.enum(["GoProject"]),
			}),
			sectionSocialMedia: z.object({
				component: z.enum(["SectionSocialMediaOne", "SectionSocialMediaTwo"]),
				miniature: z.enum(["MiniSocialMediaOne"]),
				item: z.enum(["CardSocialMediaOne"]).default("CardSocialMediaOne"),
				Label: z.string().min(1),
				icon: z.enum(["FaGlobe"]),
			}),
			sectionStrength: z.object({
				component: z.enum(["SectionStrengthOne", "SectionStrengthTwo"]),
				miniature: z.enum(["MiniStrengthOne"]),
				item: z.enum(["CardStrengthOne"]).default("CardStrengthOne"),
				Label: z.string().min(1),
				icon: z.enum(["FaThumbsUp"]),
			}),
			sectionPhilosophy: z.object({
				component: z.enum(["SectionPhilosophyOne", "SectionPhilosophyTwo"]),
				miniature: z.enum(["MiniPhilosophyOne"]),
				Label: z.string().min(1),
				icon: z.enum(["FaQuoteLeft"]),
			}),
			sectionFormation: z.object({
				component: z.enum(["SectionFormationOne", "SectionFormationTwo"]),
				miniature: z.enum(["MiniFormationOne"]),
				item: z.enum(["CardFormationOne"]).default("CardFormationOne"),
				Label: z.string().min(1),
				icon: z.enum(["GiLevelTwo"]),
			}),
			sectionCertification: z.object({
				component: z.enum([
					"SectionCertificationOne",
					"SectionCertificationTwo",
				]),
				miniature: z.enum(["MiniCertificationOne"]),
				item: z.enum(["CardCertificationOne"]).default("CardCertificationOne"),
				Label: z.string().min(1),
				icon: z.enum(["PiCertificate"]),
			}),
			sectionPrize: z.object({
				component: z.enum(["SectionPrizeOne", "SectionPrizeTwo"]),
				miniature: z.enum(["MiniPrizeOne"]),
				item: z.enum(["CardPrizeOne"]).default("CardPrizeOne"),
				Label: z.string().min(1),
				icon: z.enum(["PiMedal"]),
			}),
			sectionPassion: z.object({
				component: z.enum(["SectionPassionOne", "SectionPassionTwo"]),
				miniature: z.enum(["MiniPassionOne"]),
				item: z.enum(["CardPassionOne"]).default("CardPassionOne"),
				Label: z.string().min(1),
				icon: z.enum(["BsBalloonHeartFill"]),
			}),
			sectionExpertise: z.object({
				component: z.enum(["SectionExpertiseOne", "SectionExpertiseTwo"]),
				miniature: z.enum(["MiniExpertiseOne"]),
				item: z.enum(["CardExpertiseOne"]).default("CardExpertiseOne"),
				Label: z.string().min(1),
				icon: z.enum(["RxMixerVertical"]),
			}),
			sectionVolunteering: z.object({
				component: z.enum(["SectionVolunteeringOne", "SectionVolunteeringTwo"]),
				miniature: z.enum(["MiniVolunteeringOne"]),
				item: z.enum(["CardVolunteeringOne"]).default("CardVolunteeringOne"),
				Label: z.string().min(1),
				icon: z.enum(["MdOutlineVolunteerActivism"]),
			}),
			sectionPublication: z.object({
				component: z.enum(["SectionPublicationOne", "SectionPublicationTwo"]),
				miniature: z.enum(["MiniPublicationOne"]),
				item: z.enum(["CardPublicationOne"]).default("CardPublicationOne"),
				Label: z.string().min(1),
				icon: z.enum(["MdArticle"]),
			}),
			sectionAchievement: z.object({
				component: z.enum(["SectionAchievementOne", "SectionAchievementTwo"]),
				miniature: z.enum(["MiniAchievementOne"]),
				item: z.enum(["CardAchievementOne"]).default("CardAchievementOne"),
				Label: z.string().min(1),
				icon: z.enum(["GiAchievement"]),
			}),
			sectionCompetence: z.object({
				component: z.enum(["SectionCompetenceOne", "SectionCompetenceTwo"]),
				miniature: z.enum(["MiniCompetenceOne"]),
				item: z.enum(["CardCompetenceOne"]).default("CardCompetenceOne"),
				group: z
					.enum(["CardGroupCompetenceOne"])
					.default("CardGroupCompetenceOne"),
				Label: z.string().min(1),
				icon: z.enum(["MdTag"]),
			}),
			sectionTag: z.object({
				component: z.enum(["SectionTagOne", "SectionTagTwo"]),
				miniature: z.enum(["MiniTagOne"]),
				item: z.enum(["CardTagOne"]).default("CardTagOne"),
				group: z.enum(["CardGroupTagOne"]).default("CardGroupTagOne"),
				Label: z.string().min(1),
				icon: z.enum(["MdTag"]),
			}),
		})
		.optional(),
});

export const createCvTemplateSchema = z.object({
	name: z.string().min(1),
	structure: templateStructureSchema,
	defaultStyles: templateDefaultStylesSchema, // comme dans Prisma / ton DTO actuel
});

export const updateCvTemplateSchema = createCvTemplateSchema.partial();

export type CreateCvTemplateInput = z.infer<typeof createCvTemplateSchema>;
export type UpdateCvTemplateInput = z.infer<typeof updateCvTemplateSchema>;
export type TemplateModule = z.infer<typeof templateModuleSchema>;
export type TemplateLayout = z.infer<typeof templateLayoutSchema>;
export type ElmSize = z.infer<typeof elmSizeSchema>;
export type BaseTextSettings = z.infer<typeof baseSettingsSchema>;
export type TemplateDefaultStyles = z.infer<typeof templateDefaultStylesSchema>;
export type ExperienceContentSettings = z.infer<typeof experienceContentSchema>;
export type EducationContentSettings = z.infer<typeof educationContentSchema>;
export type SkillContentSettings = z.infer<typeof skillContentSchema>;
export type LanguageContentSettings = z.infer<typeof languageContentSchema>;
export type ProjectContentSettings = z.infer<typeof projectContentSchema>;
export type SocialMediaContentSettings = z.infer<
	typeof socialMediaContentSchema
>;
export type StrengthContentSettings = z.infer<typeof strengthContentSchema>;
export type PhilosophyContentSettings = z.infer<typeof philosophyContentSchema>;
export type FormationContentSettings = z.infer<typeof formationContentSchema>;
export type CertificationContentSettings = z.infer<
	typeof certificationContentSchema
>;
export type PrizeContentSettings = z.infer<typeof prizeContentSchema>;
export type PassionContentSettings = z.infer<typeof passionContentSchema>;
export type ExpertiseContentSettings = z.infer<typeof expertiseContentSchema>;
export type VolunteeringContentSettings = z.infer<
	typeof volunteeringContentSchema
>;
export type PublicationContentSettings = z.infer<
	typeof publicationContentSchema
>;
export type AchievementContentSettings = z.infer<
	typeof achievementContentSchema
>;
export type CompetenceContentSettings = z.infer<typeof competenceContentSchema>;
export type TagContentSettings = z.infer<typeof tagContentSchema>;
