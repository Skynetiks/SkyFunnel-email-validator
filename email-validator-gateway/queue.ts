import { getEmailQueue } from "./getQueue";

type Props = {
	emails: string[];
	organizationId: string;
	contactListId: string;
	taskId: number;
	shouldUpdateLead?: boolean;
};

export async function addEmailsToQueue({ emails, organizationId, contactListId, taskId, shouldUpdateLead }: Props) {
	const emailQueue = await getEmailQueue();

	await emailQueue.addBulk(emails.map((email, i) => ({
		name: `verify-email-${i}`,
		data: { email: email, organizationId, contactListId, taskId, shouldUpdateLead },
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
