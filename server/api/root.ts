import { router } from "./trpc";
import { userRouter } from "./routers/user.router";
import { profileRouter } from "./routers/profile.router";
import { cvRouter } from "./routers/cv.router";
import { cvHeaderRouter } from "./routers/cvHeader.router";
import { cvDescriptionRouter } from "./routers/cvDescription.router";
import { cvPhilosophyRouter } from "./routers/cvPhilosophy.router";
import { profileDescriptionRouter } from "./routers/profileDescription.router";
import { profilePhilosophyRouter } from "./routers/profilePhilosophy.router";
import { cvAchievementRouter } from "./routers/cvAchievement.router";
import { profileAchievementRouter } from "./routers/profileAchievement.router";
import { cvCertificationRouter } from "./routers/cvCertification.router";
import { profileCertificationRouter } from "./routers/profileCertification.router";
import { cvExpertiseRouter } from "./routers/cvExpertise.router";
import { profileExpertiseRouter } from "./routers/profileExpertise.router";
import { cvLanguageRouter } from "./routers/cvLanguage.router";
import { profileLanguageRouter } from "./routers/profileLanguage.router";
import { cvPassionRouter } from "./routers/cvPassion.router";
import { profilePassionRouter } from "./routers/profilePassion.router";
import { cvPrizeRouter } from "./routers/cvPrize.router";
import { profilePrizeRouter } from "./routers/profilePrize.router";
import { cvSocialMediaRouter } from "./routers/cvSocialMedia.router";
import { profileSocialMediaRouter } from "./routers/profileSocialMedia.router";
import { cvStrengthRouter } from "./routers/cvStrength.router";
import { profileStrengthRouter } from "./routers/profileStrength.router";
import { cvEducationRouter } from "./routers/cvEducation.router";
import { profileEducationRouter } from "./routers/profileEducation.router";
import { cvFormationRouter } from "./routers/cvFormation.router";
import { profileFormationRouter } from "./routers/profileFormation.router";
import { cvPublicationRouter } from "./routers/cvPublication.router";
import { profilePublicationRouter } from "./routers/profilePublication.router";
import { cvExperienceRouter } from "./routers/cvExperience.router";
import { profileExperienceRouter } from "./routers/profileExperience.router";
import { cvProjectRouter } from "./routers/cvProject.router";
import { profileProjectRouter } from "./routers/profileProject.router";
import { cvVolunteeringRouter } from "./routers/cvVolunteering.router";
import { profileVolunteeringRouter } from "./routers/profileVolunteering.router";
import { competenceBaseRouter } from "./routers/competenceBase.router";
import { skillBaseRouter } from "./routers/skillBase.router";
import { cvCompetenceRouter } from "./routers/cvCompetence.router";
import { profileCompetenceRouter } from "./routers/profileCompetence.router";
import { cvSkillRouter } from "./routers/cvSkill.router";
import { profileSkillRouter } from "./routers/profileSkill.router";
import { cvCompetenceGroupRouter } from "./routers/cvCompetenceGroup.router";
import { profileCompetenceGroupRouter } from "./routers/profileCompetenceGroup.router";
import { cvSkillGroupRouter } from "./routers/cvSkillGroup.router";
import { profileSkillGroupRouter } from "./routers/profileSkillGroup.router";
import { cvMissionExperienceRouter } from "./routers/cvMissionExperience.router";
import { profileMissionExperienceRouter } from "./routers/profileMissionExperience.router";
import { cvMissionProjectRouter } from "./routers/cvMissionProject.router";
import { profileMissionProjectRouter } from "./routers/profileMissionProject.router";
import { cvMissionVolunteeringRouter } from "./routers/cvMissionVolunteering.router";
import { profileMissionVolunteeringRouter } from "./routers/profileMissionVolunteering.router";
import { cvTemplateRouter } from "./routers/cvTemplate.router";
import { cvModuleRouter } from "./routers/cvModule.router";
import { cvModuleItemRouter } from "./routers/cvModuleItem.router";
import { colorRouter } from "./routers/color.router";
import { unlockedTemplateRouter } from "./routers/unlockedTemplate.router";
import { tagBaseRouter } from "./routers/tagBase.router";
import { cvTagRouter } from "./routers/cvTag.router";
import { cvTagGroupRouter } from "./routers/cvTagGroup.router";
import { profileTagRouter } from "./routers/profileTag.router";
import { profileTagGroupRouter } from "./routers/profileTagGroup.router";
import { aiRouter } from "./routers/ai.router";
import { adminRouter } from "./routers/admin.router";
import { romeRouter } from "./routers/rome.router";

