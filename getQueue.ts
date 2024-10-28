import { Queue } from "bullmq";

import { getRedisConnection } from "./redis";

let emailQueue: Queue | null = null;

export async function getEmailQueue(): Promise<Queue> {
	if (emailQueue) {
		return emailQueue;
	}

	const connection = await getRedisConnection();
	if (!connection) {
		throw new Error("Redis connection not available");
	}

	emailQueue = new Queue("verify-email-queue", { connection });
	console.log("Email queue created");

	return emailQueue;
}

getEmailQueue().catch((err) => console.error("Error initializing email queue:", err));
