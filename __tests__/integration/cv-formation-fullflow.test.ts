import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { resetTestDB } from '../utils/setup';
import { prismaTest } from '../../lib/prismaTest';
import * as utils from '../utils/create-test-cv-full-flow';

describe('CV Fullflow Integration with formation', () => {
  beforeEach(async () => await resetTestDB());
  afterAll(async () => await prismaTest.$disconnect());

  it('should create a CV with formation', async () => {
    const { user, template } = await utils.createUserAndTemplate();
    const cv = await utils.createCV(user.id, template.id);
    const start = new Date();
    const end = new Date();
    const formation = await utils.createFormation(
      cv.id,
      'Formation 1',
      start,
      1,
      'Organisme 1',
      end,
    );
    expect(formation.cvId).toBe(cv.id);
    expect(formation.title).toBe('Formation 1');
    expect(formation.organismeFormation).toBe('Organisme 1');
    expect(formation.start).toEqual(start);
    expect(formation.end).toEqual(end);
    expect(formation.order).toBe(1);
  });

  it('should create a CV with formation without optional fields', async () => {
    const { user, template } = await utils.createUserAndTemplate();
    const cv = await utils.createCV(user.id, template.id);
    const start = new Date();
    const formation = await utils.createFormation(cv.id, 'Formation 1', start, 1);
    expect(formation.cvId).toBe(cv.id);
    expect(formation.title).toBe('Formation 1');
    expect(formation.organismeFormation).toBeNull();
    expect(formation.start).toEqual(start);
    expect(formation.end).toBeNull();
    expect(formation.order).toBe(1);
  });

  it('should delete a CV with formation', async () => {
    const { user, template } = await utils.createUserAndTemplate();
    const cv = await utils.createCV(user.id, template.id);
    const formation = await utils.createFormation(
      cv.id,
      'Formation 1',
      new Date(),
      1,
      'Organisme 1',
      new Date(),
    );
    await prismaTest.cV.delete({ where: { id: cv.id } });
    const formationAfterDelete = await prismaTest.cvFormation.findUnique({
      where: { id: formation.id },
    });
    expect(formationAfterDelete).toBeNull();
  });
});
