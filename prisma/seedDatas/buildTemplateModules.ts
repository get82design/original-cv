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
  opts: { order: number; title: string; isActive?: boolean },
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
      },
    },
  };
}

export function buildSkillModule(
  t: ThemeTokens,
  opts: { order: number; title: string; isActive?: boolean; design?: "stars" | "dots" | "bars" },
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
      },
    },
  };
}

export function buildLanguageModule(
  t: ThemeTokens,
  opts: { order: number; title: string; isActive?: boolean; design?: "stars" | "dots" | "bars" },
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
        location: t.meta,
        periode: t.meta,
        technology: t.meta,
        missions: t.body,
        withDescription: true,
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
  opts: { order: number; title: string; isActive?: boolean },
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
      },
    },
  };
}
//! Pour le compo des TAGS : "tag" | "badge" | "border" | "none"