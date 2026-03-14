import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { prismaTest } from '../../lib/prismaTest';
import { resetTestDB } from '../utils/setup';
import { createTestUser } from '../utils/create-test-user';
import { createTestTemplate } from '../utils/create-test-template';
import { createTestCV } from '../utils/create-test-cv';

describe('CvProject model', () => {
  beforeEach(async () => {
    await resetTestDB();
  });

  afterAll(async () => {
    await prismaTest.$disconnect();
  });

  //? 6 tests pour le model CvProject => 6 tests ok
  //   model CvProject {
  //     id          String @id @default(cuid())
  //     title       String
  //     description String?
  //     location    String?
  //     start       DateTime
  //     end         DateTime?
  //     technology  String?
  //     cvMissions    CvMissionProject[]

  //     order       Int @default(0)
  //     cv          CV @relation(fields: [cvId], references: [id], onDelete: Cascade)
  //     cvId        String

  //     @@unique([cvId, title])
  //     @@unique([cvId, order])
  //     @@index([cvId])
  //   }

  //   model CvMissionProject {
  //     id          String      @id @default(cuid())
  //     content     String

  //     cvProject  CvProject  @relation(fields: [cvProjectId], references: [id], onDelete: Cascade)
  //     cvProjectId String

  //     @@index([cvProjectId])
  //   }

  //! 1️⃣ CREATE
  describe('CREATE', () => {
    it('should create project', async () => {
      const user = await createTestUser();
      const template = await createTestTemplate();
      const { cv } = await createTestCV(
        // @ts-expect-error
        { userId: user.id, templateId: template.id },
      );

      const project = await prismaTest.cvProject.create({
        data: {
          title: 'Portfolio Website',
          start: new Date('2023-01-01'),
          order: 1,
          cvId: cv.id,
        },
      });

      expect(project.title).toBe('Portfolio Website');
    });

    it('should create project with optional fields', async () => {
      const user = await createTestUser();
      const template = await createTestTemplate();
      const { cv } = await createTestCV(
        // @ts-expect-error
        { userId: user.id, templateId: template.id },
      );

      const project = await prismaTest.cvProject.create({
        data: {
          title: 'Mobile App',
          description: 'React Native app',
          location: 'Remote',
          start: new Date('2022-01-01'),
          end: new Date('2022-12-01'),
          technology: 'React Native',
          order: 2,
          cvId: cv.id,
        },
      });

      expect(project.description).toBe('React Native app');
      expect(project.technology).toBe('React Native');
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

      await prismaTest.cvProject.create({
        data: {
          title: 'Project A',
          start: new Date(),
          order: 1,
          cvId: cv.id,
        },
      });

      await expect(
        prismaTest.cvProject.create({
          data: {
            title: 'Project A',
            start: new Date(),
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

      await prismaTest.cvProject.create({
        data: {
          title: 'Project A',
          start: new Date(),
          order: 1,
          cvId: cv.id,
        },
      });

      await expect(
        prismaTest.cvProject.create({
          data: {
            title: 'Project B',
            start: new Date(),
            order: 1,
            cvId: cv.id,
          },
        }),
      ).rejects.toThrow();
    });
  });

  //! 3️⃣ MISSIONS RELATION
  describe('MISSIONS RELATION', () => {
    it('should create mission for project', async () => {
      const user = await createTestUser();
      const template = await createTestTemplate();
      const { cv } = await createTestCV(
        // @ts-expect-error
        { userId: user.id, templateId: template.id },
      );

      const project = await prismaTest.cvProject.create({
        data: {
          title: 'Project X',
          start: new Date(),
          order: 1,
          cvId: cv.id,
        },
      });

      const mission = await prismaTest.cvMissionProject.create({
        data: {
          content: 'Built authentication system',
          cvProjectId: project.id,
        },
      });

      expect(mission.cvProjectId).toBe(project.id);
    });

    it('should delete missions when project is deleted', async () => {
      const user = await createTestUser();
      const template = await createTestTemplate();
      const { cv } = await createTestCV(
        // @ts-expect-error
        { userId: user.id, templateId: template.id },
      );

      const project = await prismaTest.cvProject.create({
        data: {
          title: 'Project Y',
          start: new Date(),
          order: 1,
          cvId: cv.id,
        },
      });

      await prismaTest.cvMissionProject.create({
        data: {
          content: 'Mission 1',
          cvProjectId: project.id,
        },
      });

      await prismaTest.cvProject.delete({
        where: { id: project.id },
      });

      const missions = await prismaTest.cvMissionProject.findMany({
        where: { cvProjectId: project.id },
      });

      expect(missions.length).toBe(0);
    });
  });
});
