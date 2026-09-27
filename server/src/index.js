import "dotenv/config";
import cors from "cors";
import express from "express";
import { createGameRouter } from "./routes/gameRoutes.js";
import { prisma } from "./lib/prisma.js";

const app = express();
const port = Number(process.env.PORT) || 3001;
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
	.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean);

app.use(
	cors({
		origin(origin, callback) {
			if (!origin || allowedOrigins.includes(origin)) {
				return callback(null, true);
			}
			return callback(new Error("Origin is not allowed by CORS."));
		},
	}),
);
app.use(express.json());

app.get("/api/health", (_request, response) => {
	response.json({ status: "ok" });
});
app.use("/api/game", createGameRouter(prisma));

app.use((error, _request, response, _next) => {
	console.error(error);
	response
		.status(500)
		.json({ error: "Something went wrong. Please try again." });
});

app.listen(port, () => {
	console.log(`Where's Rick API listening on port ${port}`);
});
