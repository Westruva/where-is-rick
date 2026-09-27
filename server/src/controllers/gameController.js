import {
	getLeaderboard,
	quitSession,
	startSession,
	submitScore,
	submitGuess,
} from "../services/gameService.js";

function normalizePlayerName(value) {
	return typeof value === "string" ? value.trim().slice(0, 20) : "";
}

function isValidGuess(body) {
	return (
		body !== null &&
		typeof body === "object" &&
		Number.isInteger(body.characterId) &&
		Number.isFinite(body.x) &&
		Number.isFinite(body.y) &&
		body.x >= 0 &&
		body.x <= 1 &&
		body.y >= 0 &&
		body.y <= 1
	);
}

function isValidSceneId(sceneId) {
	return Number.isInteger(sceneId) && sceneId >= 1 && sceneId <= 3;
}

export function createGameController(prisma) {
	return {
		async start(request, response, next) {
			const sceneId = request.body?.sceneId;
			if (!isValidSceneId(sceneId)) {
				return response
					.status(400)
					.json({ error: "Choose one of the available scenes." });
			}

			try {
				const session = await startSession(prisma, sceneId);
				response.status(201).json({ session });
			} catch (error) {
				next(error);
			}
		},

		async guess(request, response, next) {
			if (!isValidGuess(request.body)) {
				return response
					.status(400)
					.json({ error: "Choose a character and a spot on the picture." });
			}

			try {
				const result = await submitGuess(
					prisma,
					request.params.sessionId,
					request.body,
				);
				if (result.status === "unavailable")
					return response
						.status(404)
						.json({ error: "This game session is no longer active." });
				if (result.status === "invalid-character")
					return response
						.status(400)
						.json({ error: "That character is not part of this game." });
				if (result.status === "already-found")
					return response
						.status(409)
						.json({ error: "You have already found that character." });
				if (result.status === "miss") return response.json({ correct: false });
				return response.json({ correct: true, ...result });
			} catch (error) {
				next(error);
			}
		},

		async quit(request, response, next) {
			try {
				await quitSession(prisma, request.params.sessionId);
				response.json({ quit: true });
			} catch (error) {
				next(error);
			}
		},

		async saveScore(request, response, next) {
			const playerName = normalizePlayerName(request.body?.playerName);
			if (!playerName) {
				return response
					.status(400)
					.json({ error: "Enter your name to save your time." });
			}

			try {
				const result = await submitScore(
					prisma,
					request.params.sessionId,
					playerName,
				);
				if (result.status === "unavailable") {
					return response
						.status(404)
						.json({ error: "This game session was not found." });
				}
				if (result.status === "not-eligible") {
					return response
						.status(409)
						.json({ error: "Finish the scene before saving a time." });
				}
				return response.status(201).json({ entry: result });
			} catch (error) {
				next(error);
			}
		},

		async leaderboard(_request, response, next) {
			try {
				const entries = await getLeaderboard(prisma);
				response.json({ entries });
			} catch (error) {
				next(error);
			}
		},
	};
}
