import { GiAchievement } from "react-icons/gi";
import { MiniAchievementOne } from "../../components/achievement/MiniAchievementOne";
import { SectionAchievementOne } from "../../components/achievement/SectionAchievementOne";
import { SectionAchievementTwo } from "../../components/achievement/SectionAchievementTwo";
import type { TemplateDefaultStyles } from "@/services/schemas/cvTemplate.schema";

const DefaultAchievement = SectionAchievementOne;
const DefaultMiniature = MiniAchievementOne;
const DefaultIcon = GiAchievement;

export const AchievementRegister: Record<string, React.ComponentType> = {
	SectionAchievementOne,
	SectionAchievementTwo,
};
export const MiniatureRegister: Record<string, React.ComponentType> = {
	MiniAchievementOne,
};
export const IconRegister: Record<string, React.ComponentType> = {
	GiAchievement,
};

export function AchievementRenderer({ templateConfig }: { templateConfig: TemplateDefaultStyles }) {
	const achievementKey =
		templateConfig?.components?.sectionAchievement?.component ?? "SectionAchievementOne";
	const AchievementComponent = AchievementRegister[achievementKey] ?? DefaultAchievement;
	return <AchievementComponent />;
}
export function MiniatureAchievementRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const miniatureKey =
		templateConfig?.components?.sectionAchievement?.miniature ?? "MiniAchievementOne";
	const MiniatureComponent = MiniatureRegister[miniatureKey] ?? DefaultMiniature;
	return <MiniatureComponent />;
}
export function IconAchievementRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const iconKey = templateConfig?.components?.sectionAchievement?.icon ?? "GiAchievement";
	const IconComponent = IconRegister[iconKey] ?? DefaultIcon;
	return <IconComponent />;
}
