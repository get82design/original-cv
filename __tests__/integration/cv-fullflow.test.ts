import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { prismaTest } from '../../lib/prismaTest';
import { resetTestDB } from '../utils/setup';
import { createTestUserWithTemplateAndCV } from '../utils/create-test-user-with-template-and-cv';
import { Level } from '../../generated/prisma-test/enums';

describe('CV FULL FLOW', () => {
  beforeEach(async () => {
    await resetTestDB();
  });

  afterAll(async () => {
    await prismaTest.$disconnect();
  });

  it('should create a complete CV with all modules and relations', async () => {
    const { cv } = await createTestUserWithTemplateAndCV();

    // ========================
    // HEADER
    // ========================
    await prismaTest.cvHeader.create({
      data: {
        cvId: cv.id,
        title: 'Developer',
        subtitle: 'Fullstack',
        phone: '123',
        email: 'test@test.com',
        location: 'Paris',
        portfolio: 'portfolio.com',
        nom: 'Doe',
        prenom: 'John',
      },
    });

    // ========================
    // DESCRIPTION
    // ========================
    await prismaTest.cvDescription.create({
      data: {
        cvId: cv.id,
        description: 'Passionate developer',
      },
    });

    // ========================
    // SKILLS
    // ========================
    const skill = await prismaTest.skill.create({
      data: { name: 'JavaScript' },
    });

    const skillGroup = await prismaTest.cvSkillGroup.create({
      data: { cvId: cv.id, title: 'Tech', order: 1 },
    });

    await prismaTest.cvSkill.create({
      data: {
        groupId: skillGroup.id,
        skillId: skill.id,
        level: Level.Expert,
      },
    });

    // ========================
    // COMPETENCES
    // ========================
    const competence = await prismaTest.competence.create({
      data: { name: 'Leadership' },
    });

    const competenceGroup = await prismaTest.cvCompetenceGroup.create({
      data: { cvId: cv.id, title: 'Soft', order: 1 },
    });

    await prismaTest.cvCompetence.create({
      data: {
        groupId: competenceGroup.id,
        competenceId: competence.id,
      },
    });

    // ========================
    // EXPERIENCE
    // ========================
    const experience = await prismaTest.cvExperience.create({
      data: {
        cvId: cv.id,
        title: 'Dev',
        company: 'Google',
        start: new Date(),
        order: 1,
      },
    });

    await prismaTest.cvMissionExperience.create({
      data: {
        cvExperienceId: experience.id,
        content: 'Built stuff',
      },
    });

    // ========================
    // EDUCATION
    // ========================
    await prismaTest.cvEducation.create({
      data: {
        cvId: cv.id,
        school: 'MIT',
        degree: 'CS',
        start: new Date(),
        order: 1,
      },
    });

    // ========================
    // ACHIEVEMENT
    // ========================
    await prismaTest.cvAchievement.create({
      data: {
        cvId: cv.id,
        title: 'Hackathon Winner',
        order: 1,
      },
    });

    // ========================
    // STRENGTH
    // ========================
    await prismaTest.cvStrength.create({
      data: {
        cvId: cv.id,
        title: 'Team player',
        order: 1,
      },
    });

    // ========================
    // VOLUNTEERING
    // ========================
    const volunteering = await prismaTest.cvVolunteering.create({
      data: {
        cvId: cv.id,
        title: 'NGO Work',
        organisation: 'Red Cross',
        start: new Date(),
        order: 1,
      },
    });

    await prismaTest.cvMissionVolunteering.create({
      data: {
        cvVolunteeringId: volunteering.id,
        content: 'Helped people',
      },
    });

    // ========================
    // PROJECT
    // ========================
    const project = await prismaTest.cvProject.create({
      data: {
        cvId: cv.id,
        title: 'My App',
        start: new Date(),
        order: 1,
      },
    });

    await prismaTest.cvMissionProject.create({
      data: {
        cvProjectId: project.id,
        content: 'Built API',
      },
    });

    // ========================
    // PUBLICATION
    // ========================
    await prismaTest.cvPublication.create({
      data: {
        cvId: cv.id,
        title: 'Research Paper',
        start: new Date(),
        order: 1,
      },
    });

    // ========================
    // LANGUAGE
    // ========================
    await prismaTest.cvLanguage.create({
      data: {
        cvId: cv.id,
        name: 'English',
        level: Level.Expert,
        order: 1,
      },
    });

    // ========================
    // PASSION
    // ========================
    await prismaTest.cvPassion.create({
      data: {
        cvId: cv.id,
        title: 'Music',
        icon: '🎵',
        order: 1,
      },
    });

    // ========================
    // FINAL CHECK
    // ========================
    const fullCV = await prismaTest.cV.findUnique({
      where: { id: cv.id },
      include: {
        headerCv: true,
        description: true,
        skillGroups: { include: { skills: { include: { skill: true } } } },
        competences: { include: { cvCompetences: { include: { competence: true } } } },
        experiences: { include: { cvMissions: true } },
        educations: true,
        achievements: true,
        strengths: true,
        volunteerings: { include: { cvMissions: true } },
        projects: { include: { cvMissions: true } },
        publications: true,
        languages: true,
        passions: true,
      },
    });

    expect(fullCV).not.toBeNull();
    expect(fullCV!.skillGroups.length).toBe(1);
    expect(fullCV!.experiences.length).toBe(1);
    expect(fullCV!.projects.length).toBe(1);
  });

  it('should delete the full CV and cascade everything', async () => {
    const { cv } = await createTestUserWithTemplateAndCV();

    await prismaTest.cvHeader.create({
      data: {
        cvId: cv.id,
        title: 't',
        subtitle: 't',
        phone: 't',
        email: 't',
        location: 't',
        portfolio: 't',
        nom: 't',
        prenom: 't',
      },
    });

    await prismaTest.cV.delete({ where: { id: cv.id } });

    const header = await prismaTest.cvHeader.findMany();
    expect(header.length).toBe(0);
  });
});
