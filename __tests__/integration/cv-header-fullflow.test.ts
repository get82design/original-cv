import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { resetTestDB } from '../utils/setup';
import { prismaTest } from '../../lib/prismaTest';
import * as utils from '../utils/create-test-cv-full-flow';

describe('CV Fullflow Integration with competences', () => {
  beforeEach(async () => await resetTestDB());
  afterAll(async () => await prismaTest.$disconnect());

  it('should create a CV with header', async () => {
    const { user, template } = await utils.createUserAndTemplate();
    const cv = await utils.createCV(user.id, template.id);
    const header = await utils.createHeader(
      cv.id,
      'John Doe',
      'Software Engineer',
      '1234567890',
      'john.doe@example.com',
      'New York',
      'https://portfolio.com',
      'Doe',
      'John',
    );
    expect(header.cvId).toBe(cv.id);
    expect(header.title).toBe('John Doe');
    expect(header.subtitle).toBe('Software Engineer');
    expect(header.phone).toBe('1234567890');
    expect(header.email).toBe('john.doe@example.com');
  });

  it('should delete a CV with header', async () => {
    const { user, template } = await utils.createUserAndTemplate();
    const cv = await utils.createCV(user.id, template.id);
    const header = await utils.createHeader(
      cv.id,
      'John Doe',
      'Software Engineer',
      '1234567890',
      'john.doe@example.com',
      'New York',
      'https://portfolio.com',
      'Doe',
      'John',
    );
    await prismaTest.cV.delete({ where: { id: cv.id } });
    const headerAfterDelete = await prismaTest.cvHeader.findUnique({ where: { id: header.id } });
    expect(headerAfterDelete).toBeNull();
  });
});
