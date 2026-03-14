import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { resetTestDB } from '../utils/setup';
import { prismaTest } from '../../lib/prismaTest';
import * as utils from '../utils/create-test-cv-full-flow';

describe('CV Fullflow Integration with education', () => {
  beforeEach(async () => await resetTestDB());
  afterAll(async () => await prismaTest.$disconnect());

  it('should create a CV with education', async () => {
    const { user, template } = await utils.createUserAndTemplate();
    const cv = await utils.createCV(user.id, template.id);
    const start = new Date();
    const end = new Date();
    const education = await utils.createEducation(
      cv.id,
      'Master Informatique',
      'Sorbonne',
      'Master',
      start,
      end,
      'Paris',
      true,
      1,
    );
    expect(education.cvId).toBe(cv.id);
    expect(education.title).toBe('Master Informatique');
    expect(education.school).toBe('Sorbonne');
    expect(education.degree).toBe('Master');
    expect(education.start).toEqual(start);
    expect(education.end).toEqual(end);
    expect(education.city).toBe('Paris');
    expect(education.obtained).toBe(true);
    expect(education.order).toBe(1);
  });

  it('should delete a CV with education', async () => {
    const { user, template } = await utils.createUserAndTemplate();
    const cv = await utils.createCV(user.id, template.id);
    const education = await utils.createEducation(
      cv.id,
      'Master Informatique',
      'Sorbonne',
      'Master',
      new Date(),
      new Date(),
      'Paris',
      true,
      1,
    );
    await prismaTest.cV.delete({ where: { id: cv.id } });
    const educationAfterDelete = await prismaTest.cvEducation.findUnique({
      where: { id: education.id },
    });
    expect(educationAfterDelete).toBeNull();
  });
});
