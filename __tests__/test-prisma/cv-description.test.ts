import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { prismaTest } from '../../lib/prismaTest';
import { resetTestDB } from '../utils/setup';
import { createTestUserWithTemplateAndCV } from '../utils/create-test-user-with-template-and-cv';

describe('CvDescription model', () => {
  beforeEach(async () => {
    await resetTestDB();
  });

  afterAll(async () => {
    await prismaTest.$disconnect();
  });

  //? 7 tests pour le model CvDescription => 7 tests ok
  //   model CvDescription {
  //     id          String @id @default(cuid())
  //     description String

  //     cv          CV @relation(fields: [cvId], references: [id], onDelete: Cascade)
  //     cvId        String @unique
  //   }

  //! 1- CREATE TESTS
  describe('CREATE', () => {
    // 1-1: créer une description pour un CV
    it('should create a CvDescription for a CV', async () => {
      const { user, template } = await createTestUserWithTemplateAndCV();

      const cv = await prismaTest.cV.create({
        data: { title: 'Mon CV', userId: user.id, templateId: template.id },
      });

      const description = await prismaTest.cvDescription.create({
        data: {
          description: 'Développeur Fullstack passionné',
          cvId: cv.id,
        },
      });

      expect(description.cvId).toBe(cv.id);
      expect(description.description).toBe('Développeur Fullstack passionné');
    });

    // 1-2: ne pas pouvoir créer une description sans un CV
    it('should not create CvDescription without a CV', async () => {
      await expect(
        prismaTest.cvDescription.create({
          data: {
            description: 'Test',
            cvId: 'fake-cv-id',
          },
        }),
      ).rejects.toThrow();
    });

    // 1-3: ne pas pouvoir créer deux descriptions pour le même CV
    it('should not create two descriptions for the same CV', async () => {
      const { user, template } = await createTestUserWithTemplateAndCV();

      const cv = await prismaTest.cV.create({
        data: { title: 'CV 1', userId: user.id, templateId: template.id },
      });

      await prismaTest.cvDescription.create({
        data: { description: 'Desc 1', cvId: cv.id },
      });

      await expect(
        prismaTest.cvDescription.create({
          data: { description: 'Desc 2', cvId: cv.id },
        }),
      ).rejects.toThrow(); // @@unique(cvId)
    });
  });

  //! 2- UPDATE TESTS
  describe('UPDATE', () => {
    // 2-1: mettre à jour le texte d'une description
    it('should update CvDescription text', async () => {
      const { user, template } = await createTestUserWithTemplateAndCV();
      const cv = await prismaTest.cV.create({
        data: { title: 'CV 1', userId: user.id, templateId: template.id },
      });

      const description = await prismaTest.cvDescription.create({
        data: { description: 'Junior Dev', cvId: cv.id },
      });

      const updated = await prismaTest.cvDescription.update({
        where: { id: description.id },
        data: { description: 'Senior Dev' },
      });

      expect(updated.description).toBe('Senior Dev');
    });
  });

  //! 3- DELETE TESTS
  describe('DELETE', () => {
    // 3-1: supprimer une description lorsque le CV est supprimé
    it('should delete CvDescription when CV is deleted', async () => {
      const { user, template } = await createTestUserWithTemplateAndCV();
      const cv = await prismaTest.cV.create({
        data: { title: 'CV', userId: user.id, templateId: template.id },
      });

      const description = await prismaTest.cvDescription.create({
        data: { description: 'Dev passionné', cvId: cv.id },
      });

      await prismaTest.cV.delete({ where: { id: cv.id } });

      const fetched = await prismaTest.cvDescription.findUnique({
        where: { id: description.id },
      });

      expect(fetched).toBeNull();
    });

    // 3-2 supprimer une description
    it('should delete CvDescription', async () => {
      const { user, template } = await createTestUserWithTemplateAndCV();
      const cv = await prismaTest.cV.create({
        data: { title: 'CV', userId: user.id, templateId: template.id },
      });
      const description = await prismaTest.cvDescription.create({
        data: { description: 'Dev Passionné', cvId: cv.id },
      });
      await prismaTest.cvDescription.delete({ where: { id: description.id } });
      const fetched = await prismaTest.cvDescription.findUnique({
        where: { id: description.id },
      });
      expect(fetched).toBeNull();
      const fetchedCV = await prismaTest.cV.findUnique({
        where: { id: cv.id },
        include: { description: true },
      });
      expect(fetchedCV!.description).toBeNull();
    });
  });

  //! 4- RELATIONS TESTS
  describe('RELATIONS', () => {
    // 4-1: lier une description à un CV
    it('should link description to correct CV', async () => {
      const { user, template } = await createTestUserWithTemplateAndCV();
      const cv = await prismaTest.cV.create({
        data: { title: 'CV', userId: user.id, templateId: template.id },
      });

      const description = await prismaTest.cvDescription.create({
        data: { description: 'Dev Passionné', cvId: cv.id },
      });

      const fetched = await prismaTest.cvDescription.findUnique({
        where: { id: description.id },
        include: { cv: true },
      });

      expect(fetched!.cv.id).toBe(cv.id);
    });
  });
});
