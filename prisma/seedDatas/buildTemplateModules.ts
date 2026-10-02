import type {
	CertificationContentSettings,
	ColorSelect,
	CompetenceContentSettings,
	EducationContentSettings,
	ExpertiseContentSettings,
	FormationContentSettings,
	LanguageContentSettings,
	PassionContentSettings,
	PrizeContentSettings,
	SkillContentSettings,
	SocialMediaContentSettings,
	StrengthContentSettings,
	TagContentSettings,
} from "@/services/schemas/cvTemplate.schema";
import type { ThemeTokens } from "./themeTokens";

export function buildHeader(t: ThemeTokens) {
	return {
		settings: {
			title: t.headerTitle,
			subTitle: t.headerSubTitle,
			content: t.headerContent,
			nom: t.headerNom,
			prenom: t.headerPrenom,
		},
	};
}

export function buildDescriptionModule(
	t: ThemeTokens,
	opts: { order: number; title: string; isActive?: boolean },
) {
	return {
		type: "description" as const,
		order: opts.order,
		isActive: opts.isActive ?? true,
		title: opts.title,
		settings: {
			title: t.sectionTitle,
			content: {
				description: { ...t.body, textAlign: "justify" as const },
			},
		},
	};
}

export function buildPhilosophyModule(
	t: ThemeTokens,
	opts: { order: number; title: string; isActive?: boolean },
) {
	return {
		type: "philosophy" as const,
		order: opts.order,
		isActive: opts.isActive ?? true,
		title: opts.title,
		settings: {
			title: t.sectionTitle,
			content: {
				citation: t.body,
				author: t.meta,
				withAuthor: true,
			},
		},
	};
}

export function buildExperienceModule(
	t: ThemeTokens,
	opts: { order: number; title: string; isActive?: boolean },
) {
	return {
		type: "experience" as const,
		order: opts.order,
		isActive: opts.isActive ?? true,
		title: opts.title,
		settings: {
			title: t.sectionTitle,
			content: {
				title: t.itemTitle,
				company: t.meta,
				periode: t.meta,
				location: t.meta,
				description: t.body,
				missions: t.body,
				withDescription: true,
				withListMissions: true,
				withLocation: true,
				withPeriode: true,
				withTitle: true,
				withCompany: true,
			},
		},
	};
}

export function buildEducationModule(
	t: ThemeTokens,
	opts: {
		order: number;
		title: string;
		isActive?: boolean;
		columns?: EducationContentSettings["columns"];
	},
) {
	return {
		type: "education" as const,
		order: opts.order,
		isActive: opts.isActive ?? true,
		title: opts.title,
		settings: {
			title: t.sectionTitle,
			content: {
				diplome: t.itemTitle,
				etablissement: t.meta,
				year: t.meta,
				ville: t.meta,
				withYear: true,
				withVille: true,
				withEtablissement: true,
				columns: opts.columns ?? 1,
			},
		},
	};
}

export function buildSkillModule(
	t: ThemeTokens,
	opts: {
		order: number;
		title: string;
		isActive?: boolean;
		design?: "stars" | "dots" | "bars";
		groupColumns?: SkillContentSettings["groupColumns"];
	},
) {
	return {
		type: "skill" as const,
		order: opts.order,
		isActive: opts.isActive ?? true,
		title: opts.title,
		settings: {
			title: t.sectionTitle,
			content: {
				groupTitle: t.itemTitle,
				skills: t.meta,
				design: opts.design ?? "stars",
				withGroupTitle: true,
				groupColumns: opts.groupColumns ?? 1,
			},
		},
	};
}

export function buildCompetenceModule(
	t: ThemeTokens,
	opts: {
		order: number;
		title: string;
		isActive?: boolean;
		columns?: CompetenceContentSettings["columns"];
	},
) {
	return {
		type: "competence" as const,
		order: opts.order,
		isActive: opts.isActive ?? true,
		title: opts.title,
		settings: {
			title: t.sectionTitle,
			content: {
				groupTitle: t.itemTitle,
				competences: t.body,
				withGroupTitle: true,
				columns: opts.columns ?? 1,
			},
		},
	};
}

