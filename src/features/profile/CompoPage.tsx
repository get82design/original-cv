import { Button } from "primereact/button";
import { ProfileIdentite } from "./compo/ProfileIdentite";
import { useFormContext } from "react-hook-form";
import { ProfileDescription } from "./compo/description/ProfileDescription";
import { ProfileExperiences } from "./compo/experience/ProfileExperiences";
import { ProfilePhilosophy } from "./compo/philosophy/ProfilePhilosophy";
import { ProfileStrengths } from "./compo/strength/ProfileStrengths";
import { ProfileProject } from "./compo/project/ProfileProject";
import { ProfilePublication } from "./compo/publication/ProfilePublication";
import { ProfileAchievement } from "./compo/achievement/ProfileAchievement";
import { ProfileVolunteering } from "./compo/volunteering/ProfileVolunteering";
import { ProfileEducation } from "./compo/education/ProfileEducation";
import { ProfileSkill } from "./compo/skill/ProfileSkill";
import { ProfileLanguage } from "./compo/language/ProfileLanguage";
import { ProfileTag } from "./compo/tag/ProfileTag";
import { ProfileCompetence } from "./compo/competence/ProfileCompetence";
import { ProfileSocialMedia } from "./compo/socialMedia/ProfileSocialMedia";
import { ProfileExpertise } from "./compo/expertise/ProfileExpertise";
import { ProfileCertification } from "./compo/certification/ProfileCertification";
import { ProfileFormation } from "./compo/formation/ProfileFormation";
import { ProfilePassion } from "./compo/passion/ProfilePassion";
import { ProfilePrize } from "./compo/prize/ProfilePrize";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@server/api/root";

type RouterOutputs = inferRouterOutputs<AppRouter>;
export type CV = NonNullable<RouterOutputs["cv"]["allByUser"]>[number];

export const CompoPage = ({ cvs }: { cvs: CV[] }) => {
	const { watch } = useFormContext();
	const profileId = watch("id");
	return (
		<div className={`w-full flex flex-wrap xl:flex-nowrap gap-6 relative pb-8`}>
			<div className="w-full xl:w-1/2 -mt-2 flex flex-col gap-6">
				<ProfileIdentite />
				{profileId ? (
					<>
						<ProfileExperiences cvs={cvs} />
						<ProfileStrengths cvs={cvs} />
						<ProfileFormation cvs={cvs} />
						<ProfileProject cvs={cvs} />
						<ProfilePublication cvs={cvs} />
						<ProfileAchievement cvs={cvs} />
						<ProfileVolunteering cvs={cvs} />
					</>
				) : (
					<p className="text-center text-gray-500">
						Vous devez créer un profile pour remplir votre carrière
						professionnelle. Entrez votre nom et prénom et sauvegarder
					</p>
				)}
			</div>
			{profileId && (
				<div className="w-full xl:w-1/2 -mt-2 flex flex-col gap-6">
					<ProfileDescription cvs={cvs} />
					<ProfilePhilosophy cvs={cvs} />
					<ProfileEducation cvs={cvs} />
					<ProfileLanguage cvs={cvs} />
					<ProfileSkill cvs={cvs} />
					<ProfileTag cvs={cvs} />
					<div className="w-full grid grid-cols-2 gap-6">
						<div className="col-span-1 flex flex-col gap-6">
							<ProfileCompetence cvs={cvs} />
							<ProfileExpertise cvs={cvs} />
							<ProfileCertification cvs={cvs} />
						</div>
						<div className="col-span-1 flex flex-col gap-6">
							<ProfileSocialMedia cvs={cvs} />
							<ProfilePassion cvs={cvs} />
							<ProfilePrize cvs={cvs} />
						</div>
					</div>
				</div>
			)}
			<div className="fixed bottom-4 right-4">
				<Button label="Enregistrer" type="submit" />
			</div>
		</div>
	);
};
