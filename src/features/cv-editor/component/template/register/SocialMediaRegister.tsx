import { FaGlobe } from "react-icons/fa"
import { SectionSocialMediaOne } from "../components/social-media/SectionSocialMediaOne"
import { MiniSocialMediaOne } from "../components/social-media/MiniSocialMediaOne"
import { SectionSocialMediaTwo } from "../components/social-media/SectionSocialMediaTwo"
import type { TemplateDefaultStyles } from "@/services/schemas/cvTemplate.schema"

export const DefaultSocialMedia = SectionSocialMediaOne
export const DefaultMiniature = MiniSocialMediaOne
export const DefaultIcon = FaGlobe

export const SocialMediaRegister : Record<string, React.ComponentType> = {
    SectionSocialMediaOne,
    SectionSocialMediaTwo,
}
export const MiniatureRegister : Record<string, React.ComponentType> = {
    MiniSocialMediaOne,
}
export const IconRegister : Record<string, React.ComponentType> = {
    FaGlobe,
}

export function SocialMediaRenderer({ templateConfig }: { templateConfig: TemplateDefaultStyles }) {
    const socialMediaKey = templateConfig?.components?.sectionSocialMedia?.component ?? 'SectionSocialMediaOne';
    const SocialMediaComponent = SocialMediaRegister[socialMediaKey] ?? DefaultSocialMedia;
    return <SocialMediaComponent />;
}
export function MiniaturezSocialMediaRenderer({ templateConfig }: { templateConfig: TemplateDefaultStyles }) {
    const miniatureKey = templateConfig?.components?.sectionSocialMedia?.miniature ?? 'MiniSocialMediaOne';
    const MiniatureComponent = MiniatureRegister[miniatureKey] ?? DefaultMiniature;
    return <MiniatureComponent />;
}
export function IconSocialMediaRenderer({ templateConfig }: { templateConfig: TemplateDefaultStyles }) {
    const iconKey = templateConfig?.components?.sectionSocialMedia?.icon ?? 'FaGlobe';
    const IconComponent = IconRegister[iconKey] ?? DefaultIcon;
    return <IconComponent />;
}