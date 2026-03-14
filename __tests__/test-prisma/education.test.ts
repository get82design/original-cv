import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestUserWithProfile } from '../utils/create-test-user-with-profile';
import { resetTestDB } from '../utils/setup';
import { prismaTest } from '../../lib/prismaTest';

describe('Education model', () => {
  // Nettoyage DB avant chaque test
  beforeEach(async () => {
    await resetTestDB();
  });

  afterAll(async () => {
    await prismaTest.$disconnect();
  });

  //? 15 tests pour le model Education => 15 tests ok
  // model Education {
  //   id        String   @id @default(cuid())
  //   title     String?
  //   school    String
  //   city      String?
  //   degree    String
  //   start     DateTime
  //   end       DateTime?
  //   obtained  Boolean @default(false)

  //   order     Int @default(0)
  //   profile   Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  //   profileId String

  //   @@unique([profileId, title])
  //   @@unique([profileId, order]) // pas de doublon dans un profile
  //   @@index([profileId])
  // }

  //! 1- CREATE
  describe('CREATE', () => {
    // 1-1: peut créer un profile avec des diplômes
    it('should create a profile with educations', async () => {
      const user = await createTestUserWithProfile({
        educations: [
          {
            title: 'Baccalauréat',
            school: 'Lycée de Paris',
            degree: 'Baccalauréat',
            start: new Date('2020-01-01'),
            end: new Date('2020-12-31'),
            obtained: true,
            order: 1,
          },
        ],
      });
      const education = user.profile!.educations![0]!;
      expect(education.title).toBe('Baccalauréat');
      expect(education.school).toBe('Lycée de Paris');
      expect(education.degree).toBe('Baccalauréat');
    });
  });

  //! 2- CREATE ERROR TESTS
  describe('CREATE ERRORS', () => {
    // 2-1: ne peut pas créer un diplôme sans un profile
    it('should not create an education without a profile', async () => {
      await expect(
        prismaTest.education.create({
          data: {
            title: 'Baccalauréat',
            school: 'Lycée de Paris',
            degree: 'Baccalauréat',
            start: new Date('2020-01-01'),
            end: new Date('2020-12-31'),
            obtained: true,
            order: 1,
            profile: { connect: { id: 'non-existing-id' } },
          },
        }),
      ).rejects.toThrow();
    });

    // 2-2: ne peut pas créer un diplôme sans un degree
    it('should not create an education without a degree', async () => {
      const user = await createTestUserWithProfile();
      await expect(
        prismaTest.education.create({
          // @ts-expect-error - degree is required
          data: {
            title: 'Baccalauréat',
            school: 'Lycée de Paris',
            start: new Date('2020-01-01'),
            end: new Date('2020-12-31'),
            obtained: true,
            order: 1,
            profile: { connect: { id: user.profile.id } },
          },
        }),
      ).rejects.toThrow();
    });

    // 2-3: ne peut pas créer un diplôme sans un school
    it('should not create an education without a school', async () => {
      const user = await createTestUserWithProfile();

      await expect(
        prismaTest.education.create({
          // @ts-expect-error
          data: {
            title: 'Test',
            degree: 'Test',
            start: new Date(),
            order: 1,
            profile: { connect: { id: user.profile.id } },
          },
        }),
      ).rejects.toThrow();
    });

    // 2-4: ne peut pas créer un diplôme sans une start date
    it('should not create an education without a start date', async () => {
      const user = await createTestUserWithProfile();

      await expect(
        prismaTest.education.create({
          // @ts-expect-error
          data: {
            title: 'Test',
            school: 'Test',
            degree: 'Test',
            order: 1,
            profile: { connect: { id: user.profile.id } },
          },
        }),
      ).rejects.toThrow();
    });

    // 2-5: ne peut pas duplicate le title lors d'un create
    it('should not allow duplicate title in same profile', async () => {
      const user = await createTestUserWithProfile({
        educations: [
          {
            title: 'BTS',
            school: 'School',
            degree: 'Degree',
            start: new Date(),
            order: 1,
            end: new Date(),
            obtained: true,
          },
        ],
      });

      await expect(
        prismaTest.education.create({
          data: {
            title: 'BTS',
            school: 'Another School',
            degree: 'Degree',
            start: new Date(),
            order: 2,
            profile: { connect: { id: user.profile.id } },
          },
        }),
      ).rejects.toThrow(/Unique constraint failed/);
    });

    // 2-6: ne peut pas duplicate le order lors d'un create
    it('should not allow duplicate order in same profile', async () => {
      const user = await createTestUserWithProfile({
        educations: [
          {
            title: 'BTS',
            school: 'School',
            degree: 'Degree',
            start: new Date(),
            order: 1,
            end: new Date(),
            obtained: true,
          },
        ],
      });

      await expect(
        prismaTest.education.create({
          data: {
            title: 'Licence',
            school: 'School',
            degree: 'Degree',
            start: new Date(),
            order: 1,
            profile: { connect: { id: user.profile.id } },
          },
        }),
      ).rejects.toThrow(/Unique constraint failed/);
    });
  });

  //! 3- UPDATE TESTS
  describe('UPDATE', () => {
    // 3-1: peut mettre à jour un diplôme
    it('should update an education', async () => {
      const user = await createTestUserWithProfile({
        educations: [
          {
            title: 'Baccalauréat',
            school: 'Lycée de Paris',
            degree: 'Baccalauréat',
            start: new Date('2020-01-01'),
            end: new Date('2020-12-31'),
            obtained: true,
            order: 1,
          },
        ],
      });
      const updatedEducation = await prismaTest.education.update({
        where: { id: user.profile.educations![0]!.id },
        data: { title: 'Baccalauréat 2' },
      });
      expect(updatedEducation).toBeDefined();
      expect(updatedEducation.title).toBe('Baccalauréat 2');
    });
  });

  //! 4- UPDATE ERROR TESTS
  describe('UPDATE ERRORS', () => {
    // 4-1: ne peut pas duplicate le title lors d'un update
    it('should not allow duplicate title on update', async () => {
      const user = await createTestUserWithProfile({
        educations: [
          {
            title: 'BTS',
            school: 'S1',
            degree: 'D1',
            start: new Date(),
            order: 1,
            end: new Date(),
            obtained: true,
          },
          {
            title: 'Licence',
            school: 'S2',
            degree: 'D2',
            start: new Date(),
            order: 2,
            end: new Date(),
            obtained: true,
          },
        ],
      });

      await expect(
        prismaTest.education.update({
          where: { id: user.profile.educations![1]!.id },
          data: { title: 'BTS' },
        }),
      ).rejects.toThrow(/Unique constraint failed/);
    });

    // 4-2: ne peut pas duplicate le order lors d'un update
    it('should not allow duplicate order on update', async () => {
      const user = await createTestUserWithProfile({
        educations: [
          {
            title: 'BTS',
            school: 'S1',
            degree: 'D1',
            start: new Date(),
            order: 1,
            end: new Date(),
            obtained: true,
          },
          {
            title: 'Licence',
            school: 'S2',
            degree: 'D2',
            start: new Date(),
            order: 2,
            end: new Date(),
            obtained: true,
          },
        ],
      });

      await expect(
        prismaTest.education.update({
          where: { id: user.profile.educations![1]!.id },
          data: { order: 1 },
        }),
      ).rejects.toThrow(/Unique constraint failed/);
    });
  });

  //! 5- DELETE TESTS
  describe('DELETE', () => {
    // 5-1: peut supprimer un diplôme
    it('should delete an education', async () => {
      const user = await createTestUserWithProfile({
        educations: [
          {
            title: 'Baccalauréat',
            school: 'Lycée de Paris',
            degree: 'Baccalauréat',
            start: new Date('2020-01-01'),
            end: new Date('2020-12-31'),
            obtained: true,
            order: 1,
          },
        ],
      });
      await prismaTest.education.delete({
        where: { id: user.profile.educations![0]!.id },
      });
      const deletedEducation = await prismaTest.education.findUnique({
        where: { id: user.profile.educations![0]!.id },
      });
      expect(deletedEducation).toBeNull();
    });

    // 5-2: supprime les diplômes quand le profile est supprimé
    it('should delete the educations when the profile is deleted', async () => {
      const user = await createTestUserWithProfile({
        educations: [
          {
            title: 'Baccalauréat',
            school: 'Lycée de Paris',
            degree: 'Baccalauréat',
            start: new Date('2020-01-01'),
            end: new Date('2020-12-31'),
            obtained: true,
            order: 1,
          },
        ],
      });
      expect(user.profile.educations!.length).toBe(1);
      await prismaTest.profile.delete({ where: { id: user.profile.id } });
      const educations = await prismaTest.education.findMany({
        where: { profileId: user.profile.id },
      });
      expect(educations!.length).toBe(0);
    });
  });

  //! 6- RELATIONS TESTS
  describe('RELATIONS', () => {
    // 6-1: garde le bon ordre des diplômes
    it('should keep the correct order of educations', async () => {
      const user = await createTestUserWithProfile({
        educations: [
          {
            title: 'Baccalauréat 2',
            school: 'Lycée de Paris',
            degree: 'Baccalauréat',
            start: new Date('2020-01-01'),
            end: new Date('2020-12-31'),
            obtained: true,
            order: 2,
          },
          {
            title: 'Baccalauréat',
            school: 'Lycée de Paris',
            degree: 'Baccalauréat',
            start: new Date('2020-01-01'),
            end: new Date('2020-12-31'),
            obtained: true,
            order: 1,
          },
        ],
      });

      const educations = await prismaTest.education.findMany({
        where: { profileId: user.profile.id },
        orderBy: { order: 'asc' },
      });

      expect(educations[0]!.order).toBe(1);
    });

    // 6-2: obtient est false par défaut
    it('should set obtained to false by default', async () => {
      const user = await createTestUserWithProfile({
        educations: [
          // @ts-expect-error - obtained is required
          {
            title: 'Test',
            school: 'Test',
            degree: 'Test',
            start: new Date(),
            order: 1,
          },
        ],
      });

      const education = user.profile.educations![0];
      expect(education!.obtained).toBe(false);
    });
  });

  // 6-3: vérifie que le diplôme est lié au bon profile
  it('should link education to correct profile', async () => {
    const user = await createTestUserWithProfile({
      educations: [
        {
          title: 'BTS',
          school: 'School',
          degree: 'Degree',
          start: new Date(),
          order: 1,
          end: new Date(),
          obtained: true,
        },
      ],
    });

    const education = await prismaTest.education.findUnique({
      where: { id: user.profile.educations![0]!.id },
      include: { profile: true },
    });

    expect(education!.profileId).toBe(user.profile.id);
    expect(education!.profile.id).toBe(user.profile.id);
  });
});
