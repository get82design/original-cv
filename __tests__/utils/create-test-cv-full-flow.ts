// __tests__/integration/helpers/cvFullflowUtils.ts
import type { CVModuleItemType, CVModuleType } from '../../generated/prisma-test/client';
import { Level } from '../../generated/prisma-test/enums';
import { prismaTest } from '../../lib/prismaTest';

export async function createUserAndTemplate(email = 'test@fullflow.com') {
  const user = await prismaTest.user.create({
    data: { email, name: 'Fullflow User', password: '123' },
  });
  const template = await prismaTest.cVTemplate.create({
    data: { name: 'Modern', structure: {}, defaultStyles: {} },
  });
  return { user, template };
}

export async function createCV(userId: string, templateId: string, title = 'Fullflow CV') {
  return prismaTest.cV.create({
    data: { title, userId, templateId },
  });
}

export async function createModule(
  cvId: string,
  type: CVModuleType,
  order: number,
  title?: string,
) {
  return prismaTest.cVModule.create({
    data: { cvId, type, order, title: title ?? null },
  });
}

export async function createModuleItem(
  moduleId: string,
  itemType: CVModuleItemType,
  itemId: string,
) {
  return prismaTest.cVModuleItem.create({
    data: { moduleId, itemType, itemId: itemId },
  });
}

// === SKILLS ===
export async function createSkillGroup(cvId: string, title: string, order: number) {
  return prismaTest.cvSkillGroup.create({ data: { cvId, title, order } });
}

export async function createSkill(skillName: string) {
  return prismaTest.skill.create({ data: { name: skillName } });
}

export async function addSkillToGroup(skillId: string, groupId: string, level: Level) {
  return prismaTest.cvSkill.create({
    data: { skillId, groupId, level: level ?? Level.Intermédiaire },
  });
}

// === COMPETENCES ===
export async function createCompetenceGroup(cvId: string, title: string, order: number) {
  return prismaTest.cvCompetenceGroup.create({ data: { cvId, title, order } });
}

export async function createCompetence(competenceName: string) {
  return prismaTest.competence.create({ data: { name: competenceName } });
}

export async function addCompetenceToGroup(competenceId: string, groupId: string) {
  return prismaTest.cvCompetence.create({ data: { competenceId, groupId } });
}

// === HEADER ===
export async function createHeader(
  cvId: string,
  title: string,
  subtitle: string,
  phone: string,
  email: string,
  location: string,
  portfolio: string,
  nom: string,
  prenom: string,
) {
  return prismaTest.cvHeader.create({
    data: { cvId, title, subtitle, phone, email, location, portfolio, nom, prenom },
  });
}

// === DESCRIPTION ===
export async function createDescription(cvId: string, description: string) {
  return prismaTest.cvDescription.create({ data: { cvId, description } });
}

//! manque les champs optionnel
// === EDUCATIONS ===
export async function createEducation(
  cvId: string,
  title: string,
  school: string,
  degree: string,
  start: Date,
  end: Date,
  city: string,
  obtained: boolean,
  order: number,
) {
  return prismaTest.cvEducation.create({
    data: { cvId, title, school, degree, start, end, city, obtained, order },
  });
}

// === EXPERIENCES ===
export async function createExperience(
  cvId: string,
  title: string,
  company: string,
  start: Date,
  order: number,
  end?: Date | null,
  description?: string | null,
  location?: string | null,
) {
  return prismaTest.cvExperience.create({
    data: {
      cvId,
      title,
      company,
      start,
      end: end ?? null,
      location: location ?? null,
      description: description ?? null,
      order,
    },
  });
}

export async function createMissionExperience(cvExperienceId: string, content: string) {
  return prismaTest.cvMissionExperience.create({
    data: { cvExperienceId, content },
  });
}

// === ACHIEVEMENTS ===
export async function createAchievement(
  cvId: string,
  title: string,
  order: number,
  description?: string | null,
  year?: number | null,
  technology?: string | null,
) {
  return prismaTest.cvAchievement.create({
    data: {
      cvId,
      title,
      description: description ?? null,
      year: year ?? null,
      technology: technology ?? null,
      order,
    },
  });
}

