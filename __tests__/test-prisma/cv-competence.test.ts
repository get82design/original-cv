import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { prismaTest } from '../../lib/prismaTest';
import { resetTestDB } from '../utils/setup';
import { createTestUser } from '../utils/create-test-user';
import { createTestTemplate } from '../utils/create-test-template';
import { createTestCV } from '../utils/create-test-cv';

describe('CvCompetence models', () => {
  beforeEach(async () => {
    await resetTestDB();
  });

  afterAll(async () => {
    await prismaTest.$disconnect();
  });

  //? 6 tests pour le model CvCompetence => 6 tests ok
  // model Competence {
  //   id   String @id @default(cuid())
  //   name String @unique // compétences globales
  //   profileCompetences ProfileCompetence[]
  //   cvCompetences      CvCompetence[]
  // }

  // model CvCompetenceGroup {
  //   id    String @id @default(cuid())
  //   title String?
  //   order  Int @default(0)
  //   competences CvCompetence[]
  //   cv    CV @relation(fields: [cvId], references: [id], onDelete: Cascade)
  //   cvId  String
  //   @@unique([cvId, order]) // pas de doublon dans un cv
  // }

  // model CvCompetence {
  //   id           String @id @default(cuid())
  //   competence        Competence  @relation(fields: [competenceId], references: [id])
  //   competenceId      String
  //   group        CvCompetenceGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)
  //   groupId      String
  //   @@unique([groupId, competenceId]) // pas de doublon dans un groupe
  // }

  //! 1- CREATE TESTS
  describe('CREATE', () => {
    it('should create a global competence and link to CV competence', async () => {
      const user = await createTestUser();
      const template = await createTestTemplate();
      const { cv } = await createTestCV(
        // @ts-expect-error
        { userId: user.id, templateId: template.id },
      );

      // Créer la compétence globale
      const competence = await prismaTest.competence.create({
        data: { name: 'JavaScript' },
      });

      // Créer un groupe de compétences pour le CV
      const group = await prismaTest.cvCompetenceGroup.create({
        data: { cvId: cv.id, title: 'Tech Skills', order: 1 },
      });

      // Ajouter la compétence au groupe
      const cvCompetence = await prismaTest.cvCompetence.create({
        data: { groupId: group.id, competenceId: competence.id },
      });

      expect(cvCompetence.groupId).toBe(group.id);
      expect(cvCompetence.competenceId).toBe(competence.id);
    });

    it('should allow multiple competences in one group', async () => {
      const user = await createTestUser();
      const template = await createTestTemplate();
      const { cv } = await createTestCV(
        // @ts-expect-error
        { userId: user.id, templateId: template.id },
      );

      const c1 = await prismaTest.competence.create({ data: { name: 'JavaScript' } });
      const c2 = await prismaTest.competence.create({ data: { name: 'TypeScript' } });

      const group = await prismaTest.cvCompetenceGroup.create({
        data: { cvId: cv.id, title: 'Tech', order: 1 },
      });

      await prismaTest.cvCompetence.create({ data: { groupId: group.id, competenceId: c1.id } });
      await prismaTest.cvCompetence.create({ data: { groupId: group.id, competenceId: c2.id } });

      const competences = await prismaTest.cvCompetence.findMany({ where: { groupId: group.id } });
      expect(competences.length).toBe(2);
    });
  });

  //! 2- UNIQUE / ERROR TESTS
  describe('CREATE ERRORS', () => {
    it('should not allow duplicate competence in same group', async () => {
      const user = await createTestUser();
      const template = await createTestTemplate();
      const { cv } = await createTestCV(
        // @ts-expect-error
        { userId: user.id, templateId: template.id },
      );

      const competence = await prismaTest.competence.create({ data: { name: 'JavaScript' } });
      const group = await prismaTest.cvCompetenceGroup.create({ data: { cvId: cv.id, order: 1 } });

      await prismaTest.cvCompetence.create({
        data: { groupId: group.id, competenceId: competence.id },
      });

      await expect(
        prismaTest.cvCompetence.create({
          data: { groupId: group.id, competenceId: competence.id },
        }),
      ).rejects.toThrow();
    });

    it('should not allow duplicate group order in same CV', async () => {
      const user = await createTestUser();
      const template = await createTestTemplate();
      const { cv } = await createTestCV(
        // @ts-expect-error
        { userId: user.id, templateId: template.id },
      );

      await prismaTest.cvCompetenceGroup.create({ data: { cvId: cv.id, order: 1 } });

      await expect(
        prismaTest.cvCompetenceGroup.create({ data: { cvId: cv.id, order: 1 } }),
      ).rejects.toThrow();
    });
  });

  //! 3- DELETE TESTS
  describe('DELETE', () => {
    it('should delete CV competences when group is deleted', async () => {
      const user = await createTestUser();
      const template = await createTestTemplate();
      const { cv } = await createTestCV(
        // @ts-expect-error
        { userId: user.id, templateId: template.id },
      );

      const competence = await prismaTest.competence.create({ data: { name: 'JavaScript' } });
      const group = await prismaTest.cvCompetenceGroup.create({ data: { cvId: cv.id, order: 1 } });
      await prismaTest.cvCompetence.create({
        data: { groupId: group.id, competenceId: competence.id },
      });

      await prismaTest.cvCompetenceGroup.delete({ where: { id: group.id } });

      const competences = await prismaTest.cvCompetence.findMany({ where: { groupId: group.id } });
      expect(competences.length).toBe(0);
    });

    it('should delete groups when CV is deleted', async () => {
      const user = await createTestUser();
      const template = await createTestTemplate();
      const { cv } = await createTestCV(
        // @ts-expect-error
        { userId: user.id, templateId: template.id },
      );

      await prismaTest.cvCompetenceGroup.create({ data: { cvId: cv.id, order: 1 } });

      await prismaTest.cV.delete({ where: { id: cv.id } });

      const groups = await prismaTest.cvCompetenceGroup.findMany({ where: { cvId: cv.id } });
      expect(groups.length).toBe(0);
    });
  });
});
