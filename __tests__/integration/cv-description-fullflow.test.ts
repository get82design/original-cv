import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { resetTestDB } from '../utils/setup';
import { prismaTest } from '../../lib/prismaTest';
import * as utils from '../utils/create-test-cv-full-flow';

describe('CV Fullflow Integration with competences', () => {
  beforeEach(async () => await resetTestDB());
  afterAll(async () => await prismaTest.$disconnect());

  it('should create a CV with description', async () => {
    const { user, template } = await utils.createUserAndTemplate();
    const cv = await utils.createCV(user.id, template.id);
    const description = await utils.createDescription(cv.id, 'Software Engineer');
    expect(description.cvId).toBe(cv.id);
    expect(description.description).toBe('Software Engineer');
  });

  it('should delete a CV with description', async () => {
    const { user, template } = await utils.createUserAndTemplate();
    const cv = await utils.createCV(user.id, template.id);
    const description = await utils.createDescription(cv.id, 'Software Engineer');
    await prismaTest.cV.delete({ where: { id: cv.id } });
    const descriptionAfterDelete = await prismaTest.cvDescription.findUnique({
      where: { id: description.id },
    });
    expect(descriptionAfterDelete).toBeNull();
  });
});
