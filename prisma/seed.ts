import { prisma } from '../lib/prisma';
import users from './seedDatas/seed.users.json';
import colors from './seedDatas/seed.colors.json';
import 'dotenv/config';

async function main() {
  console.log('🌱 Démarrage des seeds...');

  await deleteUsers();
  await deleteColors();

  const usersResult = await buildUsers();
  console.info('^^usersResult', usersResult);
  const colors = await buildColors();
  console.info('^^colors', colors);

  // === Users ===
  //   const user = await prisma.user.upsert({
  //     where: { email: 'test@example.com' },
  //     update: {},
  //     create: {
  //       email: 'test@example.com',
  //       name: 'Test User',
  //       password: 'hashedpassword',
  //     },
  //   });

  //   // === Profile ===
  //   const profile = await prisma.profile.upsert({
  //     where: { userId: user.id },
  //     update: {},
  //     create: {
  //       userId: user.id,
  //       firstName: 'Test',
  //       lastName: 'User',
  //       phone: '0123456789',
  //       location: 'Paris',
  //       description: 'Je suis un testeur de CV.',
  //     },
  //   });

  //   // === Skills ===
  //   const skillsData = [
  //     { name: 'JavaScript', level: 'Expert' },
  //     { name: 'TypeScript', level: 'Intermédiaire' },
  //     { name: 'React', level: 'Intermédiaire' },
  //   ];

  //   const skills = await Promise.all(
  //     skillsData.map((skill) =>
  //       prisma.skill.upsert({
  //         where: { id: skill.name + '_' + profile.id },
  //         update: {},
  //         create: {
  //           name: skill.name,
  //           level: skill.level,
  //           profileId: profile.id,
  //         },
  //       }),
  //     ),
  //   );

  //   // === CV Templates ===
  //   const template = await prisma.cVTemplate.upsert({
  //     where: { id: 'template-default' },
  //     update: {},
  //     create: {
  //       id: 'template-default',
  //       name: 'Template Classique',
  //       structure: {
  //         sections: ['skills', 'experience', 'education'],
  //       },
  //       defaultStyles: {
  //         fontSize: 14,
  //         color: '#000000',
  //         align: 'left',
  //       },
  //     },
  //   });

  //   // === CV ===
  //   const cv = await prisma.cV.upsert({
  //     where: { id: 'cv-' + user.id },
  //     update: {},
  //     create: {
  //       id: 'cv-' + user.id,
  //       title: 'Mon premier CV',
  //       templateId: template.id,
  //       userId: user.id,
  //     },
  //   });

  //   // === CV Modules ===
  //   const cvModuleSkills = await prisma.cVModule.upsert({
  //     where: { id: 'cvmod-skills-' + cv.id },
  //     update: {},
  //     create: {
  //       id: 'cvmod-skills-' + cv.id,
  //       type: 'skill',
  //       order: 1,
  //       cvId: cv.id,
  //       settings: {
  //         fontSize: 12,
  //         color: '#ff0000',
  //         align: 'left',
  //         show: true,
  //       },
  //     },
  //   });

  //   // === CV Module Items ===
  //   await Promise.all(
  //     skills.map((skill) =>
  //       prisma.cVModuleItem.upsert({
  //         where: { id: 'cvmoditem-' + cvModuleSkills.id + '-' + skill.id },
  //         update: {},
  //         create: {
  //           id: 'cvmoditem-' + cvModuleSkills.id + '-' + skill.id,
  //           moduleId: cvModuleSkills.id,
  //           itemType: 'skill',
  //           itemId: skill.id,
  //         },
  //       }),
  //     ),
  //   );

  console.log('✅ Seeds terminés !');
}

async function deleteUsers() {
  await prisma.user.deleteMany();
}

async function deleteColors() {
  await prisma.color.deleteMany();
}

/**
 * buildUsers
 *
 * @returns {*}
 */
async function buildUsers() {
  const userPromises = users.map(async (el) => {
    const data = { ...el };
    return prisma.user.create({ data });
  });
  return await Promise.all(userPromises);
}

/**
 * buildColors
 *
 */
async function buildColors() {
  const colorsPromises = colors.map(async (el) => {
    const data = { ...el };
    return prisma.color.create({ data });
  });
  return await Promise.all(colorsPromises);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