export function buildTagModule(
	t: ThemeTokens,
	opts: {
		order: number;
		title: string;
		isActive?: boolean;
		design?: TagContentSettings["design"];
	},
) {
	const design = opts.design ?? "tag";
	const tagsColorSelect: ColorSelect =
		design === "tag" ? "white" : design === "hashtag" ? "primaryColor" : "black"; // border | none

	return {
		type: "tag" as const,
		order: opts.order,
		isActive: opts.isActive ?? true,
		title: opts.title,
		settings: {
			title: t.sectionTitle,
			content: {
				groupTitle: t.itemTitle,
				tags: {
					...t.meta,
					colorSelect: tagsColorSelect,
				},
				withGroupTitle: true,
				design,
			},
		},
	};
}

export function buildLanguageModule(
	t: ThemeTokens,
	opts: {
		order: number;
		title: string;
		isActive?: boolean;
		design?: "stars" | "dots" | "bars";
		columns?: LanguageContentSettings["columns"];
	},
) {
	return {
		type: "language" as const,
		order: opts.order,
		isActive: opts.isActive ?? true,
		title: opts.title,
		settings: {
			title: t.sectionTitle,
			content: {
				language: t.itemTitle,
				design: opts.design ?? "stars",
				columns: opts.columns ?? 3,
			},
		},
	};
}

export function buildProjectModule(
	t: ThemeTokens,
	opts: { order: number; title: string; isActive?: boolean },
) {
	return {
		type: "project" as const,
		order: opts.order,
		isActive: opts.isActive ?? true,
		title: opts.title,
		settings: {
			title: t.sectionTitle,
			content: {
				title: t.itemTitle,
				description: t.body,
				result: t.body,
				location: t.meta,
				periode: t.meta,
				technology: t.meta,
				missions: t.body,
				withDescription: true,
				withResult: true,
				withLocation: true,
				withPeriode: true,
				withTechnology: true,
				withMissions: true,
				withTitle: true,
			},
		},
	};
}

export function buildSocialMediaModule(
	t: ThemeTokens,
	opts: {
		order: number;
		title: string;
		isActive?: boolean;
		columns?: SocialMediaContentSettings["columns"];
	},
) {
	return {
		type: "socialMedia" as const,
		order: opts.order,
		isActive: opts.isActive ?? true,
		title: opts.title,
		settings: {
			title: t.sectionTitle,
			content: {
				socialNetwork: t.itemTitle,
				username: t.meta,
				withSocialNetwork: true,
				withUsername: true,
				withIcon: true,
				iconColor: "primaryColor" as const,
				columns: opts.columns ?? 3,
			},
		},
	};
}

export function buildStrengthModule(
	t: ThemeTokens,
	opts: {
		order: number;
		title: string;
		isActive?: boolean;
		columns?: StrengthContentSettings["columns"];
	},
) {
	return {
		type: "strength" as const,
		order: opts.order,
		isActive: opts.isActive ?? true,
		title: opts.title,
		settings: {
			title: t.sectionTitle,
			content: {
				strength: t.itemTitle,
				withStrength: true,
				withIcon: true,
				iconColor: "primaryColor" as const,
				description: t.body,
				withDescription: true,
				columns: opts.columns ?? 1,
			},
		},
	};
}

export function buildFormationModule(
	t: ThemeTokens,
	opts: {
		order: number;
		title: string;
		isActive?: boolean;
		columns?: FormationContentSettings["columns"];
	},
) {
	return {
		type: "formation" as const,
		order: opts.order,
		isActive: opts.isActive ?? true,
		title: opts.title,
		settings: {
			title: t.sectionTitle,
			content: {
				title: t.itemTitle,
				organismeFormation: t.meta,
				periode: t.meta,
				status: t.meta,
				withTitle: true,
				withOrganismeFormation: true,
				withPeriode: true,
				withStatus: true,
				columns: opts.columns ?? 2,
			},
		},
	};
}