// === EXPERTISES ===
export async function createExpertise(cvId: string, title: string, level: Level, order: number) {
  return prismaTest.cvExpertise.create({ data: { cvId, title, level, order } });
}

// === CERTIFICATIONS ===
export async function createCertification(
  cvId: string,
  title: string,
  order: number,
  organismeCertification?: string | null,
) {
  return prismaTest.cvCertification.create({
    data: { cvId, title, organismeCertification: organismeCertification ?? null, order },
  });
}

// === FORMATIONS ===
export async function createFormation(
  cvId: string,
  title: string,
  start: Date,
  order: number,
  organismeFormation?: string | null,
  end?: Date | null,
) {
  return prismaTest.cvFormation.create({
    data: {
      cvId,
      title,
      organismeFormation: organismeFormation ?? null,
      start,
      end: end ?? null,
      order,
    },
  });
}

// === LANGUAGES ===
export async function createLanguage(cvId: string, name: string, level: Level, order: number) {
  return prismaTest.cvLanguage.create({ data: { cvId, name, level, order } });
}

// === PASSIONS ===
export async function createPassion(cvId: string, title: string, icon: string, order: number) {
  return prismaTest.cvPassion.create({ data: { cvId, title, icon, order } });
}

// === PHILOSOPHIES ===
export async function createPhilosophy(cvId: string, citation: string, author?: string | null) {
  return prismaTest.cvPhilosophy.create({ data: { cvId, citation, author: author ?? null } });
}

// === PRICES ===
export async function createPrice(
  cvId: string,
  title: string,
  domaine: string,
  order: number,
  icon?: string | null,
) {
  return prismaTest.cvPrice.create({ data: { cvId, title, domaine, icon: icon ?? null, order } });
}

// === PROJECTS ===
export async function createProject(
  cvId: string,
  title: string,
  start: Date,
  order: number,
  description?: string | null,
  location?: string | null,
  technology?: string | null,
  end?: Date | null,
) {
  return prismaTest.cvProject.create({
    data: {
      cvId,
      title,
      description: description ?? null,
      location: location ?? null,
      start,
      end: end ?? null,
      technology: technology ?? null,
      order,
    },
  });
}

export async function createMissionProject(cvProjectId: string, content: string) {
  return prismaTest.cvMissionProject.create({ data: { cvProjectId, content } });
}

// === PUBLICATIONS ===
export async function createPublication(
  cvId: string,
  title: string,
  start: Date,
  order: number,
  description?: string | null,
  journalName?: string | null,
  end?: Date | null,
  url?: string | null,
) {
  return prismaTest.cvPublication.create({
    data: {
      cvId,
      title,
      description: description ?? null,
      journalName: journalName ?? null,
      start,
      end: end ?? null,
      url: url ?? null,
      order,
    },
  });
}

// === SOCIAL MEDIA ===
export async function createSocialMedia(
  cvId: string,
  socialNetwork: string,
  username: string,
  order: number,
) {
  return prismaTest.cvSocialMedia.create({ data: { cvId, socialNetwork, username, order } });
}

// === STRENGTHS ===
export async function createStrength(
  cvId: string,
  title: string,
  order: number,
  icon?: string | null,
) {
  return prismaTest.cvStrength.create({ data: { cvId, title, icon: icon ?? null, order } });
}

// === VOLUNTEERING ===
export async function createVolunteering(
  cvId: string,
  title: string,
  organisation: string,
  order: number,
  start: Date,
  //   missions: string[],
  description?: string | null,
  end?: Date | null,
  location?: string | null,
) {
  return prismaTest.cvVolunteering.create({
    data: {
      cvId,
      title,
      organisation,
      description: description ?? null,
      start,
      end: end ?? null,
      location: location ?? null,
      //   missions,
      order,
    },
  });
}

export async function createMissionVolunteering(cvVolunteeringId: string, content: string) {
  return prismaTest.cvMissionVolunteering.create({ data: { cvVolunteeringId, content } });
}
