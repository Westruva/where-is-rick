import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { characters } from "../src/data/characters.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

try {
	const characterNames = [
		...new Set(characters.map((character) => character.name)),
	];
	await prisma.character.deleteMany({
		where: { name: { notIn: characterNames } },
	});

	for (const character of characters) {
		await prisma.character.upsert({
			where: {
				name_sceneId: { name: character.name, sceneId: character.sceneId },
			},
			update: {
				x: character.x,
				y: character.y,
				xMin: character.xMin ?? null,
				yMin: character.yMin ?? null,
				xMax: character.xMax ?? null,
				yMax: character.yMax ?? null,
			},
			create: character,
		});
	}
} finally {
	await prisma.$disconnect();
}
