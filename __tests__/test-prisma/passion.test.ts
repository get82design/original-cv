import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestUserWithProfile } from '../utils/create-test-user-with-profile';
import { resetTestDB } from '../utils/setup';
import { prismaTest } from '../../lib/prismaTest';

describe('Passion model', () => {
  // Nettoyage DB avant chaque test
  beforeEach(async () => {
    await resetTestDB();
  });

  afterAll(async () => {
    await prismaTest.$disconnect();
  });

  //? 16 tests pour le model Passion => 16 tests ok
  // model Passion {
  //   id          String @id @default(cuid())
  //   title       String
  //   icon        String

  //   order       Int @default(0)
  //   profile     Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  //   profileId   String

  //   @@unique([profileId, title])
  //   @@unique([profileId, order]) // pas de doublon dans un profile
  //   @@index([profileId])
  // }

  //! 1- CREATE TESTS
  describe('CREATE', () => {
    // 1-1: peut créer un profile avec des passions
    it('should create a profile with passions', async () => {
      const user = await createTestUserWithProfile({
        passions: [
          {
            title: 'Passion 1',
            icon: 'faPlus',
            order: 1,
          },
        ],
      });
      const passion = user.profile!.passions![0]!;
      expect(passion.title).toBe('Passion 1');
      expect(passion.icon).toBe('faPlus');
      expect(passion.order).toBe(1);
    });
  });

  //! 2- CREATE ERROR TESTS
  describe('CREATE ERRORS', () => {
    // 2-1: ne peut pas créer une passion sans un profile
    it('should not create an passion without a profile', async () => {
      await expect(
        prismaTest.passion.create({
          data: {
            title: 'Passion 1',
            icon: 'faPlus',
            order: 1,
            profile: { connect: { id: 'non-existing-id' } },
          },
        }),
      ).rejects.toThrow();
    });

    // 2-2: ne peut pas créer une passion sans un title
    it('should not create an passion without a title', async () => {
      const user = await createTestUserWithProfile();
      await expect(
        prismaTest.passion.create({
          // @ts-expect-error - title is required
          data: {
            icon: 'faPlus',
            order: 1,
            profile: { connect: { id: user.profile.id } },
          },
        }),
      ).rejects.toThrow();
    });

    // 2-3: ne peut pas créer un passion avec un order déjà existant
    it('should not allow duplicate order for same profile', async () => {
      const user = await createTestUserWithProfile({
        passions: [
          {
            title: 'Passion 1',
            icon: 'faPlus',
            order: 1,
          },
        ],
      });

      await expect(
        prismaTest.passion.create({
          data: {
            title: 'Passion 2',
            icon: 'faPlus',
            order: 1,
            profile: { connect: { id: user.profile.id } },
          },
        }),
      ).rejects.toThrow();
    });

    // 2-4: ne peut pas créer 2 passions avec le même nom dans un profile
    it('should not allow duplicate passion title for the same profile', async () => {
      const user = await createTestUserWithProfile({
        passions: [
          {
            title: 'Passion 1',
            icon: 'faPlus',
            order: 1,
          },
        ],
      });

      await expect(
        prismaTest.passion.create({
          data: {
            title: 'Passion 1',
            icon: 'faPlus',
            order: 2,
            profile: { connect: { id: user.profile.id } },
          },
        }),
      ).rejects.toThrow();
    });
  });

  //! 3- UPDATE TESTS
  describe('UPDATE', () => {
    // 3-1: tester la mise à jour partielle d'une passion avec icon
    it('should update only provided fields with icon', async () => {
      const user = await createTestUserWithProfile({
        passions: [
          {
            title: 'Passion 1',
            icon: 'faPlus',
            order: 1,
          },
        ],
      });

      await prismaTest.passion.update({
        where: { id: user.profile.passions![0]!.id },
        data: { icon: 'faBan' },
      });

      const updated = await prismaTest.passion.findUnique({
        where: { id: user.profile.passions![0]!.id },
      });

      expect(updated!.title).toBe('Passion 1');
      expect(updated!.icon).toBe('faBan');
    });
  });

  //! 4- UPDATE ERROR TESTS
  describe('UPDATE ERRORS', () => {
    // 4-1: ne peut pas duplicate le name lors d'un update
    it('should not allow updating to duplicate name in same profile', async () => {
      const user = await createTestUserWithProfile({
        passions: [
          {
            title: 'Passion 1',
            icon: 'faPlus',
            order: 1,
          },
          {
            title: 'Passion 2',
            icon: 'faPlus',
            order: 2,
          },
        ],
      });

      await expect(
        prismaTest.passion.update({
          where: { id: user.profile.passions![1]!.id },
          data: { title: 'Passion 1' },
        }),
      ).rejects.toThrow();
    });

    // 4-2: ne peut pas avoir de duplicate order au update
    it('should not allow updating to duplicate order', async () => {
      const user = await createTestUserWithProfile({
        passions: [
          {
            title: 'Passion 1',
            icon: 'faPlus',
            order: 1,
          },
          {
            title: 'Passion 2',
            icon: 'faPlus',
            order: 2,
          },
        ],
      });

      await expect(
        prismaTest.passion.update({
          where: { id: user.profile.passions![1]!.id },
          data: { order: 1 },
        }),
      ).rejects.toThrow();
    });
  });

  //! 5- DELETE TESTS
  describe('DELETE', () => {
    // 5-1: peut supprimer une passion
    it('should delete an passion', async () => {
      const user = await createTestUserWithProfile({
        passions: [
          {
            title: 'Passion 1',
            icon: 'faPlus',
            order: 1,
          },
        ],
      });
      const before = await prismaTest.passion.findMany({
        where: { profileId: user.profile.id },
      });
      expect(before!.length).toBe(1);
      await prismaTest.passion.delete({
        where: { id: user.profile.passions![0]!.id },
      });
      const passions = await prismaTest.passion.findMany({
        where: { profileId: user.profile.id },
      });
      expect(passions!.length).toBe(0);
    });

    // 5-2: supprime les passions quand le profile est supprimé
    it('should delete the passions when the profile is deleted', async () => {
      const user = await createTestUserWithProfile({
        passions: [
          {
            title: 'Passion 1',
            icon: 'faPlus',
            order: 1,
          },
        ],
      });
      expect(user.profile.passions!.length).toBe(1);
      await prismaTest.profile.delete({ where: { id: user.profile.id } });
      const passions = await prismaTest.passion.findMany({
        where: { profileId: user.profile.id },
      });
      expect(passions!.length).toBe(0);
    });

    // 5-3: supprime les passions quand l'utilisateur est supprimé
    it('should delete passions when user is deleted', async () => {
      const user = await createTestUserWithProfile({
        passions: [{ title: 'Cascade Test', icon: 'faStar', order: 1 }],
      });

      await prismaTest.user.delete({ where: { id: user.id } });
      const passions = await prismaTest.passion.findMany({ where: { profileId: user.profile.id } });
      expect(passions.length).toBe(0);
    });
  });

  //! 6- RELATIONS TESTS
  describe('RELATIONS', () => {
    // 6-1: garde le bon ordre des passion
    it('should keep the correct order of passions', async () => {
      const user = await createTestUserWithProfile({
        passions: [
          { title: 'Passion 1', icon: 'faPlus', order: 1 },
          { title: 'Passion 2', icon: 'faPlus', order: 2 },
        ],
      });
      const passions = await prismaTest.passion.findMany({
        where: { profileId: user.profile.id },
        orderBy: { order: 'asc' },
      });
      expect(passions[0]!.order).toBe(1);
      expect(passions[1]!.order).toBe(2);
    });

    // 6-2: vérifie que la passion est lié au bon profile
    it('should link passion to the correct profile', async () => {
      const user = await createTestUserWithProfile({
        passions: [
          {
            title: 'Passion 1',
            icon: 'faPlus',
            order: 1,
          },
        ],
      });

      const passion = await prismaTest.passion.findUnique({
        where: { id: user.profile.passions![0]!.id },
      });

      expect(passion!.profileId).toBe(user.profile.id);
    });

    // 6-3: 2 profile peuvent avoir le même order
    it('should allow same order for different profiles', async () => {
      const user1 = await createTestUserWithProfile({
        passions: [
          {
            title: 'Passion 1',
            icon: 'faPlus',
            order: 1,
          },
        ],
      });

      const user2 = await createTestUserWithProfile({
        passions: [
          {
            title: 'Passion 2',
            icon: 'faPlus',
            order: 1,
          },
        ],
      });

      const passions = await prismaTest.passion.findMany();
      expect(passions.length).toBe(2);
    });

    // 6-4: order est 0 par défaut
    it('should set default order to 0 if not provided', async () => {
      const user = await createTestUserWithProfile({
        passions: [
          // @ts-expect-error - order is required
          { title: 'Passion sans order', icon: 'faHeart' },
        ],
      });
      const passion = user.profile.passions![0]!;
      expect(passion.order).toBe(0);
    });

    // 6-5: retourne les passions dans le bon ordre pour le profile
    it('should return passions in correct order for profile', async () => {
      const user = await createTestUserWithProfile({
        passions: Array.from({ length: 5 }, (_, i) => ({
          title: `Passion ${i + 1}`,
          icon: 'faStar',
          order: i + 1,
        })),
      });

      const passions = await prismaTest.passion.findMany({
        where: { profileId: user.profile.id },
        orderBy: { order: 'asc' },
      });

      passions.forEach((p, i) => expect(p.order).toBe(i + 1));
    });
  });
});
