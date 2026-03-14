import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { prismaTest } from '../../lib/prismaTest';
import { resetTestDB } from '../utils/setup';
import { createTestCV } from '../utils/create-test-cv';
import { Level } from '../../generated/prisma-test/client';

describe('CvLanguage model', () => {
  beforeEach(async () => {
    await resetTestDB();
  });

  afterAll(async () => {
    await prismaTest.$disconnect();
  });

  //? 5 tests pour le model CvLanguage => 5 tests ok
  //   model CvLanguage {
  //     id          String @id @default(cuid())
  //     name        String
  //     level       Level

  //     order       Int @default(0)
  //     cv          CV @relation(fields: [cvId], references: [id], onDelete: Cascade)
  //     cvId        String

  //     @@unique([cvId, name])
  //     @@unique([cvId, order])
  //     @@index([cvId])
  //   }

  //! 1️⃣ CREATE
  describe('CREATE', () => {
    it('should create language for CV', async () => {
      const { cv } = await createTestCV();

      const language = await prismaTest.cvLanguage.create({
        data: {
          name: 'English',
          level: Level.Intermédiaire,
          order: 1,
          cvId: cv.id,
        },
      });

      expect(language.name).toBe('English');
      expect(language.level).toBe(Level.Intermédiaire);
      expect(language.order).toBe(1);
    });
  });

  //! 2️⃣ UNIQUE CONSTRAINTS
  describe('UNIQUE CONSTRAINTS', () => {
    it('should not allow duplicate name in same CV', async () => {
      const { cv } = await createTestCV();

      await prismaTest.cvLanguage.create({
        data: {
          name: 'English',
          level: Level.Intermédiaire,
          order: 1,
          cvId: cv.id,
        },
      });

      await expect(
        prismaTest.cvLanguage.create({
          data: {
            name: 'English',
            level: Level.Débutant,
            order: 2,
            cvId: cv.id,
          },
        }),
      ).rejects.toThrow();
    });

    it('should not allow duplicate order in same CV', async () => {
      const { cv } = await createTestCV();

      await prismaTest.cvLanguage.create({
        data: {
          name: 'English',
          level: Level.Intermédiaire,
          order: 1,
          cvId: cv.id,
        },
      });

      await expect(
        prismaTest.cvLanguage.create({
          data: {
            name: 'French',
            level: Level.Intermédiaire,
            order: 1,
            cvId: cv.id,
          },
        }),
      ).rejects.toThrow();
    });
  });

  //! 3️⃣ RELATIONS
  describe('RELATIONS', () => {
    it('should allow same language name in different CVs', async () => {
      const { cv: cv1 } = await createTestCV();
      const { cv: cv2 } = await createTestCV();

      await prismaTest.cvLanguage.create({
        data: {
          name: 'English',
          level: Level.Intermédiaire,
          order: 1,
          cvId: cv1.id,
        },
      });

      await prismaTest.cvLanguage.create({
        data: {
          name: 'English',
          level: Level.Intermédiaire,
          order: 1,
          cvId: cv2.id,
        },
      });

      const languages = await prismaTest.cvLanguage.findMany();
      expect(languages.length).toBe(2);
    });
  });

  //! 4️⃣ CASCADE DELETE
  describe('CASCADE DELETE', () => {
    it('should delete languages when CV is deleted', async () => {
      const { cv } = await createTestCV();

      await prismaTest.cvLanguage.create({
        data: {
          name: 'English',
          level: Level.Intermédiaire,
          order: 1,
          cvId: cv.id,
        },
      });

      await prismaTest.cV.delete({
        where: { id: cv.id },
      });

      const languages = await prismaTest.cvLanguage.findMany({
        where: { cvId: cv.id },
      });

      expect(languages.length).toBe(0);
    });
  });
});
