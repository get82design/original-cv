import { prisma } from "../lib/prisma";
import users from "./seedDatas/seed.users.json";
import colors from "./seedDatas/seed.colors.json";
// import { seedTemplates } from "./seedDatas/seed.templates";
import { seedTemplates } from "./seedDatas/cv-template";
import { buildCvClaraDelorme } from "./seedDatas/seed.cvs";
import { seedBilling } from "./seedDatas/seed.billing";
import "dotenv/config";
import { hash } from "bcrypt";

async function main() {
	console.log("🌱 Démarrage des seeds...");

	await deleteUsers();
	await deleteTemplates();
	await deleteColors();
	await deleteBilling();

	const usersResult = await buildUsers();
	console.info("^^usersResult", usersResult);
	const colors = await buildColors();
	console.info("^^colors", colors);
	const templates = await buildTemplates();
	console.info("^^templates", templates);

	const templateStockholm = await prisma.cVTemplate.findFirst({
		where: { name: "Stockholm" },
	});
	if (!templateStockholm) {
		throw new Error("Template Stockholm not found");
	}

	await buildCvClaraDelorme(usersResult[0]!.id, templateStockholm.id);
	console.info("^^cv Clara Delorme créé");

	await seedBilling(prisma);
	console.info("^^billing (tarifs IA + packs) seedé");

	console.log("✅ Seeds terminés !");
}

async function deleteUsers() {
	await prisma.user.deleteMany();
}

async function deleteTemplates() {
	await prisma.cVTemplate.deleteMany();
}

async function deleteColors() {
	await prisma.color.deleteMany();
}

async function deleteBilling() {
	await prisma.creditPack.deleteMany();
	await prisma.aiFeaturePrice.deleteMany();
}

/**
 * buildUsers
 *
 */
async function buildUsers() {
	const userPromises = users.map(async (el) => {
		const hashedPassword = await hash(el.password, 12);
		return prisma.user.create({
			data: {
				...el,
				password: hashedPassword,
				emailVerified: el.emailVerified ? new Date(el.emailVerified) : null,
			},
		});
	});
	return await Promise.all(userPromises);
}

/**
 * buildTemplates
 *
 */
async function buildTemplates() {
	return Promise.all(
		seedTemplates.map((el) =>
			prisma.cVTemplate.create({
				data: {
					name: el.name,
					structure: el.structure,
					defaultStyles: el.defaultStyles,
				},
			}),
		),
	);
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
