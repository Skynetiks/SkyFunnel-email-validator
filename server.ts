import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import { z } from "zod";

import { addEmailsToQueue } from "./queue";
import { getRedisConnection } from "./redis";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true, limit: "200mb" }));
app.use(express.json({ limit: "200mb" }));
app.use(morgan("tiny"));

app.post("/verify-emails", async (req, res) => {
	const authToken = req.headers['authorization'];

	if (!authToken) {
		res.status(401).send('Authorization token is required');
		return;
	}

	if (authToken !== process.env.AUTH_TOKEN) {
		res.status(403).send('Invalid authorization token');
		return;
	}

	const { emails, organizationId, contactListId } = req.body;
	const validatedEmails = z.array(z.string()).nonempty().safeParse(emails);
	if (!validatedEmails.success) {
		return res.status(400).json({
			success: false,
			message: "Invalid email",
		});
	}

	const taskId = Math.round(new Date().getTime() * Math.random() * 1000);

	try {
		await addEmailsToQueue({ emails: validatedEmails.data, organizationId, contactListId, taskId });

		res.status(200).json({
			success: true,
			message: "Emails added to queue",
			taskId,
		});
	} catch (error: any) {
		console.error(`Failed to add emails to queue: ${error.message}`);
		res.status(500).json({
			success: false,
			message: "Failed to add emails to queue",
		});
	}

});

app.get("/check-status", async (req, res) => {
	try {
		const { taskId } = req.body;
		if (!taskId) {
			return res.status(400).json({
				success: false,
				message: "No taskId provided",
			});
		}

		const client = await getRedisConnection();
		if (!client) {
			return res.status(500).json({
				success: false,
				message: "Failed to get redis connection",
			});
		}

		const completed = await client.get(`taskId:${taskId}-progress`) || 0;

		return res.status(200).json({
			success: true,
			message: "Task status",
			completed
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Failed to get redis connection",
		});
	}
});

app.get("/", (_, res) => {
	res.sendStatus(200);
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
