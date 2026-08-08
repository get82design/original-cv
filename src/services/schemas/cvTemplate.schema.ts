import z from "zod";

const baseModuleSchema = z.object({
	order: z.number().min(1),
	isActive: z.boolean(),
	title: z.string().min(1),
})

const sizeSelectSchema = z.enum(["xs", "sm", "md", "lg", "xl"])
const weightSelectSchema = z.enum(["xs", "sm", "md", "lg", "xl"])
const colorSelectSchema = z.enum(["primaryColor", "gray", "black", "white"])
const textAlignSchema = z.enum(["left", "center", "right", "justify"])

export const levelDisplaySchema = z.enum([
	"stars",
	"dots",
	"bars",
	"progress",
  ])


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

export const experienceContentSchema = z.object({
	title: baseSettingsSchema,
	company: baseSettingsSchema,
	periode: baseSettingsSchema,
	location: baseSettingsSchema,
	description: baseSettingsSchema,
	missions: baseSettingsSchema,
}).extend({
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

export const educationContentSchema = z.object({
	diplome: baseSettingsSchema,
	etablissement: baseSettingsSchema,
	year: baseSettingsSchema,
	ville: baseSettingsSchema,
}).extend({
	withYear: z.boolean().default(true),
	withVille: z.boolean().default(true),
	withEtablissement: z.boolean().default(true),
});

const educationModuleSchema = baseModuleSchema.extend({
	type: z.literal("education"),
	settings: z.object({
		title: baseSettingsSchema,
		content: educationContentSchema,
	}),
});

export const skillContentSchema = z.object({
	groupTitle: baseSettingsSchema,
	skills: baseSettingsSchema,
	design: levelDisplaySchema.default("stars"),
}).extend({
	withGroupTitle: z.boolean().default(true),
});

const skillModuleSchema = baseModuleSchema.extend({
	type: z.literal("skill"),
	settings: z.object({
		title: baseSettingsSchema,
		content: skillContentSchema,
	}),
});

export const languageContentSchema = z.object({
	language: baseSettingsSchema,
}).extend({
	design: levelDisplaySchema.default("stars"),
});

const languageModulesSchema = baseModuleSchema.extend({
	type: z.literal("language"),
	settings: z.object({
		title: baseSettingsSchema,
		content: languageContentSchema,
	}),
});

export const projectContentSchema = z.object({
	title: baseSettingsSchema,
	description: baseSettingsSchema,
	location: baseSettingsSchema,
	periode: baseSettingsSchema,
	technology: baseSettingsSchema,
	missions: baseSettingsSchema,
}).extend({
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

export const socialMediaContentSchema = z.object({
	socialNetwork: baseSettingsSchema,
	username: baseSettingsSchema,
}).extend({
	withSocialNetwork: z.boolean().default(true),
	withUsername: z.boolean().default(true),
	withIcon: z.boolean().default(true),
	iconColor: colorSelectSchema.optional(),
});

const socialMediaModuleSchema = baseModuleSchema.extend({
	type: z.literal("socialMedia"),
	settings: z.object({
		title: baseSettingsSchema,
		content: socialMediaContentSchema,
	}),
});

// modules du seed encore sans settings détaillés //! à virer après
const pendingModuleSchema = baseModuleSchema.extend({
	type: z.enum(["strength", "volunteering", "publication", "certification", "prize", "philosophy", "passion", "formation", "expertise", "competence", "achievement"]),
	settings: z
	  .object({
		title: baseSettingsSchema,
		content: z.record(z.string(), baseSettingsSchema),
	  })
	  .optional(),
});

export const templateModuleSchema = z.discriminatedUnion("type", [
	descriptionModuleSchema,
	experienceModuleSchema,
	educationModuleSchema,
	skillModuleSchema,
	languageModulesSchema,
	projectModuleSchema,
	socialMediaModuleSchema,
	pendingModuleSchema,
]);

export const templateModulesSchema = z.array(templateModuleSchema);

const elmSizeSchema = z.enum(["sm", "md", "lg"]);

export const templateLayoutSchema = z.object({
	columns: z.number().min(1),
	marge: elmSizeSchema,
	space: elmSizeSchema,
	withPhoto: z.boolean(),
	stylePhoto: z.enum(['circle', 'flat']).default("circle"),
    listStyle: z.enum(['none', 'line', 'point']).default("none"),
	titleSection: z.object({
		textTransform: z.enum(["capitalize", "uppercase"]).default("capitalize"),
		withIcon: z.boolean().default(false),
		iconStyle: z.enum(['icon', 'flat', 'rounded']).default("icon"),
		iconColor: colorSelectSchema.optional(),
		withLigneDessous: z.boolean().default(false),
		withLigneDessus: z.boolean().default(false),
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
})

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
	components: z.object({
		sectionHeader: z.enum(['HeaderOne', 'HeaderTwo', 'HeaderThree']),
		sectionExperience: z.object({
			component:z.enum(['SectionExperienceOne', 'SectionExperienceTwo']),
		    miniature: z.enum(['MiniExperienceOne']),
			Label: z.string().min(1),
			icon: z.enum(['BsListCheck']),
		}),
		sectionDescription: z.object({
			component: z.enum(['SectionDescriptionOne', 'SectionDescriptionTwo']),
			miniature: z.enum(['MiniDescriptionOne']),
			Label: z.string().min(1),
			icon: z.enum(['BsPerson']),
		}),
		sectionEducation: z.object({
			component: z.enum(['SectionEducationOne', 'SectionEducationTwo']),
			miniature: z.enum(['MiniEducationOne']),
			Label: z.string().min(1),
			icon: z.enum(['MdSchool']),
		}),
		sectionSkill: z.object({
			component: z.enum(['SectionSkillOne', 'SectionSkillTwo']),
			miniature: z.enum(['MiniSkillOne']),
			Label: z.string().min(1),
			icon: z.enum(['MdTag']),
		}),
		sectionLanguage: z.object({
			component: z.enum(['SectionLanguageOne', 'SectionLanguageTwo']),
			miniature: z.enum(['MiniLanguageOne']),
			Label: z.string().min(1),
			icon: z.enum(['MdLanguage']),
		}),
		sectionProject: z.object({
			component: z.enum(['SectionProjectOne', 'SectionProjectTwo']),
			miniature: z.enum(['MiniProjectOne']),
			Label: z.string().min(1),
			icon: z.enum(['GoProject']),
		}),
		sectionSocialMedia: z.object({
			component: z.enum(['SectionSocialMediaOne', 'SectionSocialMediaTwo']),
			miniature: z.enum(['MiniSocialMediaOne']),
			Label: z.string().min(1),
			icon: z.enum(['FaGlobe']),
		}),
	}).optional(),
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
export type SocialMediaContentSettings = z.infer<typeof socialMediaContentSchema>;