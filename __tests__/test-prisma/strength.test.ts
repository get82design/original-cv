import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestUserWithProfile } from '../utils/create-test-user-with-profile';
import { resetTestDB } from '../utils/setup';
import { prismaTest } from '../../lib/prismaTest';

describe('Strength model', () => {
  // Nettoyage DB avant chaque test
  beforeEach(async () => {
    await resetTestDB();
  });

  afterAll(async () => {
    await prismaTest.$disconnect();
  });

  //? 16 tests pour le model Strength => 16 tests ok
  // model Strength {
  //   id          String @id @default(cuid())
  //   title       String
  //   icon        String?

  //   order       Int @default(0)
  //   profile     Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  //   profileId   String

  //   @@unique([profileId, title])
  //   @@unique([profileId, order]) // pas de doublon dans un profile
  //   @@index([profileId])
  // }

  //! 1- CREATE TESTS
  describe('CREATE', () => {
    // 1-1: peut créer un profile avec des atouts
    it('should create a profile with strengths', async () => {
      const user = await createTestUserWithProfile({
        strengths: [
          {
            title: 'atout 1',
            order: 1,
            icon: 'faPlus',
          },
        ],
      });
      const strength = user.profile!.strengths![0]!;
      expect(strength.title).toBe('atout 1');
      expect(strength.order).toBe(1);
    });

    // 1-2: peut créer un atout sans icon si optional
    it('should create strength without icon if optional', async () => {
      const user = await createTestUserWithProfile({
        strengths: [
          {
            title: 'atout 1',
            order: 1,
          },
        ],
      });

      const strength = user.profile.strengths![0];
      expect(strength!.icon).toBeNull();
    });
  });

  //! 2- CREATE ERROR TESTS
  describe('CREATE ERRORS', () => {
    // 2-1: ne peut pas créer un atout sans un profile
    it('should not create an strength without a profile', async () => {
      await expect(
        prismaTest.strength.create({
          data: {
            title: 'Atout 1',
            order: 1,
            icon: 'faPlus',
            profile: { connect: { id: 'non-existing-id' } },
          },
        }),
      ).rejects.toThrow();
    });

    // 2-2: ne peut pas créer un atout sans un title
    it('should not create an strength without a title', async () => {
      const user = await createTestUserWithProfile();
      await expect(
        prismaTest.strength.create({
          // @ts-expect-error - title is required
          data: {
            order: 1,
            icon: 'faPlus',
            profile: { connect: { id: user.profile.id } },
          },
        }),
      ).rejects.toThrow();
    });

    // 2-3: ne peut pas créer un atout avec un order déjà existant
    it('should not allow duplicate order for same profile', async () => {
      const user = await createTestUserWithProfile({
        strengths: [{ title: 'Atout 1', order: 1, icon: 'faPlus' }],
      });

      await expect(
        prismaTest.strength.create({
          data: {
            title: 'Atout 2',
            order: 1,
            icon: 'faPlus',
            profile: { connect: { id: user.profile.id } },
          },
        }),
      ).rejects.toThrow();
    });

    // 2-4: ne peut pas duplicate le title lors d'un create
    it('should not allow duplicate title for same profile', async () => {
      const user = await createTestUserWithProfile({
        strengths: [{ title: 'Atout 1', order: 1 }],
      });

      await expect(
        prismaTest.strength.create({
          data: {
            title: 'Atout 1',
            order: 2,
            profile: { connect: { id: user.profile.id } },
          },
        }),
      ).rejects.toThrow(/Unique constraint failed/);
    });
  });

  //! 3- UPDATE TESTS
  describe('UPDATE', () => {
    // 3-1: peut mettre à jour un atout
    it('should update a strength', async () => {
      const user = await createTestUserWithProfile({
        strengths: [
          {
            title: 'atout 1',
            order: 1,
            icon: 'faPlus',
          },
        ],
      });
      const strength = await prismaTest.strength.update({
        where: { id: user.profile.strengths![0]!.id },
        data: { title: 'Atout 2' },
      });
      expect(strength.title).toBe('Atout 2');
    });

    // 3-2: peut mettre à jour l'icon à null si optional
    it('should update icon to null', async () => {
      const user = await createTestUserWithProfile({
        strengths: [{ title: 'Atout 1', order: 1, icon: 'faPlus' }],
      });

      const updated = await prismaTest.strength.update({
        where: { id: user.profile.strengths![0]!.id },
        data: { icon: null },
      });

      expect(updated.icon).toBeNull();
    });
  });

  //! 4- UPDATE ERROR TESTS
  describe('UPDATE ERRORS', () => {
    // 4-1: ne peut pas duplicate le title lors d'un update
    it('should not allow duplicate title on update', async () => {
      const user = await createTestUserWithProfile({
        strengths: [
          { title: 'A', order: 1 },
          { title: 'B', order: 2 },
        ],
      });

      await expect(
        prismaTest.strength.update({
          where: { id: user.profile.strengths![1]!.id },
          data: { title: 'A' },
        }),
      ).rejects.toThrow(/Unique constraint failed/);
    });

    // 4-2: ne peut pas duplicate le order lors d'un update
    it('should not allow duplicate order on update', async () => {
      const user = await createTestUserWithProfile({
        strengths: [
          { title: 'A', order: 1 },
          { title: 'B', order: 2 },
        ],
      });

      await expect(
        prismaTest.strength.update({
          where: { id: user.profile.strengths![1]!.id },
          data: { order: 1 },
        }),
      ).rejects.toThrow(/Unique constraint failed/);
    });
  });

  //! 5- DELETE TESTS
  describe('DELETE', () => {
    // 5-1: peut supprimer un atout
    it('should delete an strength', async () => {
      const user = await createTestUserWithProfile({
        strengths: [
          {
            title: 'Atout 2',
            order: 1,
            icon: 'faPlus',
          },
        ],
      });
      const before = await prismaTest.strength.findMany({
        where: { profileId: user.profile.id },
      });
      expect(before!.length).toBe(1);
      await prismaTest.strength.delete({
        where: { id: user.profile.strengths![0]!.id },
      });
      const strengths = await prismaTest.strength.findMany({
        where: { profileId: user.profile.id },
      });
      expect(strengths!.length).toBe(0);
    });

    // 5-2: supprime les atouts quand le profile est supprimé
    it('should delete the strengths when the profile is deleted', async () => {
      const user = await createTestUserWithProfile({
        strengths: [
          {
            title: 'Atout 2',
            order: 1,
            icon: 'faPlus',
          },
        ],
      });
      expect(user.profile.strengths!.length).toBe(1);
      await prismaTest.profile.delete({ where: { id: user.profile.id } });
      const strengths = await prismaTest.strength.findMany({
        where: { profileId: user.profile.id },
      });
      expect(strengths!.length).toBe(0);
    });
  });

  //! 6- RELATIONS TESTS
  describe('RELATIONS', () => {
    // 6-1: garde le bon ordre des atouts
    it('should keep the correct order of strengths', async () => {
      const user = await createTestUserWithProfile({
        strengths: [
          {
            title: 'Atout 1',
            order: 1,
            icon: 'faPlus',
          },
          {
            title: 'Atout 2',
            order: 2,
            icon: 'faBan',
          },
        ],
      });
      const strengths = await prismaTest.strength.findMany({
        where: { profileId: user.profile.id },
        orderBy: { order: 'asc' },
      });
      expect(strengths[0]!.order).toBe(1);
      expect(strengths[1]!.order).toBe(2);
    });

    // 6-2: vérifie que l'atout est lié au bon profile
    it('should link strength to the correct profile', async () => {
      const user = await createTestUserWithProfile({
        strengths: [{ title: 'Atout 1', order: 1 }],
      });

      const strength = await prismaTest.strength.findUnique({
        where: { id: user.profile.strengths![0]!.id },
      });

      expect(strength!.profileId).toBe(user.profile.id);
    });

    // 6-3: 2 profile peuvent avoir le même order
    it('should allow same order for different profiles', async () => {
      const user1 = await createTestUserWithProfile({
        strengths: [{ title: 'Atout 1', order: 1 }],
      });

      const user2 = await createTestUserWithProfile({
        strengths: [{ title: 'Atout 2', order: 1 }],
      });

      const strengths = await prismaTest.strength.findMany();
      expect(strengths.length).toBe(2);
    });

    // 6-4: order est 0 par défaut
    it('should set order to 0 by default', async () => {
      const user = await createTestUserWithProfile({
        strengths: [
          {
            title: 'Default Order',
          } as any,
        ],
      });

      const strength = user.profile.strengths![0];
      expect(strength!.order).toBe(0);
    });
  });
});
