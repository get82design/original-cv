import { prismaTest } from '../../lib/prismaTest';
import { createTestUser } from './create-test-user';
import { createTestTemplate } from './create-test-template';
import type {
  CV,
  CVTemplate,
  CvExperience,
  CvEducation,
  CvSkillGroup,
  CVModule,
  User,
  CvAchievement,
  CvVolunteering,
  CvStrength,
  Skill,
  CvSkill,
} from '../../generated/prisma-test/client';

export async function createTestUserWithTemplateAndCV() {
  const user = await createTestUser();
  const template = await createTestTemplate();

  const cv = await prismaTest.cV.create({
    data: {
      title: 'Test CV',
      userId: user.id,
      templateId: template.id,
    },
  });

  return { user, template, cv };
}
