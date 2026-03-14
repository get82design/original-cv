import { prismaTest } from '../../lib/prismaTest';
import { createTestCV } from './create-test-cv';

export async function createTestModule() {
  const { cv } = await createTestCV();

  const module = await prismaTest.cVModule.create({
    data: {
      type: 'skill',
      order: 1,
      cvId: cv.id,
      settings: { fontSize: 14 },
    },
  });

  return { cv, module };
}
