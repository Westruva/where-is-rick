import { isCharacterAtGuess } from "./guessValidation.js";

export async function startSession(prisma, sceneId) {
	const session = await prisma.gameSession.create({
		data: { sceneId },
	});
	const characters = await prisma.character.findMany({
		where: { sceneId },
		orderBy: { id: "asc" },
		select: { id: true, name: true },
	});

	return { ...session, characters };
}

export async function quitSession(prisma, sessionId) {
	return prisma.gameSession.updateMany({
		where: { id: sessionId, endedAt: null },
		data: { endedAt: new Date() },
	});
}

export async function submitScore(prisma, sessionId, playerName) {
	const session = await prisma.gameSession.findUnique({
		where: { id: sessionId },
		include: {
			discoveries: { select: { characterId: true } },
			leaderboardEntry: { select: { id: true } },
		},
	});

	if (!session) return { status: "unavailable" };
	if (!session.endedAt || session.leaderboardEntry) {
		return { status: "not-eligible" };
	}

	const totalCharacters = await prisma.character.count({
		where: { sceneId: session.sceneId },
	});
	if (session.discoveries.length !== totalCharacters) {
		return { status: "not-eligible" };
	}

	const elapsedSeconds = Math.max(
		0,
		Math.floor((session.endedAt - session.startedAt) / 1000),
	);

	return prisma.$transaction(async (transaction) => {
		await transaction.gameSession.update({
			where: { id: session.id },
			data: { playerName },
		});
		return transaction.leaderboardEntry.create({
			data: {
				gameSessionId: session.id,
				playerName,
				elapsedSeconds,
				completedAt: session.endedAt,
			},
		});
	});
}

export async function submitGuess(prisma, sessionId, guess) {
	const session = await prisma.gameSession.findUnique({
		where: { id: sessionId },
		include: { discoveries: { select: { characterId: true } } },
	});

	if (!session || session.endedAt) return { status: "unavailable" };

	const character = await prisma.character.findUnique({
		where: { id: guess.characterId },
	});
	if (!character || character.sceneId !== session.sceneId) {
		return { status: "invalid-character" };
	}

	if (session.discoveries.some((item) => item.characterId === character.id)) {
		return { status: "already-found" };
	}

	if (!isCharacterAtGuess(guess, character)) return { status: "miss" };

	return prisma.$transaction(async (transaction) => {
		await transaction.foundCharacter.create({
			data: { gameSessionId: session.id, characterId: character.id },
		});
		const discoveries = await transaction.foundCharacter.findMany({
			where: { gameSessionId: session.id },
			select: { characterId: true },
		});
		const totalCharacters = await transaction.character.count({
			where: { sceneId: session.sceneId },
		});
		const completed = discoveries.length === totalCharacters;
		let elapsedSeconds;

		if (completed) {
			const endedAt = new Date();
			elapsedSeconds = Math.max(
				0,
				Math.floor((endedAt - session.startedAt) / 1000),
			);
			await transaction.gameSession.update({
				where: { id: session.id },
				data: { endedAt },
			});
		}

		return {
			status: "found",
			character: { id: character.id, name: character.name },
			foundCharacterIds: discoveries.map((item) => item.characterId),
			completed,
			elapsedSeconds,
		};
	});
}

export async function getLeaderboard(prisma) {
	return prisma.leaderboardEntry.findMany({
		orderBy: [{ elapsedSeconds: "asc" }, { completedAt: "asc" }],
		take: 10,
		select: {
			id: true,
			playerName: true,
			elapsedSeconds: true,
			completedAt: true,
		},
	});
}
