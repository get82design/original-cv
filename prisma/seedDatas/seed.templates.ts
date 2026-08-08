import { classiqueTokens, moderneTokens, minimalTokens } from "./themeTokens";
import {
  buildHeader,
  buildDescriptionModule,
  buildExperienceModule,
  buildEducationModule,
  buildSkillModule,
  buildLanguageModule,
  buildProjectModule,
  buildSocialMediaModule,
} from "./buildTemplateModules";

const sharedLayout = {
  columns: 1,
  marge: "md",
  space: "md",
  withPhoto: false,
  stylePhoto: "flat",
  titleSection: { textTransform: "capitalize" },
};
export const seedTemplates = [
  {
    name: "Classique",
    structure: {
      layout: sharedLayout,
      header: buildHeader(classiqueTokens),
      modules: [
        buildDescriptionModule(classiqueTokens, { order: 1, title: "Profil" }),
        buildExperienceModule(classiqueTokens, { order: 2, title: "Expériences professionnelles" }),
        buildEducationModule(classiqueTokens, { order: 3, title: "Diplomes" }),
        buildSkillModule(classiqueTokens, { order: 4, title: "Skills", isActive: false }),
        buildLanguageModule(classiqueTokens, { order: 5, title: "Langues", design: "stars" }),
        buildProjectModule(classiqueTokens, { order: 6, title: "Projets", isActive: false }),
        buildSocialMediaModule(classiqueTokens, { order: 7, title: "Réseaux sociaux", isActive: false }),
        // language / project : mêmes builders une fois leurs schemas prêts
      ],
    },
    defaultStyles: { 
      primaryColor: { name: "red", primary: "-500" }, 
      slugTemplate: "classique-noLine-x" ,
      components: {
        sectionHeader: "HeaderOne",
        sectionExperience: {
          component: "SectionExperienceOne",
          miniature: "MiniExperienceOne",
          Label: "Expérience",
          icon: "BsListCheck",
        },
        sectionDescription: {
          component: "SectionDescriptionOne",
          miniature: "MiniDescriptionOne",
          Label: "Description",
          icon: "BsPerson",
        },
        sectionEducation: {
          component: "SectionEducationOne",
          miniature: "MiniEducationOne",
          Label: "Diplome",
          icon: "MdSchool",
        },
        sectionSkill: {
          component: "SectionSkillOne",
          miniature: "MiniSkillOne",
          Label: "Skill",
          icon: "MdTag",
        },
        sectionLanguage: {
          component: "SectionLanguageOne",
          miniature: "MiniLanguageOne",
          Label: "Langue",
          icon: "MdLanguage",
        },
        sectionProject: {
          component: "SectionProjectOne",
          miniature: "MiniProjectOne",
          Label: "Projet",
          icon: "GoProject",
        },
        sectionSocialMedia: {
          component: "SectionSocialMediaOne",
          miniature: "MiniSocialMediaOne",
          Label: "Réseau social",
          icon: "FaGlobe",
        },
      },
    },
  },
  {
    name: "Moderne",
    structure: {
      layout: {...sharedLayout, titleSection: { 
        textTransform: "capitalize", 
        ligneDessous: true,
        ligneDessus: false
      }},
      header: buildHeader(moderneTokens),
      modules: [
        buildDescriptionModule(moderneTokens, { order: 1, title: "À propos" }),
        buildSkillModule(moderneTokens, { order: 2, title: "Skills", design: "stars" }),
        buildExperienceModule(moderneTokens, { order: 3, title: "Expériences" }),
        buildEducationModule(moderneTokens, { order: 4, title: "Diplomes" }),
        buildLanguageModule(moderneTokens, { order: 5, title: "Langues", design: "stars", isActive: false }),
        buildProjectModule(moderneTokens, { order: 6, title: "Projets" }),
        buildSocialMediaModule(moderneTokens, { order: 7, title: "Réseaux sociaux" }),
      ],
    },
    defaultStyles: { 
      primaryColor: { name: "sky", primary: "-500" }, 
      slugTemplate: "moderne-noLine-x" ,
      components: {
        sectionHeader: "HeaderTwo",
        sectionExperience: {
          component: "SectionExperienceOne",
          miniature: "MiniExperienceOne",
          Label: "Expérience",
          icon: "BsListCheck",
        },
        sectionDescription: {
          component: "SectionDescriptionOne",
          miniature: "MiniDescriptionOne",
          Label: "Description",
          icon: "BsPerson",
        },
        sectionEducation: {
          component: "SectionEducationOne",
          miniature: "MiniEducationOne",
          Label: "Diplome",
          icon: "MdSchool",
        },
        sectionSkill: {
          component: "SectionSkillOne",
          miniature: "MiniSkillOne",
          Label: "Skill",
          icon: "MdTag",
        },
        sectionLanguage: {
          component: "SectionLanguageOne",
          miniature: "MiniLanguageOne",
          Label: "Langue",
          icon: "MdLanguage",
        },
        sectionProject: {
          component: "SectionProjectOne",
          miniature: "MiniProjectOne",
          Label: "Projet",
          icon: "GoProject",
        },
        sectionSocialMedia: {
          component: "SectionSocialMediaOne",
          miniature: "MiniSocialMediaOne",
          Label: "Réseau social",
          icon: "FaGlobe",
        },
      },
    },
  },
  {
    name: "Minimal",
    structure: {
      layout: { 
        ...sharedLayout,
        withPhoto: true,
        stylePhoto: 'circle',
        listStyle: 'line',
        titleSection: {
          withIcon: true,
          iconStyle: 'flat',
          iconColor: 'primaryColor',
          textTransform: 'uppercase',
        } 
      },
      header: buildHeader(minimalTokens),
      modules: [
        buildExperienceModule(minimalTokens, { order: 1, title: "Expériences" }),
        buildEducationModule(minimalTokens, { order: 2, title: "Diplomes" }),
        buildSkillModule(minimalTokens, { order: 3, title: "Skills", design: "bars" }),
        buildDescriptionModule(minimalTokens, { order: 4, title: "Description", isActive: false }),
        buildLanguageModule(minimalTokens, { order: 5, title: "Langues", design: "bars" }),
        buildProjectModule(minimalTokens, { order: 6, title: "Projets", isActive: false }),
        buildSocialMediaModule(minimalTokens, { order: 7, title: "Réseaux sociaux", isActive: false }),
      ],
    },
    defaultStyles: { 
      primaryColor: { name: "lime", primary: "-500" }, 
      slugTemplate: "minimal-line-x" ,
      components: {
        sectionHeader: "HeaderThree",
        sectionExperience: {
          component: "SectionExperienceTwo",
          miniature: "MiniExperienceOne",
          Label: "Expérience",
          icon: "BsListCheck",
        },
        sectionDescription: {
          component: "SectionDescriptionTwo",
          miniature: "MiniDescriptionOne",
          Label: "Description",
          icon: "BsPerson",
        },
        sectionEducation: {
          component: "SectionEducationTwo",
          miniature: "MiniEducationOne",
          Label: "Diplome",
          icon: "MdSchool",
        },
        sectionSkill: {
          component: "SectionSkillTwo",
          miniature: "MiniSkillOne",
          Label: "Skill",
          icon: "MdTag",
        },
        sectionLanguage: {
          component: "SectionLanguageTwo",
          miniature: "MiniLanguageOne",
          Label: "Langue",
          icon: "MdLanguage",
        },
        sectionProject: {
          component: "SectionProjectTwo",
          miniature: "MiniProjectOne",
          Label: "Projet",
          icon: "GoProject",
        },
        sectionSocialMedia: {
          component: "SectionSocialMediaTwo",
          miniature: "MiniSocialMediaOne",
          Label: "Réseau social",
          icon: "FaGlobe",
        },
      },
    },
  },
];