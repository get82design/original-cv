import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { resetTestDB } from '../utils/setup';
import { prismaTest } from '../../lib/prismaTest';
import * as utils from '../utils/create-test-cv-full-flow';

describe('CV Fullflow Integration with social media', () => {
  beforeEach(async () => await resetTestDB());
  afterAll(async () => await prismaTest.$disconnect());

  it('should create a CV with social media with all fields', async () => {
    const { user, template } = await utils.createUserAndTemplate();
    const cv = await utils.createCV(user.id, template.id);
    const socialMedia = await utils.createSocialMedia(
      cv.id,
      'LinkedIn',
      'https://linkedin.com/me',
      1,
    );
    expect(socialMedia.cvId).toBe(cv.id);
    expect(socialMedia.socialNetwork).toBe('LinkedIn');
    expect(socialMedia.username).toBe('https://linkedin.com/me');
    expect(socialMedia.order).toBe(1);
  });

  it('should delete a CV with social media', async () => {
    const { user, template } = await utils.createUserAndTemplate();
    const cv = await utils.createCV(user.id, template.id);
    const socialMedia = await utils.createSocialMedia(
      cv.id,
      'LinkedIn',
      'https://linkedin.com/me',
      1,
    );
    await prismaTest.cvSocialMedia.delete({ where: { id: socialMedia.id } });
    const deletedSocialMedia = await prismaTest.cvSocialMedia.findUnique({
      where: { id: socialMedia.id },
    });
    expect(deletedSocialMedia).toBeNull();
  });
});
