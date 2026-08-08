import { MdSchool } from "react-icons/md";
import { SectionEducationOne } from "../components/education/SectionEducationOne";
import type { TemplateDefaultStyles } from "@/services/schemas/cvTemplate.schema";
import { MiniEducationOne } from "../components/education/MiniEducationOne";
import { SectionEducationTwo } from "../components/education/SectionEducationTwo";

// 1. Définis un composant par défaut garanti
const DefaultEducation = SectionEducationOne;
const DefaultMiniature = MiniEducationOne;
const DefaultIcon = MdSchool;

export const EducationRegister : Record<string, React.ComponentType> = {
    SectionEducationOne,
    SectionEducationTwo,
};
export const MiniatureRegister : Record<string, React.ComponentType> = {
    MiniEducationOne,
};
export const IconRegister : Record<string, React.ComponentType> = {
    MdSchool,
};

export function MiniatureEducationRenderer({ templateConfig }: { templateConfig: TemplateDefaultStyles }) {
    const miniatureKey = templateConfig?.components?.sectionEducation?.miniature ?? 'MiniEducationOne';
    const MiniatureComponent = MiniatureRegister[miniatureKey] ?? DefaultMiniature;
    return <MiniatureComponent />;
}
export function IconEducationRenderer({ templateConfig }: { templateConfig: TemplateDefaultStyles }) {
    const iconKey = templateConfig?.components?.sectionEducation?.icon ?? 'IconEducation';
    const IconComponent = IconRegister[iconKey] ?? DefaultIcon;
    return <IconComponent />;
}
export function EducationRenderer({ templateConfig }: { templateConfig: TemplateDefaultStyles }) {
    const EducationKey = templateConfig?.components?.sectionEducation?.component ?? 'SectionEducationOne';
    const EducationComponent = EducationRegister[EducationKey] ?? DefaultEducation;
    return <EducationComponent />;
}