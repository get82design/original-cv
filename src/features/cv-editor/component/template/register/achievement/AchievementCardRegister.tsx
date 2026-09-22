import {
	CardAchievementOne,
	type CardAchievementOneProps,
} from "../../components/achievement/compo/CardAchievementOne";

export type AchievementCardProps = CardAchievementOneProps;

export const AchievementCardRegister: Record<string, React.ComponentType<AchievementCardProps>> = {
	CardAchievementOne,
};
