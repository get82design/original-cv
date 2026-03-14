import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { resetTestDB } from '../utils/setup';
import { prismaTest } from '../../lib/prismaTest';
import * as utils from '../utils/create-test-cv-full-flow';

describe('CV Fullflow Integration with certification', () => {
  beforeEach(async () => await resetTestDB());
  afterAll(async () => await prismaTest.$disconnect());

  it('should create a CV with certification', async () => {
    const { user, template } = await utils.createUserAndTemplate();
    const cv = await utils.createCV(user.id, template.id);
    const certification = await utils.createCertification(
      cv.id,
      'Certification 1',
      1,
      'Organisme 1',
    );
    expect(certification.cvId).toBe(cv.id);
    expect(certification.title).toBe('Certification 1');
    expect(certification.organismeCertification).toBe('Organisme 1');
    expect(certification.order).toBe(1);
  });

  it('should create a CV with certification without optional fields', async () => {
    const { user, template } = await utils.createUserAndTemplate();
    const cv = await utils.createCV(user.id, template.id);
    const certification = await utils.createCertification(cv.id, 'Certification 1', 1);
    expect(certification.cvId).toBe(cv.id);
    expect(certification.title).toBe('Certification 1');
    expect(certification.organismeCertification).toBeNull();
    expect(certification.order).toBe(1);
  });

  it('should delete a CV with certification', async () => {
    const { user, template } = await utils.createUserAndTemplate();
    const cv = await utils.createCV(user.id, template.id);
    const certification = await utils.createCertification(
      cv.id,
      'Certification 1',
      1,
      'Organisme 1',
    );
    await prismaTest.cV.delete({ where: { id: cv.id } });
    const certificationAfterDelete = await prismaTest.cvCertification.findUnique({
      where: { id: certification.id },
    });
    expect(certificationAfterDelete).toBeNull();
  });
});