export const appRouter = router({
	user: userRouter,
	ai: aiRouter,
	rome: romeRouter,
	admin: adminRouter,
	profile: profileRouter,
	cv: cvRouter,
	color: colorRouter,
	competenceBase: competenceBaseRouter,
	skillBase: skillBaseRouter,
	tagBase: tagBaseRouter,
	cvHeader: cvHeaderRouter,
	cvAchievement: cvAchievementRouter,
	cvCertification: cvCertificationRouter,
	cvCompetence: cvCompetenceRouter,
	cvCompetenceGroup: cvCompetenceGroupRouter,
	cvDescription: cvDescriptionRouter,
	cvEducation: cvEducationRouter,
	cvExperience: cvExperienceRouter,
	cvExpertise: cvExpertiseRouter,
	cvFormation: cvFormationRouter,
	cvLanguage: cvLanguageRouter,
	cvMissionExperience: cvMissionExperienceRouter,
	cvMissionProject: cvMissionProjectRouter,
	cvMissionVolunteering: cvMissionVolunteeringRouter,
	cvPassion: cvPassionRouter,
	cvPhilosophy: cvPhilosophyRouter,
	cvPrize: cvPrizeRouter,
	cvProject: cvProjectRouter,
	cvPublication: cvPublicationRouter,
	cvSkill: cvSkillRouter,
	cvSkillGroup: cvSkillGroupRouter,
	cvTag: cvTagRouter,
	cvTagGroup: cvTagGroupRouter,
	cvSocialMedia: cvSocialMediaRouter,
	cvStrength: cvStrengthRouter,
	cvVolunteering: cvVolunteeringRouter,
	cvTemplate: cvTemplateRouter,
	cvModule: cvModuleRouter,
	cvModuleItem: cvModuleItemRouter,
	profileAchievement: profileAchievementRouter,
	profileCertification: profileCertificationRouter,
	profileCompetence: profileCompetenceRouter,
	profileCompetenceGroup: profileCompetenceGroupRouter,
	profileDescription: profileDescriptionRouter,
	profileEducation: profileEducationRouter,
	profileExperience: profileExperienceRouter,
	profileExpertise: profileExpertiseRouter,
	profileFormation: profileFormationRouter,
	profileLanguage: profileLanguageRouter,
	profileMissionExperience: profileMissionExperienceRouter,
	profileMissionProject: profileMissionProjectRouter,
	profileMissionVolunteering: profileMissionVolunteeringRouter,
	profilePassion: profilePassionRouter,
	profilePhilosophy: profilePhilosophyRouter,
	profilePrize: profilePrizeRouter,
	profileProject: profileProjectRouter,
	profilePublication: profilePublicationRouter,
	profileSkill: profileSkillRouter,
	profileSkillGroup: profileSkillGroupRouter,
	profileTag: profileTagRouter,
	profileTagGroup: profileTagGroupRouter,
	profileSocialMedia: profileSocialMediaRouter,
	profileStrength: profileStrengthRouter,
	profileVolunteering: profileVolunteeringRouter,
	unlockedTemplate: unlockedTemplateRouter,
});

export type AppRouter = typeof appRouter;
