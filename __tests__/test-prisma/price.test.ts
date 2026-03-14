import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestUserWithProfile } from '../utils/create-test-user-with-profile';
import { resetTestDB } from '../utils/setup';
import { prismaTest } from '../../lib/prismaTest';

describe('Price model', () => {
  // Nettoyage DB avant chaque test
  beforeEach(async () => {
    await resetTestDB();
  });

  afterAll(async () => {
    await prismaTest.$disconnect();
  });

  //? 18 tests pour le model Price => 18 tests ok
  // model Price {
  //   id          String @id @default(cuid())
  //   title       String
  //   domaine     String
  //   icon        String?

  //   order       Int @default(0)
  //   profile     Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  //   profileId   String

  //   @@unique([profileId, title])
  //   @@unique([profileId, order])
  //   @@index([profileId])
  // }

  //! 1- CREATE TESTS
  describe('CREATE', () => {
    // 1-1: peut créer un profile avec des prix
    it('should create a profile with prices', async () => {
      const user = await createTestUserWithProfile({
        prices: [
          {
            title: 'Prix 1',
            domaine: 'Domaine 1',
            icon: 'faPlus',
            order: 1,
          },
        ],
      });
      const price = user.profile!.prices![0]!;
      expect(price.title).toBe('Prix 1');
      expect(price.domaine).toBe('Domaine 1');
      expect(price.order).toBe(1);
    });

    // 1-2: peut créer une prix sans icon si optional
    it('should create price without icon if optional', async () => {
      const user = await createTestUserWithProfile({
        prices: [
          {
            title: 'Prix 1',
            domaine: 'Domaine 1',
            order: 1,
          },
        ],
      });

      const price = user.profile.prices![0];
      expect(price!.icon).toBeNull();
    });
  });

  //! 2- CREATE ERROR TESTS
  describe('CREATE ERRORS', () => {
    // 2-1: ne peut pas créer un prix sans un profile
    it('should not create an price without a profile', async () => {
      await expect(
        prismaTest.price.create({
          data: {
            title: 'Prix 1',
            domaine: 'Domaine 1',
            icon: 'faPlus',
            order: 1,
            profile: { connect: { id: 'non-existing-id' } },
          },
        }),
      ).rejects.toThrow();
    });

    // 2-2: ne peut pas créer un prix sans un title
    it('should not create an price without a title', async () => {
      const user = await createTestUserWithProfile();
      await expect(
        prismaTest.price.create({
          // @ts-expect-error - title is required
          data: {
            domaine: 'Domaine 1',
            icon: 'faPlus',
            order: 1,
            profile: { connect: { id: user.profile.id } },
          },
        }),
      ).rejects.toThrow();
    });

    // 2-3: ne peut pas créer un prix sans un domaine
    it('should not create an price without a domaine', async () => {
      const user = await createTestUserWithProfile();
      await expect(
        prismaTest.price.create({
          // @ts-expect-error - domaine is required
          data: {
            title: 'Prix 1',
            icon: 'faPlus',
            order: 1,
            profile: { connect: { id: user.profile.id } },
          },
        }),
      ).rejects.toThrow();
    });

    // 2-4: ne peut pas créer un prix avec un order déjà existant
    it('should not allow duplicate order for same profile', async () => {
      const user = await createTestUserWithProfile({
        prices: [
          {
            title: 'Prix 1',
            domaine: 'Domaine 1',
            icon: 'faPlus',
            order: 1,
          },
        ],
      });

      await expect(
        prismaTest.price.create({
          data: {
            title: 'Prix 2',
            domaine: 'Domaine 2',
            icon: 'faPlus',
            order: 1,
            profile: { connect: { id: user.profile.id } },
          },
        }),
      ).rejects.toThrow();
    });

    // 2-5: ne peut pas créer 2 prix avec le même title dans un profile
    it('should not allow duplicate price title for the same profile', async () => {
      const user = await createTestUserWithProfile({
        prices: [
          {
            title: 'Prix 1',
            domaine: 'Domaine 1',
            icon: 'faPlus',
            order: 1,
          },
        ],
      });

      await expect(
        prismaTest.price.create({
          data: {
            title: 'Prix 1',
            domaine: 'Domaine 2',
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
    // 3-1: peut mettre à jour un prix avec un domaine
    it('should update a price with a domaine', async () => {
      const user = await createTestUserWithProfile({
        prices: [
          {
            title: 'Prix 1',
            domaine: 'Domaine 1',
            icon: 'faPlus',
            order: 1,
          },
        ],
      });
      const price = await prismaTest.price.update({
        where: { id: user.profile.prices![0]!.id },
        data: { domaine: 'Domaine 2' },
      });
      expect(price.domaine).toBe('Domaine 2');
    });

    // 3-2: tester la mise à jour partielle du title
    it('should update only provided fields of title', async () => {
      const user = await createTestUserWithProfile({
        prices: [
          {
            title: 'Prix 1',
            domaine: 'Domaine 1',
            icon: 'faPlus',
            order: 1,
          },
        ],
      });

      await prismaTest.price.update({
        where: { id: user.profile.prices![0]!.id },
        data: { title: 'Vue' },
      });

      const updated = await prismaTest.price.findUnique({
        where: { id: user.profile.prices![0]!.id },
      });

      expect(updated!.title).toBe('Vue');
      expect(updated!.domaine).toBe('Domaine 1');
    });

    // 3-3: peut mettre à jour uniquement l'icon sans changer le title ou le domaine
    it('should update only icon without changing title or domaine', async () => {
      const user = await createTestUserWithProfile({
        prices: [{ title: 'Prix 1', domaine: 'Domaine 1', icon: 'faPlus', order: 1 }],
      });

      await prismaTest.price.update({
        where: { id: user.profile.prices![0]!.id },
        data: { icon: 'faStar' },
      });

      const updated = await prismaTest.price.findUnique({
        where: { id: user.profile.prices![0]!.id },
      });

      expect(updated!.icon).toBe('faStar');
      expect(updated!.title).toBe('Prix 1');
      expect(updated!.domaine).toBe('Domaine 1');
    });

    // 3-4: peut mettre l'icon à null si optional
    it('should allow setting icon to null', async () => {
      const user = await createTestUserWithProfile({
        prices: [{ title: 'Prix 1', domaine: 'Domaine 1', icon: 'faPlus', order: 1 }],
      });

      await prismaTest.price.update({
        where: { id: user.profile.prices![0]!.id },
        data: { icon: null },
      });

      const updated = await prismaTest.price.findUnique({
        where: { id: user.profile.prices![0]!.id },
      });

      expect(updated!.icon).toBeNull();
    });
  });

  //! 4- UPDATE ERROR TESTS
  describe('UPDATE ERRORS', () => {
    // 4-1: ne peut pas duplicate le name lors d'un update
    it('should not allow updating to duplicate name in same profile', async () => {
      const user = await createTestUserWithProfile({
        prices: [
          {
            title: 'Prix 1',
            domaine: 'Domaine 1',
            icon: 'faPlus',
            order: 1,
          },
          {
            title: 'Prix 2',
            domaine: 'Domaine 2',
            icon: 'faPlus',
            order: 2,
          },
        ],
      });

      await expect(
        prismaTest.price.update({
          where: { id: user.profile.prices![1]!.id },
          data: { title: 'Prix 1' },
        }),
      ).rejects.toThrow();
    });

    // 4-2: ne peut pas avoir de duplicate order au update
    it('should not allow updating to duplicate order', async () => {
      const user = await createTestUserWithProfile({
        prices: [
          {
            title: 'Prix 1',
            domaine: 'Domaine 1',
            icon: 'faPlus',
            order: 1,
          },
          {
            title: 'Prix 2',
            domaine: 'Domaine 2',
            icon: 'faPlus',
            order: 2,
          },
        ],
      });

      await expect(
        prismaTest.price.update({
          where: { id: user.profile.prices![1]!.id },
          data: { order: 1 },
        }),
      ).rejects.toThrow();
    });
  });

  //! 5-DELETE TESTS
  describe('DELETE', () => {
    // 5-1: peut supprimer un prix
    it('should delete an price', async () => {
      const user = await createTestUserWithProfile({
        prices: [
          {
            title: 'Prix 1',
            domaine: 'Domaine 1',
            icon: 'faPlus',
            order: 1,
          },
        ],
      });
      const before = await prismaTest.price.findMany({
        where: { profileId: user.profile.id },
      });
      expect(before!.length).toBe(1);
      await prismaTest.price.delete({
        where: { id: user.profile.prices![0]!.id },
      });
      const prices = await prismaTest.price.findMany({
        where: { profileId: user.profile.id },
      });
      expect(prices!.length).toBe(0);
    });

    // 5-2: supprime les prix quand le profile est supprimé
    it('should delete the prices when the profile is deleted', async () => {
      const user = await createTestUserWithProfile({
        prices: [
          {
            title: 'Prix 1',
            domaine: 'Domaine 1',
            icon: 'faPlus',
            order: 1,
          },
        ],
      });
      expect(user.profile.prices!.length).toBe(1);
      await prismaTest.profile.delete({ where: { id: user.profile.id } });
      const prices = await prismaTest.price.findMany({
        where: { profileId: user.profile.id },
      });
      expect(prices!.length).toBe(0);
    });
  });

  //! 6- RELATIONS TESTS
  describe('RELATIONS', () => {
    // 6-1: garde le bon ordre des prix
    it('should keep the correct order of prices', async () => {
      const user = await createTestUserWithProfile({
        prices: [
          {
            title: 'Prix 1',
            domaine: 'Domaine 1',
            icon: 'faPlus',
            order: 1,
          },
          {
            title: 'Prix 2',
            domaine: 'Domaine 2',
            icon: 'faPlus',
            order: 2,
          },
        ],
      });
      const prices = await prismaTest.price.findMany({
        where: { profileId: user.profile.id },
        orderBy: { order: 'asc' },
      });
      expect(prices[0]!.order).toBe(1);
      expect(prices[1]!.order).toBe(2);
    });

    // 6-2: vérifie que la prix est lié au bon profile
    it('should link price to the correct profile', async () => {
      const user = await createTestUserWithProfile({
        prices: [
          {
            title: 'Prix 1',
            domaine: 'Domaine 1',
            icon: 'faPlus',
            order: 1,
          },
        ],
      });

      const price = await prismaTest.price.findUnique({
        where: { id: user.profile.prices![0]!.id },
      });

      expect(price!.profileId).toBe(user.profile.id);
    });

    // 6-3: 2 profile peuvent avoir le même order
    it('should allow same order for different profiles', async () => {
      const user1 = await createTestUserWithProfile({
        prices: [
          {
            title: 'Prix 1',
            domaine: 'Domaine 1',
            icon: 'faPlus',
            order: 1,
          },
        ],
      });

      const user2 = await createTestUserWithProfile({
        prices: [
          {
            title: 'Prix 1',
            domaine: 'Domaine 1',
            icon: 'faPlus',
            order: 1,
          },
        ],
      });

      const prices = await prismaTest.price.findMany();
      expect(prices.length).toBe(2);
    });
  });
});
