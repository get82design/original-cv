import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { prismaTest } from '../../lib/prismaTest';
import { resetTestDB } from '../utils/setup';
import { createTestUser } from '../utils/create-test-user';
import { createTestTemplate } from '../utils/create-test-template';
import { createTestCV } from '../utils/create-test-cv';

describe('CvAchievement model', () => {
  beforeEach(async () => {
    await resetTestDB();
  });

  afterAll(async () => {
    await prismaTest.$disconnect();
  });

  //? 5 tests pour le model CvAchievement => 5 tests ok
  //   model CvAchievement {
  //     id            String @id @default(cuid())
  //     title         String
  //     description   String?
  //     year          Int?
  //     technology    String?

  //     order         Int @default(0)
  //     cv            CV @relation(fields: [cvId], references: [id], onDelete: Cascade)
  //     cvId          String

  //     @@unique([cvId, order])
  //     @@unique([cvId, title])
  //     @@index([cvId])
  //   }

  //! 1️⃣ CREATE
  describe('CREATE', () => {
    it('should create an achievement', async () => {
      const user = await createTestUser();
      const template = await createTestTemplate();
      const { cv } = await createTestCV(
        // @ts-expect-error
        { userId: user.id, templateId: template.id },
      );

      const achievement = await prismaTest.cvAchievement.create({
        data: {
          title: 'Hackathon Winner',
          description: 'Won first place at local hackathon',
          year: 2024,
          technology: 'Next.js',
          order: 1,
          cvId: cv.id,
        },
      });

      expect(achievement.title).toBe('Hackathon Winner');
      expect(achievement.cvId).toBe(cv.id);
      expect(achievement.order).toBe(1);
    });
  });

  //! 2️⃣ UNIQUE CONSTRAINTS
  describe('UNIQUE CONSTRAINTS', () => {
    it('should not allow duplicate title in same CV', async () => {
      const user = await createTestUser();
      const template = await createTestTemplate();
      const { cv } = await createTestCV(
        // @ts-expect-error
        { userId: user.id, templateId: template.id },
      );

      await prismaTest.cvAchievement.create({
        data: {
          title: 'Hackathon Winner',
          order: 1,
          cvId: cv.id,
        },
      });

      await expect(
        prismaTest.cvAchievement.create({
          data: {
            title: 'Hackathon Winner',
            order: 2,
            cvId: cv.id,
          },
        }),
      ).rejects.toThrow();
    });

    it('should not allow duplicate order in same CV', async () => {
      const user = await createTestUser();
      const template = await createTestTemplate();
      const { cv } = await createTestCV(
        // @ts-expect-error
        { userId: user.id, templateId: template.id },
      );

      await prismaTest.cvAchievement.create({
        data: {
          title: 'Achievement 1',
          order: 1,
          cvId: cv.id,
        },
      });

      await expect(
        prismaTest.cvAchievement.create({
          data: {
            title: 'Achievement 2',
            order: 1,
            cvId: cv.id,
          },
        }),
      ).rejects.toThrow();
    });
  });

  //! 3️⃣ UPDATE
  describe('UPDATE', () => {
    it('should update achievement fields', async () => {
      const user = await createTestUser();
      const template = await createTestTemplate();
      const { cv } = await createTestCV(
        // @ts-expect-error
        { userId: user.id, templateId: template.id },
      );

      const achievement = await prismaTest.cvAchievement.create({
        data: {
          title: 'Old Title',
          order: 1,
          cvId: cv.id,
        },
      });

      const updated = await prismaTest.cvAchievement.update({
        where: { id: achievement.id },
        data: {
          title: 'New Title',
          year: 2025,
        },
      });

      expect(updated.title).toBe('New Title');
      expect(updated.year).toBe(2025);
    });
  });

  //! 4️⃣ DELETE CASCADE
  describe('DELETE CASCADE', () => {
    it('should delete achievements when CV is deleted', async () => {
      const user = await createTestUser();
      const template = await createTestTemplate();
      const { cv } = await createTestCV(
        // @ts-expect-error
        { userId: user.id, templateId: template.id },
      );

      await prismaTest.cvAchievement.create({
        data: {
          title: 'Achievement',
          order: 1,
          cvId: cv.id,
        },
      });

      await prismaTest.cV.delete({
        where: { id: cv.id },
      });

      const achievements = await prismaTest.cvAchievement.findMany({
        where: { cvId: cv.id },
      });

      expect(achievements.length).toBe(0);
    });
  });
});
