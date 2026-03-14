import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { resetTestDB } from '../utils/setup';
import { prismaTest } from '../../lib/prismaTest';
import * as utils from '../utils/create-test-cv-full-flow';

describe('CV Fullflow Integration with strength', () => {
  beforeEach(async () => await resetTestDB());
  afterAll(async () => await prismaTest.$disconnect());

  it('should create a CV with strength with all fields', async () => {
    const { user, template } = await utils.createUserAndTemplate();
    const cv = await utils.createCV(user.id, template.id);
    const strength = await utils.createStrength(cv.id, 'Strength 1', 1, 'faPlus');
    expect(strength.cvId).toBe(cv.id);
    expect(strength.title).toBe('Strength 1');
    expect(strength.icon).toBe('faPlus');
    expect(strength.order).toBe(1);
  });

  it('should create a CV with strength without optional fields', async () => {
    const { user, template } = await utils.createUserAndTemplate();
    const cv = await utils.createCV(user.id, template.id);
    const strength = await utils.createStrength(cv.id, 'Strength 1', 1);
    expect(strength.cvId).toBe(cv.id);
    expect(strength.title).toBe('Strength 1');
    expect(strength.icon).toBeNull();
    expect(strength.order).toBe(1);
  });

  it('should delete a CV with strength', async () => {
    const { user, template } = await utils.createUserAndTemplate();
    const cv = await utils.createCV(user.id, template.id);
    const strength = await utils.createStrength(cv.id, 'Strength 1', 1, 'faPlus');
    await prismaTest.cvStrength.delete({ where: { id: strength.id } });
    const deletedStrength = await prismaTest.cvStrength.findUnique({ where: { id: strength.id } });
    expect(deletedStrength).toBeNull();
  });
});
