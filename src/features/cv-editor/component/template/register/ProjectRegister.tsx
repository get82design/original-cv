import { SectionProjectOne } from "../components/project/SectionProjectOne";
import { MiniProjectOne } from "../components/project/MiniProjectOne";
import { GoProject } from "react-icons/go";
import { SectionProjectTwo } from "../components/project/SectionProjectTwo";
import type { TemplateDefaultStyles } from "@/services/schemas/cvTemplate.schema";

export const DefaultProject = SectionProjectOne
export const DefaultMiniature = MiniProjectOne
export const DefaultIcon = GoProject

export const ProjectRegister : Record<string, React.ComponentType> = {
    SectionProjectOne,
    SectionProjectTwo,
}
export const MiniatureRegister : Record<string, React.ComponentType> = {
    MiniProjectOne,
}
export const IconRegister : Record<string, React.ComponentType> = {
    GoProject,
}

export function ProjectRenderer({ templateConfig }: { templateConfig: TemplateDefaultStyles }) {
    const projectKey = templateConfig?.components?.sectionProject?.component ?? 'SectionProjectOne';
    const ProjectComponent = ProjectRegister[projectKey] ?? DefaultProject;
    return <ProjectComponent />;
}
export function MiniatureProjectRenderer({ templateConfig }: { templateConfig: TemplateDefaultStyles }) {
    const miniatureKey = templateConfig?.components?.sectionProject?.miniature ?? 'MiniProjectOne';
    const MiniatureComponent = MiniatureRegister[miniatureKey] ?? DefaultMiniature;
    return <MiniatureComponent />;
}
export function IconProjectRenderer({ templateConfig }: { templateConfig: TemplateDefaultStyles }) {
    const iconKey = templateConfig?.components?.sectionProject?.icon ?? 'GoProject';
    const IconComponent = IconRegister[iconKey] ?? DefaultIcon;
    return <IconComponent />;
}