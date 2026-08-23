import {
	CardSocialMediaOne,
	type CardSocialMediaOneProps,
} from "../../components/social-media/compo/CardSocialMediaOne";

export type SocialMediaCardProps = CardSocialMediaOneProps;

export const SocialMediaCardRegister: Record<
	string,
	React.ComponentType<SocialMediaCardProps>
> = {
	CardSocialMediaOne,
};
