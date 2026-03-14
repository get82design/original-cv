import { prismaTest } from '../../lib/prismaTest';
import { createTestCV } from './create-test-cv';

export async function createCVWithModules() {
  const { cv } = await createTestCV();

  const module1 = await prismaTest.cVModule.create({
    data: {
      type: 'skill',
      order: 1,
      cvId: cv.id,
    },
  });

  const module2 = await prismaTest.cVModule.create({
    data: {
      type: 'experience',
      order: 2,
      cvId: cv.id,
    },
  });

  return { cv, module1, module2 };
}
