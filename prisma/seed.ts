import { prisma } from "../lib/prisma";
import users from "./seedDatas/seed.users.json";
import colors from "./seedDatas/seed.colors.json";
import { seedTemplates } from "./seedDatas/cv-template";
import { styleCategoryForTemplateName } from "./seedDatas/cv-template/templateStyleCategories";
import { buildCvClaraDelorme } from "./seedDatas/seed.cvs";
import { seedBilling } from "./seedDatas/seed.billing";
import { slugifyTemplateName } from "../src/services/cv/templateSlug";
import { UserRole } from "../generated/prisma/enums";
import "dotenv/config";
import { hash } from "bcrypt";
import type { Prisma } from "../generated/prisma/client";

async function main() {
	console.log("🌱 Démarrage des seeds...");

	await deleteUsers();
	await deleteTemplates();
	await deleteColors();
	await deleteBilling();

	const usersResult = await buildUsers();
	console.info("^^usersResult", usersResult);
	const colorsResult = await buildColors();
	console.info("^^colors", colorsResult);
	const templatesResult = await buildTemplates();
	console.info("^^templates", templatesResult);

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

function seedUserRole(role: string | undefined): UserRole | undefined {
	if (role === UserRole.ADMIN) return UserRole.ADMIN;
	if (role === UserRole.USER) return UserRole.USER;
	return undefined;
}

/**
 * buildUsers — séquentiel (peu d’entrées ; évite de saturer le pool).
 */
async function buildUsers() {
	const result = [];
	for (const el of users) {
		const hashedPassword = await hash(el.password, 12);
		const role = seedUserRole("role" in el ? el.role : undefined);
		const data: Prisma.UserCreateInput = {
			name: el.name,
			email: el.email,
			image: el.image,
			password: hashedPassword,
			emailVerified: el.emailVerified ? new Date(el.emailVerified) : null,
			...("freeDownloadsRemaining" in el
				? { freeDownloadsRemaining: el.freeDownloadsRemaining }
				: {}),
			...(role ? { role } : {}),
		};
		result.push(await prisma.user.create({ data }));
	}
	return result;
}

/**
 * buildTemplates — createMany = 1 requête (évite Promise.all × N connexions).
 */
async function buildTemplates() {
	return prisma.cVTemplate.createMany({
		data: seedTemplates.map((el) => ({
			name: el.name,
			slug: slugifyTemplateName(el.name),
			structure: el.structure,
			defaultStyles: el.defaultStyles,
			styleCategory: styleCategoryForTemplateName(el.name),
		})),
	});
}

/**
 * buildColors — createMany = 1 requête (le Promise.all d’avant saturait Postgres).
 */
async function buildColors() {
	return prisma.color.createMany({
		data: colors.map((el) => ({ ...el })),
	});
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
