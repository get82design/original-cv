import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { resetTestDB } from '../utils/setup';
import { prismaTest } from '../../lib/prismaTest';
import * as utils from '../utils/create-test-cv-full-flow';

describe('CV Fullflow Integration with passion', () => {
  beforeEach(async () => await resetTestDB());
  afterAll(async () => await prismaTest.$disconnect());

  it('should create a CV with passion', async () => {
    const { user, template } = await utils.createUserAndTemplate();
    const cv = await utils.createCV(user.id, template.id);
    const passion = await utils.createPassion(cv.id, 'Passion 1', '🎵', 1);
    expect(passion.cvId).toBe(cv.id);
    expect(passion.title).toBe('Passion 1');
    expect(passion.icon).toBe('🎵');
    expect(passion.order).toBe(1);
  });

  it('should delete a CV with passion', async () => {
    const { user, template } = await utils.createUserAndTemplate();
    const cv = await utils.createCV(user.id, template.id);
    const passion = await utils.createPassion(cv.id, 'Passion 1', '🎵', 1);
    await prismaTest.cV.delete({ where: { id: cv.id } });
    const passionAfterDelete = await prismaTest.cvPassion.findUnique({ where: { id: passion.id } });
    expect(passionAfterDelete).toBeNull();
  });
});
