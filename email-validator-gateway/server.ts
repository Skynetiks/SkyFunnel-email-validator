import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import { z } from "zod";

import { addEmailsToQueue } from "./queue";
import { getRedisConnection } from "./redis";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Async handler wrapper for Express routes
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

app.use(express.urlencoded({ extended: true, limit: "200mb" }));
app.use(express.json({ limit: "200mb" }));
app.use(morgan("tiny"));

app.post("/verify-emails", asyncHandler(async (req, res) => {
	const authToken = req.headers['authorization'];

	if (!authToken) {
		res.status(401).send('Authorization token is required');
		return;
	}

	if (authToken !== process.env.AUTH_TOKEN) {
		res.status(403).send('Invalid authorization token');
		return;
	}

	const { emails, organizationId, contactListId, userId, shouldUpdateLead } = req.body;
	const validatedEmails = z.array(z.string()).nonempty().safeParse(emails);
	if (!validatedEmails.success) {
		return res.status(400).json({
			success: false,
			message: "Invalid email",
		});
	}

	const taskId = req.body.taskId || userId || Math.round(new Date().getTime() * Math.random() * 1000);
	const redisData = {
		taskId,
		total: validatedEmails.data.length,
		pending: validatedEmails.data.length,
		failed: [],
		completed: 0,
	};

	const client = getRedisConnection();

	if (!client) {
		return res.status(500).json({
			success: false,
			message: "Failed to get redis connection",
		});
	}

	await client.hmset(`taskId:${taskId}`, redisData);
	await client.expire(`taskId:${taskId}`, 86400 * 3); // 3 days

	try {
		await addEmailsToQueue({ emails: validatedEmails.data, organizationId, contactListId, taskId, shouldUpdateLead });

		res.status(200).json({
			success: true,
			message: "Emails added to queue",
			taskId,
		});
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		console.error(`Failed to add emails to queue: ${errorMessage}`);
		res.status(500).json({
			success: false,
			message: "Failed to add emails to queue",
		});
	}
}));

app.post("/check-status", asyncHandler(async (req, res) => {
	try {
		const { taskId } = req.body;
		if (!taskId) {
			return res.status(400).json({
				success: false,
				message: "No taskId provided",
			});
		}

		const client = getRedisConnection();
		if (!client) {
			return res.status(500).json({
				success: false,
				message: "Failed to get redis connection",
			});
		}

		const progress = await client.hgetall(`taskId:${taskId}`) || 0;
		const failed = progress?.failed ? JSON.parse(progress.failed) : [];

		return res.status(200).json({
			success: true,
			message: "Task status",
			progress: {
				...progress,
				failed
			}
		});
	} catch {
		return res.status(500).json({
			success: false,
			message: "Failed to get redis connection",
		});
	}
}));

app.get("/", (_, res) => {
	res.sendStatus(200);
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
