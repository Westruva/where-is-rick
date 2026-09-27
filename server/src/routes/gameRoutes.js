import { Router } from "express";
import { createGameController } from "../controllers/gameController.js";

export function createGameRouter(prisma) {
	const router = Router();
	const controller = createGameController(prisma);

	router.post("/sessions", controller.start);
	router.post("/sessions/:sessionId/quit", controller.quit);
	router.post("/sessions/:sessionId/score", controller.saveScore);
	router.post("/sessions/:sessionId/guesses", controller.guess);
	router.get("/leaderboard", controller.leaderboard);

	return router;
}
