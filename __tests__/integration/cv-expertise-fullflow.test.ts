import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { resetTestDB } from '../utils/setup';
import { prismaTest } from '../../lib/prismaTest';
import * as utils from '../utils/create-test-cv-full-flow';

describe('CV Fullflow Integration with expertise', () => {
  beforeEach(async () => await resetTestDB());
  afterAll(async () => await prismaTest.$disconnect());

  it('should create a CV with expertise', async () => {
    const { user, template } = await utils.createUserAndTemplate();
    const cv = await utils.createCV(user.id, template.id);
    const expertise = await utils.createExpertise(cv.id, 'Expertise 1', 'Expert', 1);
    expect(expertise.cvId).toBe(cv.id);
    expect(expertise.title).toBe('Expertise 1');
    expect(expertise.level).toBe('Expert');
    expect(expertise.order).toBe(1);
  });

  it('should delete a CV with expertise', async () => {
    const { user, template } = await utils.createUserAndTemplate();
    const cv = await utils.createCV(user.id, template.id);
    const expertise = await utils.createExpertise(cv.id, 'Expertise 1', 'Expert', 1);
    await prismaTest.cV.delete({ where: { id: cv.id } });
    const expertiseAfterDelete = await prismaTest.cvExpertise.findUnique({
      where: { id: expertise.id },
    });
    expect(expertiseAfterDelete).toBeNull();
  });
});
