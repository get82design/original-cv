import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestUserWithProfile } from '../utils/create-test-user-with-profile';
import { resetTestDB } from '../utils/setup';
import { prismaTest } from '../../lib/prismaTest';

describe('Volunteering model', () => {
  // Nettoyage DB avant chaque test
  beforeEach(async () => {
    await resetTestDB();
  });

  afterAll(async () => {
    await prismaTest.$disconnect();
  });

  //? 21 tests pour le model Volunteering => 21 tests ok
  // model Volunteering {
  //   id          String @id @default(cuid())
  //   title       String
  //   organisation String
  //   description String?
  //   start       DateTime
  //   end         DateTime?
  //   location    String?
  //   missions    MissionVolunteering[]

  //   order       Int @default(0)
  //   profile     Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  //   profileId   String

  //   @@unique([profileId, title])
  //   @@unique([profileId, order]) // pas de doublon dans un profile
  //   @@index([profileId])
  // }

  //! 1- CREATE TESTS
  describe('CREATE', () => {
    // 1-1: peut créer un profile avec des benevolats
    it('should create a profile with volunteerings', async () => {
      const user = await createTestUserWithProfile({
        volunteerings: [
          {
            title: 'Benevolats 1',
            organisation: 'Organisation 1',
            description: 'Description 1',
            start: new Date(),
            end: new Date(),
            location: 'location 1',
            missions: ['mission 1'],
            order: 1,
          },
        ],
      });
      const volunteering = user.profile!.volunteerings![0]!;
      expect(volunteering.title).toBe('Benevolats 1');
      expect(volunteering.organisation).toBe('Organisation 1');
      expect(volunteering.description).toBe('Description 1');
      expect(volunteering.location).toBe('location 1');
      expect(volunteering.order).toBe(1);
    });

    // 1-2: peut créer un benevolats sans location si optional
    it('should create volunteering without icon if optional', async () => {
      const user = await createTestUserWithProfile({
        volunteerings: [
          {
            title: 'Benevolats 1',
            organisation: 'Organisation 1',
            description: 'Description 1',
            start: new Date(),
            end: new Date(),
            missions: ['mission 1'],
            order: 1,
          },
        ],
      });

      const volunteering = user.profile.volunteerings![0];
      expect(volunteering!.location).toBeNull();
    });

    // 1-3: peut créer un benevolats sans end si optional
    it('should allow volunteering without end date', async () => {
      const user = await createTestUserWithProfile({
        volunteerings: [
          {
            title: 'Benevolats 1',
            organisation: 'Organisation 1',
            description: 'Description 1',
            start: new Date(),
            missions: [],
            order: 1,
          },
        ],
      });

      const volunteering = user.profile.volunteerings![0];
      expect(volunteering!.end).toBeNull();
    });

    // 1-4: tester le champ mission
    it('should store missions as array', async () => {
      const user = await createTestUserWithProfile({
        volunteerings: [
          {
            title: 'Benevolats 1',
            organisation: 'Organisation 1',
            description: 'Description 1',
            start: new Date(),
            end: new Date(),
            missions: ['mission 1', 'mission 2'],
            order: 1,
          },
        ],
      });

      const volunteering = user.profile.volunteerings![0];
      expect(volunteering!.missions.length).toBe(2);
      const missionContents = volunteering!.missions.map((m) => m.content);
      expect(missionContents).toContain('mission 1');
      expect(missionContents).toContain('mission 2');
    });
  });

  //! 2- CREATE ERROR TESTS
  describe('CREATE ERRORS', () => {
    // 2-1: ne peut pas créer un benevolat sans un profile
    it('should not create an volunteering without a profile', async () => {
      await expect(
        prismaTest.volunteering.create({
          data: {
            title: 'Benevolats 1',
            organisation: 'Organisation 1',
            description: 'Description 1',
            start: new Date(),
            end: new Date(),
            location: 'location 1',
            order: 1,
            profile: { connect: { id: 'non-existing-id' } },
          },
        }),
      ).rejects.toThrow();
    });

    // 2-2: ne peut pas créer un benevolat sans un title
    it('should not create an volunteering without a title', async () => {
      const user = await createTestUserWithProfile();
      await expect(
        prismaTest.volunteering.create({
          // @ts-expect-error - title is required
          data: {
            organisation: 'Organisation 1',
            description: 'Description 1',
            start: new Date(),
            end: new Date(),
            location: 'location 1',
            order: 1,
            profile: { connect: { id: user.profile.id } },
          },
        }),
      ).rejects.toThrow();
    });

    // 2-3: ne peut pas créer un benevolat avec un order déjà existant
    it('should not allow duplicate order for same profile', async () => {
      const user = await createTestUserWithProfile({
        volunteerings: [
          {
            title: 'Benevolats 1',
            organisation: 'Organisation 1',
            description: 'Description 1',
            start: new Date(),
            end: new Date(),
            location: 'location 1',
            missions: [],
            order: 1,
          },
        ],
      });

      await expect(
        prismaTest.volunteering.create({
          data: {
            title: 'Benevolats 2',
            organisation: 'Organisation 2',
            description: 'Description 2',
            start: new Date(),
            end: new Date(),
            location: 'location 2',
            order: 1,
            profile: { connect: { id: user.profile.id } },
          },
        }),
      ).rejects.toThrow();
    });

    // 2-4: ne peut pas duplicate le title lors d'un create
    it('should not allow duplicate title for same profile', async () => {
      const user = await createTestUserWithProfile({
        volunteerings: [
          {
            title: 'Same title',
            organisation: 'Org 1',
            start: new Date(),
            missions: [],
            order: 1,
          },
        ],
      });

      await expect(
        prismaTest.volunteering.create({
          data: {
            title: 'Same title',
            organisation: 'Org 2',
            start: new Date(),
            // missions: [],
            order: 2,
            profile: { connect: { id: user.profile.id } },
          },
        }),
      ).rejects.toThrow(/Unique constraint failed/);
    });

    // 2-5: ne peut pas créer un benevolat sans organisation
    it('should not create volunteering without organisation', async () => {
      const user = await createTestUserWithProfile();

      await expect(
        prismaTest.volunteering.create({
          // @ts-expect-error
          data: {
            title: 'Test',
            start: new Date(),
            order: 1,
            profile: { connect: { id: user.profile.id } },
          },
        }),
      ).rejects.toThrow();
    });

    // 2-6: ne peut pas créer un benevolat sans start date
    it('should not create volunteering without start date', async () => {
      const user = await createTestUserWithProfile();

      await expect(
        prismaTest.volunteering.create({
          // @ts-expect-error
          data: {
            title: 'Test',
            organisation: 'Org',
            order: 1,
            profile: { connect: { id: user.profile.id } },
          },
        }),
      ).rejects.toThrow();
    });

    // 2-7: ne peut pas créer un benevolat avec une date de fin avant la date de début
    // it('should not allow end date before start date', async () => {
    //   const user = await createTestUserWithProfile();

    //   await expect(
    //     prismaTest.volunteering.create({
    //       data: {
    //         title: 'Invalid dates',
    //         organisation: 'Org',
    //         start: new Date('2024-01-01'),
    //         end: new Date('2020-01-01'),
    //         order: 1,
    //         profile: { connect: { id: user.profile.id } },
    //       },
    //     }),
    //   ).rejects.toThrow();
    // });
  });

  //! 3- UPDATE TESTS
  describe('UPDATE', () => {
    // 3-1: peut mettre à jour un benevolat
    it('should update a volunteering', async () => {
      const user = await createTestUserWithProfile({
        volunteerings: [
          {
            title: 'Benevolats 1',
            organisation: 'Organisation 1',
            description: 'Description 1',
            start: new Date(),
            end: new Date(),
            location: 'location 1',
            missions: ['mission 1'],
            order: 1,
          },
        ],
      });
      const volunteering = await prismaTest.volunteering.update({
        where: { id: user.profile.volunteerings![0]!.id },
        data: { title: 'Benevolats 2' },
      });
      expect(volunteering.title).toBe('Benevolats 2');
    });

    // 3-2: tester la mise à jour partielle d'un benevolat
    it('should update only provided fields', async () => {
      const user = await createTestUserWithProfile({
        volunteerings: [
          {
            title: 'Test',
            organisation: 'Org',
            description: 'Desc',
            start: new Date(),
            end: new Date(),
            missions: [],
            order: 1,
          },
        ],
      });

      await prismaTest.volunteering.update({
        where: { id: user.profile.volunteerings![0]!.id },
        data: { location: 'Paris' },
      });

      const updated = await prismaTest.volunteering.findUnique({
        where: { id: user.profile.volunteerings![0]!.id },
      });

      expect(updated!.title).toBe('Test');
      expect(updated!.location).toBe('Paris');
    });
  });

  //! 4- UPDATE ERROR TESTS
  describe('UPDATE ERRORS', () => {
    // 4-1: ne peut pas duplicate le title lors d'un update
    it('should not allow duplicate title on update', async () => {
      const user = await createTestUserWithProfile({
        volunteerings: [
          {
            title: 'A',
            organisation: 'Org',
            start: new Date(),
            missions: [],
            order: 1,
          },
          {
            title: 'B',
            organisation: 'Org',
            start: new Date(),
            missions: [],
            order: 2,
          },
        ],
      });

      await expect(
        prismaTest.volunteering.update({
          where: { id: user.profile.volunteerings![1]!.id },
          data: { title: 'A' },
        }),
      ).rejects.toThrow(/Unique constraint failed/);
    });

    // 4-2: ne peut pas duplicate le order lors d'un update
    it('should not allow duplicate order on update', async () => {
      const user = await createTestUserWithProfile({
        volunteerings: [
          {
            title: 'A',
            organisation: 'Org',
            start: new Date(),
            missions: [],
            order: 1,
          },
          {
            title: 'B',
            organisation: 'Org',
            start: new Date(),
            missions: [],
            order: 2,
          },
        ],
      });

      await expect(
        prismaTest.volunteering.update({
          where: { id: user.profile.volunteerings![1]!.id },
          data: { order: 1 },
        }),
      ).rejects.toThrow(/Unique constraint failed/);
    });
  });

  //! 5- DELETE TESTS
  describe('DELETE', () => {
    // 5-1: peut supprimer un benevolat
    it('should delete an volunteering', async () => {
      const user = await createTestUserWithProfile({
        volunteerings: [
          {
            title: 'Benevolats 1',
            organisation: 'Organisation 1',
            description: 'Description 1',
            start: new Date(),
            end: new Date(),
            location: 'location 1',
            missions: [],
            order: 1,
          },
        ],
      });
      const before = await prismaTest.volunteering.findMany({
        where: { profileId: user.profile.id },
      });
      expect(before!.length).toBe(1);
      await prismaTest.volunteering.delete({
        where: { id: user.profile.volunteerings![0]!.id },
      });
      const volunteerings = await prismaTest.volunteering.findMany({
        where: { profileId: user.profile.id },
      });
      expect(volunteerings!.length).toBe(0);
    });

    // 5-2: supprime les benevolats quand le profile est supprimé
    it('should delete the volunteerings when the profile is deleted', async () => {
      const user = await createTestUserWithProfile({
        volunteerings: [
          {
            title: 'Benevolats 1',
            organisation: 'Organisation 1',
            description: 'Description 1',
            start: new Date(),
            end: new Date(),
            location: 'location 1',
            missions: [],
            order: 1,
          },
        ],
      });
      expect(user.profile.volunteerings!.length).toBe(1);
      await prismaTest.profile.delete({ where: { id: user.profile.id } });
      const volunteerings = await prismaTest.volunteering.findMany({
        where: { profileId: user.profile.id },
      });
      expect(volunteerings!.length).toBe(0);
    });
  });

  //! 6- RELATIONS TESTS
  describe('RELATIONS', () => {
    // 6-1: garde le bon ordre des benevolats
    it('should keep the correct order of volunteerings', async () => {
      const user = await createTestUserWithProfile({
        volunteerings: [
          {
            title: 'Benevolats 1',
            organisation: 'Organisation 1',
            description: 'Description 1',
            start: new Date(),
            end: new Date(),
            location: 'location 1',
            missions: [],
            order: 1,
          },
          {
            title: 'Benevolats 2',
            organisation: 'Organisation 2',
            description: 'Description 2',
            start: new Date(),
            end: new Date(),
            location: 'location 2',
            missions: [],
            order: 2,
          },
        ],
      });
      const volunteerings = await prismaTest.volunteering.findMany({
        where: { profileId: user.profile.id },
        orderBy: { order: 'asc' },
      });
      expect(volunteerings[0]!.order).toBe(1);
      expect(volunteerings[1]!.order).toBe(2);
    });

    // 6-2: vérifie que le benevolat est lié au bon profile
    it('should link volunteering to the correct profile', async () => {
      const user = await createTestUserWithProfile({
        volunteerings: [
          {
            title: 'Benevolats 1',
            organisation: 'Organisation 1',
            description: 'Description 1',
            start: new Date(),
            end: new Date(),
            location: 'location 1',
            missions: [],
            order: 1,
          },
        ],
      });

      const volunteering = await prismaTest.volunteering.findUnique({
        where: { id: user.profile.volunteerings![0]!.id },
      });

      expect(volunteering!.profileId).toBe(user.profile.id);
    });

    // 6-3: 2 profile peuvent avoir le même order
    it('should allow same order for different profiles', async () => {
      const user1 = await createTestUserWithProfile({
        volunteerings: [
          {
            title: 'Benevolats 1',
            organisation: 'Organisation 1',
            description: 'Description 1',
            start: new Date(),
            end: new Date(),
            location: 'location 1',
            missions: [],
            order: 1,
          },
        ],
      });

      const user2 = await createTestUserWithProfile({
        volunteerings: [
          {
            title: 'Benevolats 2',
            organisation: 'Organisation 2',
            description: 'Description 2',
            start: new Date(),
            end: new Date(),
            location: 'location 2',
            missions: [],
            order: 1,
          },
        ],
      });

      const volunteerings = await prismaTest.volunteering.findMany();
      expect(volunteerings.length).toBe(2);
    });

    // 6-4: order est 0 par défaut
    it('should set order to 0 by default', async () => {
      const user = await createTestUserWithProfile({
        volunteerings: [
          {
            title: 'Default order',
            organisation: 'Org',
            start: new Date(),
            missions: [],
          } as any,
        ],
      });

      const volunteering = user.profile.volunteerings![0];
      expect(volunteering!.order).toBe(0);
    });

    // 6-5: supprime les missions quand le benevolat est supprimé
    it('should delete missions when volunteering is deleted', async () => {
      const user = await createTestUserWithProfile({
        volunteerings: [
          {
            title: 'Test',
            organisation: 'Org',
            start: new Date(),
            missions: ['mission 1'],
            order: 1,
          },
        ],
      });

      const volunteeringId = user.profile.volunteerings![0]!.id;

      await prismaTest.volunteering.delete({
        where: { id: volunteeringId },
      });

      const missions = await prismaTest.missionVolunteering.findMany({
        where: { volunteeringId },
      });

      expect(missions.length).toBe(0);
    });
  });
});
