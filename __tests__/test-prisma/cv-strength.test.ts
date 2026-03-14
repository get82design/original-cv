import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { prismaTest } from '../../lib/prismaTest';
import { resetTestDB } from '../utils/setup';
import { createTestUser } from '../utils/create-test-user';
import { createTestTemplate } from '../utils/create-test-template';
import { createTestCV } from '../utils/create-test-cv';

describe('CvStrength model', () => {
  beforeEach(async () => {
    await resetTestDB();
  });

  afterAll(async () => {
    await prismaTest.$disconnect();
  });

  //? 6 tests pour le model CvStrength => 6 tests ok
  //   model CvStrength {
  //     id          String @id @default(cuid())
  //     title       String
  //     icon        String?

  //     order       Int @default(0)
  //     cv          CV @relation(fields: [cvId], references: [id], onDelete: Cascade)
  //     cvId        String

  //     @@unique([cvId, title])
  //     @@unique([cvId, order])
  //     @@index([cvId])
  //   }

  //! 1️⃣ CREATE
  describe('CREATE', () => {
    it('should create a strength', async () => {
      const user = await createTestUser();
      const template = await createTestTemplate();
      const { cv } = await createTestCV(
        // @ts-expect-error
        { userId: user.id, templateId: template.id },
      );

      const strength = await prismaTest.cvStrength.create({
        data: {
          title: 'Leadership',
          icon: 'star',
          order: 1,
          cvId: cv.id,
        },
      });

      expect(strength.title).toBe('Leadership');
      expect(strength.icon).toBe('star');
      expect(strength.cvId).toBe(cv.id);
    });

    it('should create strength without icon', async () => {
      const user = await createTestUser();
      const template = await createTestTemplate();
      const { cv } = await createTestCV(
        // @ts-expect-error
        { userId: user.id, templateId: template.id },
      );

      const strength = await prismaTest.cvStrength.create({
        data: {
          title: 'Teamwork',
          order: 2,
          cvId: cv.id,
        },
      });

      expect(strength.icon).toBeNull();
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

      await prismaTest.cvStrength.create({
        data: {
          title: 'Leadership',
          order: 1,
          cvId: cv.id,
        },
      });

      await expect(
        prismaTest.cvStrength.create({
          data: {
            title: 'Leadership',
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

      await prismaTest.cvStrength.create({
        data: {
          title: 'Strength 1',
          order: 1,
          cvId: cv.id,
        },
      });

      await expect(
        prismaTest.cvStrength.create({
          data: {
            title: 'Strength 2',
            order: 1,
            cvId: cv.id,
          },
        }),
      ).rejects.toThrow();
    });
  });

  //! 3️⃣ UPDATE
  describe('UPDATE', () => {
    it('should update strength fields', async () => {
      const user = await createTestUser();
      const template = await createTestTemplate();
      const { cv } = await createTestCV(
        // @ts-expect-error
        { userId: user.id, templateId: template.id },
      );

      const strength = await prismaTest.cvStrength.create({
        data: {
          title: 'Old Title',
          order: 1,
          cvId: cv.id,
        },
      });

      const updated = await prismaTest.cvStrength.update({
        where: { id: strength.id },
        data: {
          title: 'New Title',
          icon: 'check',
        },
      });

      expect(updated.title).toBe('New Title');
      expect(updated.icon).toBe('check');
    });
  });

  //! 4️⃣ DELETE CASCADE
  describe('DELETE CASCADE', () => {
    it('should delete strengths when CV is deleted', async () => {
      const user = await createTestUser();
      const template = await createTestTemplate();
      const { cv } = await createTestCV(
        // @ts-expect-error
        { userId: user.id, templateId: template.id },
      );

      await prismaTest.cvStrength.create({
        data: {
          title: 'Strength',
          order: 1,
          cvId: cv.id,
        },
      });

      await prismaTest.cV.delete({
        where: { id: cv.id },
      });

      const strengths = await prismaTest.cvStrength.findMany({
        where: { cvId: cv.id },
      });

      expect(strengths.length).toBe(0);
    });
  });
});
