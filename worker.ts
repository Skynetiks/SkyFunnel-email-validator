import { Worker } from "bullmq";
import dotenv from "dotenv";

import { getRedisConnection } from "./redis";
import { verifyEmail } from "./emailVerifier";
import { query } from "./db";
import { EmailValidity } from "./types";

dotenv.config();

type JobData = {
	email: string;
	organizationId: string | undefined;
	contactListId: string | undefined;
	taskId: number;
};

// let maxMemory = 0;

async function updateLeadStatusUsingOrgId(
	organizationId: string,
	email: string,
	status: EmailValidity
) {
	const lead = await query(
		'SELECT "id", "email" FROM "Lead" WHERE "organizationId" = $1 AND "email" = $2',
		[organizationId, email]
	);

	if (!lead || lead.rows.length === 0) {
		return;
	}

	await query('UPDATE "Lead" SET "isEmailValid" = $1 WHERE "id" = $2', [
		status,
		lead.rows[0].id,
	]);
}

async function updateLeadStatusUsingContactListId(
	contactListId: string,
	email: string,
	status: EmailValidity
) {
	const lead = await query(
		'SELECT "id", "email" FROM "Lead" JOIN "LeadToContactList" ON "Lead"."id" = "LeadToContactList"."leadId" WHERE "LeadToContactList"."contactListId" = $1 AND "email" = $2',
		[contactListId, email]
	);

	if (!lead || lead.rows.length === 0) {
		return;
	}

	await query('UPDATE "Lead" SET "isEmailValid" = $1 WHERE "id" = $2', [
		status,
		lead.rows[0].id,
	]);
}

async function addToValidatedEmail(
	email: string,
	status: EmailValidity,
	taskId: number
) {
	await query(
		'INSERT INTO "ValidatedEmail" ("id", "taskId", "email", "emailStatus") VALUES (uuid_generate_v4(), $1, $2, $3)',
		[taskId, email, status]
	);
}

const handleJob = async ({
	email,
	organizationId,
	contactListId,
	taskId,
}: JobData) => {
	let verificationStatus;

	const existingEmail = await query(
		'SELECT * FROM "ValidatedEmail" WHERE "email" = $1',
		[email]
	);
	if (existingEmail.rows.length > 0) {
		verificationStatus = existingEmail.rows[0].emailStatus;
		console.log(email + " found in validated emails: " + verificationStatus)
	} else {
		const verifiedEmail = await verifyEmail(email);
		verificationStatus = verifiedEmail.status;
	}

	if (organizationId) {
		// console.log(`Updating organization's lead's ${email} email status`);
		await updateLeadStatusUsingOrgId(organizationId, email, verificationStatus);
	} else if (contactListId) {
		// console.log(`Updating contact list's lead's ${email} email status`);
		await updateLeadStatusUsingContactListId(
			contactListId,
			email,
			verificationStatus
		);
	}
	// console.log(`adding to ValidatedEmail ${email} email status: ${verificationStatus}`);
	await addToValidatedEmail(email, verificationStatus, taskId);
};

export async function initializeWorker() {
	const connection = await getRedisConnection();
	if (!connection) {
		throw new Error("Redis connection not available");
	}

	console.log("Initializing worker");

	const worker = new Worker(
		"verify-email-queue",
		async (job) => {
			try {
				await handleJob(job.data);
			} catch (error) {
				throw error;
			}

			// console.log(job.id);
			// maxMemory = Math.max(maxMemory, process.memoryUsage().heapUsed);
			// console.log(maxMemory);

			return job.data;
		},
		{
			connection,
			concurrency: 10,
		}
	);

	console.log("Worker initialized");

	worker.on("completed", async (job) => {
		console.log(`Job completed with result ${JSON.stringify(job.returnvalue)}`);
		if (job.data.taskId && job.id) {
			await onTaskComplete(job.data.taskId, job.id);
		}
	});

	worker.on("failed", async (job, err) => {
		console.log(`Job failed with error ${err.message}`);
		if (job && job.data.taskId && job.id) {
			await onTaskFail(job.data.taskId, job.id);
		}
	});

	worker.on("error", (err) => {
		console.error("Worker error:", err);
	});
}

(async () => {
	await initializeWorker();
})();

async function onTaskComplete(taskId: number, jobId: string) {
	const client = await getRedisConnection();
	if (!client) {
		return;
	}

	const progress = await client.hgetall(`taskId:${taskId}`);
	// console.log(progress);
	if (!progress) {
		return;
	}

	const newCompleted = parseInt(progress?.completed || "0") + 1;
	const newPending = parseInt(progress?.pending || "0") - 1;
	const failed = progress?.failed ? JSON.parse(progress.failed) : [];
	const newFailed = failed.filter((id: string) => id !== jobId);

	if (newPending === 0) {
		console.log("Deleting task");
		await client.del(`taskId:${taskId}`);
	} else {
		await client.hmset(`taskId:${taskId}`, {
			...progress,
			completed: newCompleted,
			pending: newPending,
			failed: JSON.stringify(newFailed),
		});
	}
}

async function onTaskFail(taskId: number, jobId: string) {
	const client = await getRedisConnection();
	if (!client) {
		return;
	}

	const progress = await client.hgetall(`taskId:${taskId}`);
	if (!progress) {
		return;
	}

	const failed = progress?.failed ? JSON.parse(progress.failed) : [];
	if (failed.includes(jobId)) {
		return;
	}

	const newFailed = [...failed, jobId];
	await client.hmset(`taskId:${taskId}`, {
		...progress,
		failed: JSON.stringify(newFailed),
		pending: parseInt(progress.pending) - 1,
	});
}
