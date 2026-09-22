import type { TemplateModule } from "@/services/schemas/cvTemplate.schema";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { MiniatureRegister as ExperienceMiniatures } from "../template/register/experience/ExperienceRegister";
import { MiniatureRegister as DescriptionMiniatures } from "../template/register/description/DescriptionRegister";
import { MiniatureRegister as EducationMiniatures } from "../template/register/education/EducationRegister";
import { MiniatureRegister as SkillMiniatures } from "../template/register/skill/SkillRegister";
import { MiniatureRegister as LanguageMiniatures } from "../template/register/language/LanguageRegister";
import { MiniatureRegister as ProjectMiniatures } from "../template/register/project/ProjectRegister";
import { MiniatureRegister as SocialMediaMiniatures } from "../template/register/social-media/SocialMediaRegister";
import { MiniatureRegister as StrengthMiniatures } from "../template/register/strength/StrengthRegister";
import { MiniatureRegister as PhilosophyMiniatures } from "../template/register/philosophy/PhilosophyRegister";
import { MiniatureRegister as FormationMiniatures } from "../template/register/formation/FormationRegister";
import { MiniatureRegister as CertificationMiniatures } from "../template/register/certification/CertificationRegister";
import { MiniatureRegister as PrizeMiniatures } from "../template/register/prize/PrizeRegister";
import { MiniatureRegister as PassionMiniatures } from "../template/register/passion/PassionRegister";
import { MiniatureRegister as ExpertiseMiniatures } from "../template/register/expertise/ExpertiseRegister";
import { MiniatureRegister as VolunteeringMiniatures } from "../template/register/volunteering/VolunteeringRegister";
import { MiniatureRegister as PublicationMiniatures } from "../template/register/publication/PublicationRegister";
import { MiniatureRegister as AchievementMiniatures } from "../template/register/achievement/AchievementRegister";
import { MiniatureRegister as CompetenceMiniatures } from "../template/register/competence/CompetenceRegister";
import { MiniatureRegister as TagMiniatures } from "../template/register/tag/TagRegister";

interface SectionNoUseProps {
	itemNoUse: TemplateModule[];
	addItem: (item: TemplateModule) => void;
}

export const SectionNoUse = ({ itemNoUse, addItem }: SectionNoUseProps) => {
	return (
		<div className={"w-full flex flex-col gap-2"}>
			<div className="w-full grid grid-flow-row gap-4">
				{itemNoUse.map((item, idx) => {
					return <OneSectionNoUse idx={idx} addItem={addItem} item={item} key={item.type} />;
				})}
			</div>
		</div>
	);
};

interface OneSectionNoUseProps {
	idx: number;
	addItem: (item: TemplateModule) => void;
	item: TemplateModule;
}

