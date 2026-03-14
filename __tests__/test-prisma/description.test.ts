import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { prismaTest } from '../../lib/prismaTest';
import { resetTestDB } from '../utils/setup';
import { createTestUserWithProfile } from '../utils/create-test-user-with-profile';

describe('Description model', () => {
  // Nettoyage DB avant chaque test
  beforeEach(async () => {
    await resetTestDB();
  });

  afterAll(async () => {
    await prismaTest.$disconnect();
  });

  //? 7 tests pour le model Description => 7 tests ok
  // model Description {
  //   id          String @id @default(cuid())
  //   description String

  //   profile     Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  //   profileId   String @unique
  // }

  //! 1- CREATE TESTS
  describe('CREATE', () => {
    // 1-1: peut créer un user avec un profile et une description
    it('should create a user with a profile and a description', async () => {
      const user = await createTestUserWithProfile({
        description: 'Je suis un test',
      });
      expect(user.profile).toBeDefined();
      expect(user.profile.description).toBeDefined();
      expect(user.profile.description!.description).toBe('Je suis un test');
    });
  });

  //! 2- CREATE ERROR TESTS
  describe('CREATE ERRORS', () => {
    // 2-1: ne peut pas créer une description sans un profile
    it('should not create a description without a profile', async () => {
      await expect(
        prismaTest.description.create({
          data: {
            description: 'Orpheline',
            profileId: 'non-existing-id',
          },
        }),
      ).rejects.toThrow();
    });
  });

  //! 3- UPDATE TESTS
  describe('UPDATE', () => {
    // 3-1: peut mettre à jour une description
    it('should update a description', async () => {
      const user = await createTestUserWithProfile({
        description: 'Ancien texte',
      });

      const updated = await prismaTest.description.update({
        where: { profileId: user.profile.id },
        data: { description: 'Nouveau texte' },
      });

      expect(updated.description).toBe('Nouveau texte');
    });
  });

  //! 4- UPDATE ERROR TESTS
  describe('UPDATE ERRORS', () => {
    // 4-1: ne peut pas mettre une description vide
    it('should not allow updating description to empty', async () => {
      const user = await createTestUserWithProfile({ description: 'Texte initial' });

      await expect(
        prismaTest.description.update({
          where: { profileId: user.profile.id },
          // @ts-expect-error test volontaire
          data: { description: null },
        }),
      ).rejects.toThrow();
    });

    // 4-2: ne peut pas créer deux descriptions pour le même profile
    it('should not allow two descriptions for the same profile', async () => {
      const user = await createTestUserWithProfile({ description: 'Première description' });

      await expect(
        prismaTest.description.create({
          data: {
            description: 'Deuxième description',
            profileId: user.profile.id,
          },
        }),
      ).rejects.toThrow();
    });
  });

  //! 5- DELETE TESTS
  describe('DELETE', () => {
    // 5-1: supprimer une description d'un profile
    it('should delete a description of a profile', async () => {
      const user = await createTestUserWithProfile({
        description: 'Je suis un test',
      });
      const updatedProfile = await prismaTest.profile.update({
        where: { id: user.profile.id },
        data: { description: { delete: true } },
        include: { description: true },
      });
      expect(updatedProfile.description).toBeNull();
    });

    // 5-2: supprime la description quand on supprime le profile
    it('should delete the description when the profile is deleted', async () => {
      const user = await createTestUserWithProfile({
        description: 'Je suis un test',
      });
      await prismaTest.profile.delete({ where: { id: user.profile.id } });
      const description = await prismaTest.description.findUnique({
        where: { profileId: user.profile.id },
      });
      expect(description).toBeNull();
    });
  });

  //! 6- RELATIONS TESTS
  // describe('RELATIONS', () => {});
});
