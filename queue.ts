import { getEmailQueue } from "./getQueue";

type Props = {
	emails: string[];
	organizationId: string;
	contactListId: string;
	taskId: number;
};

export async function addEmailsToQueue({ emails, organizationId, contactListId, taskId }: Props) {
	const emailQueue = await getEmailQueue();

	emailQueue.addBulk(emails.map((email, i) => ({
		name: `verify-email-${i}`,
		data: { email: email, organizationId, contactListId, taskId },
		opts: {
			jobId:`verify-email-${email}`,
			removeOnComplete: true,
			removeOnFail: true,
			attempts: 3,
			delay: 2000,
			backoff: {
				type: "exponential",
				delay: 1000,
			},
		},
	})));
}