export function buildCertificationModule(
	t: ThemeTokens,
	opts: {
		order: number;
		title: string;
		isActive?: boolean;
		columns?: CertificationContentSettings["columns"];
	},
) {
	return {
		type: "certification" as const,
		order: opts.order,
		isActive: opts.isActive ?? true,
		title: opts.title,
		settings: {
			title: t.sectionTitle,
			content: {
				title: t.itemTitle,
				organismeCertification: t.meta,
				withTitle: true,
				withOrganismeCertification: true,
				columns: opts.columns ?? 2,
			},
		},
	};
}

export function buildPrizeModule(
	t: ThemeTokens,
	opts: {
		order: number;
		title: string;
		isActive?: boolean;
		columns?: PrizeContentSettings["columns"];
	},
) {
	return {
		type: "prize" as const,
		order: opts.order,
		isActive: opts.isActive ?? true,
		title: opts.title,
		settings: {
			title: t.sectionTitle,
			content: {
				title: t.itemTitle,
				domaine: t.meta,
				icon: "PiMedal",
				withTitle: true,
				withDomain: true,
				withIcon: true,
				iconColor: "primaryColor" as const,
				columns: opts.columns ?? 3,
			},
		},
	};
}

export function buildPassionModule(
	t: ThemeTokens,
	opts: {
		order: number;
		title: string;
		isActive?: boolean;
		columns?: PassionContentSettings["columns"];
	},
) {
	return {
		type: "passion" as const,
		order: opts.order,
		isActive: opts.isActive ?? true,
		title: opts.title,
		settings: {
			title: t.sectionTitle,
			content: {
				passion: t.body,
				withPassion: true,
				withIcon: true,
				iconColor: "primaryColor" as const,
				columns: opts.columns ?? 3,
			},
		},
	};
}

export function buildExpertiseModule(
	t: ThemeTokens,
	opts: {
		order: number;
		title: string;
		isActive?: boolean;
		design?: "stars" | "dots" | "bars";
		columns?: ExpertiseContentSettings["columns"];
	},
) {
	return {
		type: "expertise" as const,
		order: opts.order,
		isActive: opts.isActive ?? true,
		title: opts.title,
		settings: {
			title: t.sectionTitle,
			content: {
				title: t.itemTitle,
				design: opts.design ?? "stars",
				columns: opts.columns ?? 3,
			},
		},
	};
}

export function buildVolunteeringModule(
	t: ThemeTokens,
	opts: { order: number; title: string; isActive?: boolean },
) {
	return {
		type: "volunteering" as const,
		order: opts.order,
		isActive: opts.isActive ?? true,
		title: opts.title,
		settings: {
			title: t.sectionTitle,
			content: {
				title: t.itemTitle,
				organisation: t.meta,
				description: t.body,
				periode: t.meta,
				location: t.meta,
				missions: t.body,
				withTitle: true,
				withOrganisation: true,
				withDescription: true,
				withPeriode: true,
				withLocation: true,
				withMissions: true,
			},
		},
	};
}

export function buildPublicationModule(
	t: ThemeTokens,
	opts: { order: number; title: string; isActive?: boolean },
) {
	return {
		type: "publication" as const,
		order: opts.order,
		isActive: opts.isActive ?? true,
		title: opts.title,
		settings: {
			title: t.sectionTitle,
			content: {
				title: t.itemTitle,
				periode: t.meta,
				journalName: t.meta,
				url: t.meta,
				description: t.body,
				withDescription: true,
				withTitle: true,
				withPeriode: true,
				withJournalName: true,
				withUrl: true,
			},
		},
	};
}

export function buildAchievementModule(
	t: ThemeTokens,
	opts: { order: number; title: string; isActive?: boolean },
) {
	return {
		type: "achievement" as const,
		order: opts.order,
		isActive: opts.isActive ?? true,
		title: opts.title,
		settings: {
			title: t.sectionTitle,
			content: {
				title: t.itemTitle,
				year: t.meta,
				technology: t.meta,
				description: t.body,
				withTitle: true,
				withYear: true,
				withTechnology: true,
				withDescription: true,
			},
		},
	};
}
