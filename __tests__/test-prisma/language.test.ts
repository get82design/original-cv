import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestUserWithProfile } from '../utils/create-test-user-with-profile';
import { resetTestDB } from '../utils/setup';
import { prismaTest } from '../../lib/prismaTest';

describe('Language model', () => {
  // Nettoyage DB avant chaque test
  beforeEach(async () => {
    await resetTestDB();
  });

  afterAll(async () => {
    await prismaTest.$disconnect();
  });

  //? 18 tests pour le model Language => 18 tests ok
  // model Language {
  //   id          String @id @default(cuid())
  //   name        String
  //   level       Level

  //   order       Int @default(0)
  //   profile     Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  //   profileId   String

  //   @@unique([profileId, name])
  //   @@unique([profileId, order]) // pas de doublon dans un profile
  //   @@index([profileId])
  // }

  //! 1- CREATE TESTS
  describe('CREATE', () => {
    // 1-1: peut créer un profile avec des langues
    it('should create a profile with languages', async () => {
      const user = await createTestUserWithProfile({
        languages: [
          {
            name: 'Anglais',
            level: 'Débutant',
            order: 1,
          },
        ],
      });
      const language = user.profile!.languages![0]!;
      expect(language.name).toBe('Anglais');
      expect(language.level).toBe('Débutant');
      expect(language.order).toBe(1);
    });
  });

  //! 2- CREATE ERROR TESTS
  describe('CREATE ERRORS', () => {
    // 2-1: ne peut pas créer une langue sans un profile
    it('should not create an language without a profile', async () => {
      await expect(
        prismaTest.language.create({
          data: {
            name: 'Anglais',
            level: 'Débutant',
            order: 1,
            profile: { connect: { id: 'non-existing-id' } },
          },
        }),
      ).rejects.toThrow();
    });

    // 2-2: ne peut pas créer une langue sans un name
    it('should not create an language without a name', async () => {
      const user = await createTestUserWithProfile();
      await expect(
        prismaTest.language.create({
          // @ts-expect-error - title is required
          data: {
            level: 'Débutant',
            order: 1,
            profile: { connect: { id: user.profile.id } },
          },
        }),
      ).rejects.toThrow();
    });

    // 2-3: ne peut pas créer une langue sans un level
    it('should not create an language without a level', async () => {
      const user = await createTestUserWithProfile();
      await expect(
        prismaTest.language.create({
          // @ts-expect-error - title is required
          data: {
            name: 'Anglais',
            order: 1,
            profile: { connect: { id: user.profile.id } },
          },
        }),
      ).rejects.toThrow();
    });

    // 2-4: ne peut pas créer un language avec un order déjà existant
    it('should not allow duplicate order for same profile', async () => {
      const user = await createTestUserWithProfile({
        languages: [
          {
            name: 'Anglais',
            level: 'Débutant',
            order: 1,
          },
        ],
      });

      await expect(
        prismaTest.language.create({
          data: {
            name: 'Espagnol',
            level: 'Débutant',
            order: 1,
            profile: { connect: { id: user.profile.id } },
          },
        }),
      ).rejects.toThrow();
    });

    // 2-5: ne peut pas créer 2 langues avec le même nom dans un profile
    it('should not allow duplicate language title for the same profile', async () => {
      const user = await createTestUserWithProfile({
        languages: [
          {
            name: 'Anglais',
            level: 'Débutant',
            order: 1,
          },
        ],
      });

      await expect(
        prismaTest.language.create({
          data: {
            name: 'Anglais',
            level: 'Débutant',
            order: 2,
            profile: { connect: { id: user.profile.id } },
          },
        }),
      ).rejects.toThrow();
    });

    // 2-6: ne peut pas mettre une valeur invalide dans level
    it('should not allow invalid level value', async () => {
      const user = await createTestUserWithProfile();

      await expect(
        prismaTest.language.create({
          data: {
            name: 'Allemand',
            // @ts-expect-error
            level: 'ExpertDeLaMort',
            order: 1,
            profile: { connect: { id: user.profile.id } },
          },
        }),
      ).rejects.toThrow();
    });
  });

  //! 3- UPDATE TESTS
  describe('UPDATE', () => {
    // 3-1: peut mettre à jour une langue
    it('should update a language', async () => {
      const user = await createTestUserWithProfile({
        languages: [
          {
            name: 'Anglais',
            level: 'Débutant',
            order: 1,
          },
        ],
      });
      const language = await prismaTest.language.update({
        where: { id: user.profile.languages![0]!.id },
        data: { name: 'Espagnol' },
      });
      expect(language.name).toBe('Espagnol');
    });

    // 3-2: tester la mise à jour partielle d'une langue
    it('should update only provided fields', async () => {
      const user = await createTestUserWithProfile({
        languages: [
          {
            name: 'Anglais',
            level: 'Débutant',
            order: 1,
          },
        ],
      });

      await prismaTest.language.update({
        where: { id: user.profile.languages![0]!.id },
        data: { level: 'Intermédiaire' },
      });

      const updated = await prismaTest.language.findUnique({
        where: { id: user.profile.languages![0]!.id },
      });

      expect(updated!.name).toBe('Anglais');
      expect(updated!.level).toBe('Intermédiaire');
    });
  });

  //! 4- UPDATE ERROR TESTS
  describe('UPDATE ERRORS', () => {
    // 4-1: ne peut pas duplicate le name lors d'un update
    it('should not allow updating to duplicate name in same profile', async () => {
      const user = await createTestUserWithProfile({
        languages: [
          {
            name: 'Anglais',
            level: 'Débutant',
            order: 1,
          },
          {
            name: 'Espagnol',
            level: 'Débutant',
            order: 2,
          },
        ],
      });

      await expect(
        prismaTest.language.update({
          where: { id: user.profile.languages![1]!.id },
          data: { name: 'Anglais' },
        }),
      ).rejects.toThrow();
    });

    // 4-2: ne peut pas avoir de duplicate order au update
    it('should not allow updating to duplicate order', async () => {
      const user = await createTestUserWithProfile({
        languages: [
          { name: 'Anglais', level: 'Débutant', order: 1 },
          { name: 'Espagnol', level: 'Débutant', order: 2 },
        ],
      });

      await expect(
        prismaTest.language.update({
          where: { id: user.profile.languages![1]!.id },
          data: { order: 1 },
        }),
      ).rejects.toThrow();
    });

    // 4-3: ne peut pas mettre une valeur invalide dans level
    it('should not allow invalid level on update', async () => {
      const user = await createTestUserWithProfile({
        languages: [{ name: 'Français', level: 'Débutant', order: 1 }],
      });

      await expect(
        prismaTest.language.update({
          where: { id: user.profile.languages![0]!.id },
          // @ts-expect-error
          data: { level: 'UltraExpert' },
        }),
      ).rejects.toThrow();
    });
  });

  //! 5- DELETE TESTS
  describe('DELETE', () => {
    // 5-1: peut supprimer une langue
    it('should delete an language', async () => {
      const user = await createTestUserWithProfile({
        languages: [
          {
            name: 'Anglais',
            level: 'Débutant',
            order: 1,
          },
        ],
      });
      const before = await prismaTest.language.findMany({
        where: { profileId: user.profile.id },
      });
      expect(before!.length).toBe(1);
      await prismaTest.language.delete({
        where: { id: user.profile.languages![0]!.id },
      });
      const languages = await prismaTest.language.findMany({
        where: { profileId: user.profile.id },
      });
      expect(languages!.length).toBe(0);
    });

    // 5-2: supprime les langues quand le profile est supprimé
    it('should delete the languages when the profile is deleted', async () => {
      const user = await createTestUserWithProfile({
        languages: [
          {
            name: 'Anglais',
            level: 'Débutant',
            order: 1,
          },
        ],
      });
      expect(user.profile.languages!.length).toBe(1);
      await prismaTest.profile.delete({ where: { id: user.profile.id } });
      const languages = await prismaTest.language.findMany({
        where: { profileId: user.profile.id },
      });
      expect(languages!.length).toBe(0);
    });
  });

  //! 6- RELATIONS TESTS
  describe('RELATIONS', () => {
    // 6-1: garde le bon ordre des language
    it('should keep the correct order of languages', async () => {
      const user = await createTestUserWithProfile({
        languages: [
          {
            name: 'Anglais',
            level: 'Débutant',
            order: 1,
          },
          {
            name: 'Espagnol',
            level: 'Débutant',
            order: 2,
          },
        ],
      });
      const languages = await prismaTest.language.findMany({
        where: { profileId: user.profile.id },
        orderBy: { order: 'asc' },
      });
      expect(languages[0]!.order).toBe(1);
      expect(languages[1]!.order).toBe(2);
    });

    // 6-2: vérifie que le langue est lié au bon profile
    it('should link language to the correct profile', async () => {
      const user = await createTestUserWithProfile({
        languages: [
          {
            name: 'Anglais',
            level: 'Débutant',
            order: 1,
          },
        ],
      });

      const language = await prismaTest.language.findUnique({
        where: { id: user.profile.languages![0]!.id },
      });

      expect(language!.profileId).toBe(user.profile.id);
    });

    // 6-3: 2 profile peuvent avoir le même order
    it('should allow same order for different profiles', async () => {
      const user1 = await createTestUserWithProfile({
        languages: [
          {
            name: 'Anglais',
            level: 'Débutant',
            order: 1,
          },
        ],
      });

      const user2 = await createTestUserWithProfile({
        languages: [
          {
            name: 'Espagnol',
            level: 'Débutant',
            order: 1,
          },
        ],
      });

      const languages = await prismaTest.language.findMany();
      expect(languages.length).toBe(2);
    });

    // 6-4: order est 0 par défaut
    it('should set default order to 0 if not provided', async () => {
      const user = await createTestUserWithProfile({
        languages: [
          // @ts-expect-error
          {
            name: 'Italien',
            level: 'Intermédiaire',
          },
        ],
      });

      const language = user.profile.languages![0]!;
      expect(language.order).toBe(0);
    });
  });
});
