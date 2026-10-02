import type {
	ExperienceInput,
	FormationInput,
	StrengthInput,
	StatInput,
	ProjectInput,
	PublicationInput,
	AchievementInput,
	VolunteeringInput,
	EducationInput,
	LanguageInput,
	PassionInput,
	PrizeInput,
	CertificationInput,
	SocialMediaInput,
	ExpertiseInput,
	SkillInput,
	SkillGroupInput,
	CompetenceInput,
	CompetenceGroupInput,
	TagInput,
	TagGroupInput,
} from "@/services/schemas/profileSave.schema";
import type { ListItem } from "@utils/type";

function hasMeaningfulDate(value: unknown): boolean {
	if (value == null || value === "") return false;
	if (value instanceof Date) return !Number.isNaN(value.getTime());
	return true;
}

export function isBlankExperience(item: ListItem<ExperienceInput>) {
	const c = item.content;
	if (!c) return true;
	const hasText = [c.title, c.company, c.location, c.description].some((s) => s?.trim());
	const hasPeriode = Boolean((c as { periode?: string | null }).periode?.trim());
	const hasMissions = (c.missions ?? []).some((m) => m.content?.content?.trim());
	const hasEnd = hasMeaningfulDate(c.end);
	return !hasText && !hasPeriode && !hasMissions && !hasEnd;
}

export function isBlankStrength(item: ListItem<StrengthInput>) {
	const c = item.content;
	const hasText = [c.title, c.description].some((s) => s?.trim());
	return !hasText;
}

export function isBlankStat(item: ListItem<StatInput>) {
	const c = item.content;
	const hasText = [c.label, c.value].some((s) => s?.trim());
	return !hasText;
}

export function isBlankFormation(item: ListItem<FormationInput>) {
	const c = item.content;
	const hasText = [c.title, c.organismeFormation].some((s) => s?.trim());
	return !hasText;
}

export function isBlankProject(item: ListItem<ProjectInput>) {
	const c = item.content;
	const hasText = [c.title, c.description, c.location, c.technology].some((s) => s?.trim());
	const hasMissions = (c.missions ?? []).some((m) => m.content.content?.trim());
	const hasEnd = c.end != null;
	return !hasText && !hasMissions && !hasEnd;
}

export function isBlankPublication(item: ListItem<PublicationInput>) {
	const c = item.content;
	const hasText = [c.title, c.description, c.url, c.journalName].some((s) => s?.trim());
	const hasEnd = c.end != null;
	return !hasText && !hasEnd;
}

export function isBlankAchievement(item: ListItem<AchievementInput>) {
	const c = item.content;
	const hasText = [c.title, c.description, c.technology].some((s) => s?.trim());
	return !hasText;
}

export function isBlankVolunteering(item: ListItem<VolunteeringInput>) {
	const c = item.content;
	const hasText = [c.title, c.description, c.organisation, c.location].some((s) => s?.trim());
	const hasMissions = (c.missions ?? []).some((m) => m.content.content?.trim());
	const hasEnd = c.end != null;
	return !hasText && !hasMissions && !hasEnd;
}

export function isBlankEducation(item: ListItem<EducationInput>) {
	const c = item.content;
	const hasText = [c.title, c.school, c.city, c.degree].some((s) => s?.trim());
	const hasEnd = c.end != null;
	return !hasText && !hasEnd;
}

export function isBlankLanguage(item: ListItem<LanguageInput>) {
	const c = item.content;
	const hasText = [c.name].some((s) => s?.trim());
	return !hasText;
}

export function isBlankPassion(item: ListItem<PassionInput>) {
	return !item.content?.title?.trim();
}

export function isBlankPrize(item: ListItem<PrizeInput>) {
	return !item.content?.title?.trim();
}

export function isBlankCertification(item: ListItem<CertificationInput>) {
	const c = item.content;
	const hasText = [c.title, c.organismeCertification].some((s) => s?.trim());
	return !hasText;
}

export function isBlankSocialMedia(item: ListItem<SocialMediaInput>) {
	const c = item.content;
	const hasText = [c.socialNetwork, c.username, c.icon].some((s) => s?.trim());
	return !hasText;
}

export function isBlankExpertise(item: ListItem<ExpertiseInput>) {
	return !item.content?.title?.trim();
}

export function isBlankSkill(item: ListItem<SkillInput>) {
	return !item.content?.name?.trim();
}

export function isBlankSkillGroup(item: ListItem<SkillGroupInput>) {
	const hasTitle = !!item.content?.title?.trim();
	const hasSkills = (item.content?.skills ?? []).some(
		(s) => !isBlankSkill(s as ListItem<SkillInput>),
	);
	return !hasTitle && !hasSkills;
}

export function isBlankCompetence(item: ListItem<CompetenceInput>) {
	return !item.content?.name?.trim();
}

export function isBlankCompetenceGroup(item: ListItem<CompetenceGroupInput>) {
	const hasTitle = !!item.content?.title?.trim();
	const hasCompetences = (item.content?.competences ?? []).some(
		(s) => !isBlankCompetence(s as ListItem<CompetenceInput>),
	);
	return !hasTitle && !hasCompetences;
}

export function isBlankTag(item: ListItem<TagInput>) {
	return !item.content?.name?.trim();
}

export function isBlankTagGroup(item: ListItem<TagGroupInput>) {
	const hasTitle = !!item.content?.title?.trim();
	const hasTags = (item.content?.tags ?? []).some((s) => !isBlankTag(s as ListItem<TagInput>));
	return !hasTitle && !hasTags;
}
