import { Worker } from 'bullmq';
import dotenv from "dotenv";

import { getRedisConnection } from './redis';
import { verifyEmail } from './emailVerifier';
import { query } from './db';
import { EmailValidity } from './types';

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
	const lead = await query('SELECT "id", "email" FROM "Lead" WHERE "organizationId" = $1 AND "email" = $2', [organizationId, email]);

	if (!lead || lead.rows.length === 0) {
		return;
	}

	await query('UPDATE "Lead" SET "isEmailValid" = $1 WHERE "id" = $2', [status, lead.rows[0].id]);
}

async function updateLeadStatusUsingContactListId(
	contactListId: string,
	email: string,
	status: EmailValidity
) {
	const lead = await query('SELECT "id", "email" FROM "Lead" JOIN "LeadToContactList" ON "Lead"."id" = "LeadToContactList"."leadId" WHERE "LeadToContactList"."contactListId" = $1 AND "email" = $2', [contactListId, email]);

	if (!lead || lead.rows.length === 0) {
		return;
	}

	await query('UPDATE "Lead" SET "isEmailValid" = $1 WHERE "id" = $2', [status, lead.rows[0].id]);
}

async function addToValidatedEmail(email: string, status: EmailValidity, taskId: number) {
	await query('INSERT INTO "ValidatedEmail" ("id", "taskId", "email", "emailStatus") VALUES (uuid_generate_v4(), $1, $2, $3)', [taskId, email, status]);
}

const handleJob = async ({ email, organizationId, contactListId, taskId }: JobData) => {
	let verificationStatus;

	const existingEmail = await query('SELECT * FROM "ValidatedEmail" WHERE "email" = $1', [email]);
	if (existingEmail.rows.length > 0) {
		verificationStatus = existingEmail.rows[0].emailStatus;
	} else {
		const verifiedEmail = await verifyEmail(email, !(!!organizationId || !!contactListId));
		// const verifiedEmail = await verifyEmail(email, false);

		verificationStatus = verifiedEmail.status;
		if (verifiedEmail.status === "INVALID") {
			console.log(verifiedEmail);
		}
	}

	// const client = await getRedisConnection();
	// if (!client) {
	// 	throw new Error('Redis connection not available');
	// }

	// const key = `taskId:${taskId}-progress`;
	//
	// try {
	// 	const existingProgress = await client.get(key) || "0";
	// 	const newProgress = parseInt(existingProgress) + 1;
	//
	// 	client.set(key, newProgress, 'EX', 24 * 60 * 60);
	// } catch (error) {
	// 	console.error("error updating progress", error);
	// }

	if (organizationId) {
		// console.log(`Updating organization's lead's ${email} email status`);
		await updateLeadStatusUsingOrgId(organizationId, email, verificationStatus);
	} else if (contactListId) {
		// console.log(`Updating contact list's lead's ${email} email status`);
		await updateLeadStatusUsingContactListId(contactListId, email, verificationStatus);
	} else {
		// console.log(`adding to ValidatedEmail ${email} email status: ${verificationStatus}`);
		await addToValidatedEmail(email, verificationStatus, taskId);
	}
};

export async function initializeWorker() {
	const connection = await getRedisConnection();
	if (!connection) {
		throw new Error('Redis connection not available');
	}

	console.log("Initializing worker");

	const worker = new Worker('verify-email-queue', async job => {
		try {
			await handleJob(job.data);
		} catch (error) {
			throw error;
		}

		// console.log(job.id);
		// maxMemory = Math.max(maxMemory, process.memoryUsage().heapUsed);
		// console.log(maxMemory);

		return job.data;
	}, {
		connection,
		concurrency: 100,
	});

	console.log("Worker initialized");

	worker.on('completed', job => {
		console.log(`Job completed with result ${job.returnvalue}`);
	});

	worker.on('failed', (job, err) => {
		console.log(`Job failed with error ${err.message}`);
	});

	worker.on('error', (err) => {
		console.error("Worker error:", err);
	});
}

initializeWorker();