export const OneSectionNoUse = ({ idx, addItem, item }: OneSectionNoUseProps) => {
	const { watch } = useFormContext();
	const [MiniatureComponent, setMiniatureComponent] = useState<React.ComponentType>();
	const [LabelComponent, setLabelComponent] = useState<string>();
	const watchTemplateConfig = watch("layoutGeneral.defaultStyles");
	useEffect(() => {
		if (item.type === "experience") {
			const key =
				watchTemplateConfig?.components?.sectionExperience?.miniature ?? "MiniExperienceOne";
			// console.log('key => ', key)
			setMiniatureComponent(
				() => ExperienceMiniatures[key] ?? ExperienceMiniatures.MiniExperienceOne,
			);
			setLabelComponent(watchTemplateConfig?.components?.sectionExperience?.label ?? "Expérience");
		}
		if (item.type === "description") {
			const key =
				watchTemplateConfig?.components?.sectionDescription?.miniature ?? "MiniDescriptionOne";
			// console.log('key => ', key)
			setMiniatureComponent(
				() => DescriptionMiniatures[key] ?? DescriptionMiniatures.MiniDescriptionOne,
			);
			setLabelComponent(
				watchTemplateConfig?.components?.sectionDescription?.label ?? "Présentation",
			);
		}
		if (item.type === "education") {
			const key =
				watchTemplateConfig?.components?.sectionEducation?.miniature ?? "MiniEducationOne";
			// console.log('key => ', key)
			setMiniatureComponent(() => EducationMiniatures[key] ?? EducationMiniatures.MiniEducationOne);
			setLabelComponent(watchTemplateConfig?.components?.sectionEducation?.label ?? "Diplôme");
		}
		if (item.type === "skill") {
			const key = watchTemplateConfig?.components?.sectionSkill?.miniature ?? "MiniSkillOne";
			// console.log('key => ', key)
			setMiniatureComponent(() => SkillMiniatures[key] ?? SkillMiniatures.MiniSkillOne);
			setLabelComponent(watchTemplateConfig?.components?.sectionSkill?.label ?? "Skill");
		}
		if (item.type === "language") {
			const key = watchTemplateConfig?.components?.sectionLanguage?.miniature ?? "MiniLanguageOne";
			// console.log('key => ', key)
			setMiniatureComponent(() => LanguageMiniatures[key] ?? LanguageMiniatures.MiniLanguageOne);
			setLabelComponent(watchTemplateConfig?.components?.sectionLanguage?.label ?? "Langue");
		}
		if (item.type === "project") {
			const key = watchTemplateConfig?.components?.sectionProject?.miniature ?? "MiniProjectOne";
			// console.log('key => ', key)
			setMiniatureComponent(() => ProjectMiniatures[key] ?? ProjectMiniatures.MiniProjectOne);
			setLabelComponent(watchTemplateConfig?.components?.sectionProject?.label ?? "Projet");
		}
		if (item.type === "socialMedia") {
			const key =
				watchTemplateConfig?.components?.sectionSocialMedia?.miniature ?? "MiniSocialMediaOne";
			// console.log('key => ', key)
			setMiniatureComponent(
				() => SocialMediaMiniatures[key] ?? SocialMediaMiniatures.MiniSocialMediaOne,
			);
			setLabelComponent(
				watchTemplateConfig?.components?.sectionSocialMedia?.label ?? "Réseau social",
			);
		}
		if (item.type === "strength") {
			const key = watchTemplateConfig?.components?.sectionStrength?.miniature ?? "MiniStrengthOne";
			// console.log('key => ', key)
			setMiniatureComponent(() => StrengthMiniatures[key] ?? StrengthMiniatures.MiniStrengthOne);
			setLabelComponent(watchTemplateConfig?.components?.sectionStrength?.label ?? "Atout");
		}
		if (item.type === "philosophy") {
			const key =
				watchTemplateConfig?.components?.sectionPhilosophy?.miniature ?? "MiniPhilosophyOne";
			// console.log('key => ', key)
			setMiniatureComponent(
				() => PhilosophyMiniatures[key] ?? PhilosophyMiniatures.MiniPhilosophyOne,
			);
			setLabelComponent(watchTemplateConfig?.components?.sectionPhilosophy?.label ?? "Philosophie");
		}
		if (item.type === "formation") {
			const key =
				watchTemplateConfig?.components?.sectionFormation?.miniature ?? "MiniFormationOne";
			// console.log('key => ', key)
			setMiniatureComponent(() => FormationMiniatures[key] ?? FormationMiniatures.MiniFormationOne);
			setLabelComponent(watchTemplateConfig?.components?.sectionFormation?.label ?? "Formation");
		}
		if (item.type === "certification") {
			const key =
				watchTemplateConfig?.components?.sectionCertification?.miniature ?? "MiniCertificationOne";
			// console.log('key => ', key)
			setMiniatureComponent(
				() => CertificationMiniatures[key] ?? CertificationMiniatures.MiniCertificationOne,
			);
			setLabelComponent(
				watchTemplateConfig?.components?.sectionCertification?.label ?? "Certification",
			);
		}
		if (item.type === "prize") {
			const key = watchTemplateConfig?.components?.sectionPrize?.miniature ?? "MiniPrizeOne";
			setMiniatureComponent(() => PrizeMiniatures[key] ?? PrizeMiniatures.MiniPrizeOne);
			setLabelComponent(watchTemplateConfig?.components?.sectionPrize?.label ?? "Prix");
		}
		if (item.type === "passion") {
			const key = watchTemplateConfig?.components?.sectionPassion?.miniature ?? "MiniPassionOne";
			setMiniatureComponent(() => PassionMiniatures[key] ?? PassionMiniatures.MiniPassionOne);
			setLabelComponent(watchTemplateConfig?.components?.sectionPassion?.label ?? "Passion");
		}
		if (item.type === "expertise") {
			const key =
				watchTemplateConfig?.components?.sectionExpertise?.miniature ?? "MiniExpertiseOne";
			setMiniatureComponent(() => ExpertiseMiniatures[key] ?? ExpertiseMiniatures.MiniExpertiseOne);
			setLabelComponent(watchTemplateConfig?.components?.sectionExpertise?.label ?? "Expertise");
		}
		if (item.type === "volunteering") {
			const key =
				watchTemplateConfig?.components?.sectionVolunteering?.miniature ?? "MiniVolunteeringOne";
			setMiniatureComponent(
				() => VolunteeringMiniatures[key] ?? VolunteeringMiniatures.MiniVolunteeringOne,
			);
			setLabelComponent(
				watchTemplateConfig?.components?.sectionVolunteering?.label ?? "Volontariat",
			);
		}
		if (item.type === "publication") {
			const key =
				watchTemplateConfig?.components?.sectionPublication?.miniature ?? "MiniPublicationOne";
			setMiniatureComponent(
				() => PublicationMiniatures[key] ?? PublicationMiniatures.MiniPublicationOne,
			);
			setLabelComponent(
				watchTemplateConfig?.components?.sectionPublication?.label ?? "Publication",
			);
		}
		if (item.type === "achievement") {
			const key =
				watchTemplateConfig?.components?.sectionAchievement?.miniature ?? "MiniAchievementOne";
			setMiniatureComponent(
				() => AchievementMiniatures[key] ?? AchievementMiniatures.MiniAchievementOne,
			);
			setLabelComponent(
				watchTemplateConfig?.components?.sectionAchievement?.label ?? "Réalisation",
			);
		}
		if (item.type === "competence") {
			const key =
				watchTemplateConfig?.components?.sectionCompetence?.miniature ?? "MiniCompetenceOne";
			setMiniatureComponent(
				() => CompetenceMiniatures[key] ?? CompetenceMiniatures.MiniCompetenceOne,
			);
			setLabelComponent(watchTemplateConfig?.components?.sectionCompetence?.label ?? "Compétence");
		}
		if (item.type === "tag") {
			const key = watchTemplateConfig?.components?.sectionTag?.miniature ?? "MiniTagOne";
			setMiniatureComponent(() => TagMiniatures[key] ?? TagMiniatures.MiniTagOne);
			setLabelComponent(watchTemplateConfig?.components?.sectionTag?.label ?? "Tag");
		}
	}, [item, watchTemplateConfig]);
	return (
		<button
			type="button"
			key={idx}
			className={"w-full relative group cursor-pointer"}
			onClick={() => addItem(item)}
		>
			{/* <div className="w-full text-start text-lg font-semibold py-1 group-hover:text-green-400">{LabelComponent}</div> */}
			<div className="w-full p-3 border-1 border-gray-300 group-hover:border-green-400 rounded-md">
				{MiniatureComponent && <MiniatureComponent />}
				{/* Overlay au survol */}
				<div
					className="
                pointer-events-none
                absolute inset-0 rounded-md
                flex items-center justify-center
                bg-black/0 group-hover:bg-black/50
                opacity-0 group-hover:opacity-100
                transition-all duration-300 ease-out
            "
				>
					<span
						className="text-white text-lg font-semibold px-2 text-center
                translate-y-2 opacity-0
                group-hover:translate-y-0 group-hover:opacity-100
                transition-all duration-300 ease-out delay-75"
					>
						{LabelComponent}
					</span>
				</div>
			</div>
		</button>
	);
};
