import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

const providerConfig = {
	host: "box.skyfunnel.us",
	port: 993,
	secure: true,
	spamFolder: "Inbox",
};

const SubjectMap = {
	UndeliveredMail: "Undelivered Mail Returned to Sender",
} as const;

async function getEmailStatus(
	email: { subject: string },
	credentials: { user: string; pass: string },
	verifyingEmail: string,
) {
	const { user, pass } = credentials;
	const { host, port, secure } = providerConfig;

	const client = new ImapFlow({
		host,
		port,
		secure,
		auth: { user, pass },
		logger: false,
	});

	let isEmailFound = false;

	try {
		await client.connect();
		console.log(`[FetchEmail] Connected to the email provider for user: ${user}`);

		await client.mailboxOpen(providerConfig.spamFolder);

		const searchResult = await client.search({
			header: { Subject: email.subject },
			since: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
		});

		if (searchResult?.length === 0) {
			console.log(`[FetchEmail] No emails found matching subject: ${email.subject}`);
			return;
		}

		console.log(`[FetchEmail] Found email(s) with UID(s): ${searchResult.join(", ")}`);

		const results = client.fetch(searchResult, { envelope: true, source: true });

		for await (const result of results) {
			if (result.envelope.subject.includes(email.subject)) {
				const emailBody = result.source.toString();
				// console.log(`[FetchEmail] Full Email:\n${emailBody}`);

				const foundEmail = await extractUndeliveredMessage(emailBody);
				if (foundEmail?.includes(verifyingEmail)) {
					isEmailFound = true;
					console.log(`[FetchEmail] Found email: ${foundEmail}`);
				}
			}
		}

		return isEmailFound;
	} catch (err) {
		console.error("[FetchEmail] Error while connecting to the IMAP server:", {
			action: "Connection Error",
			error: err,
		});
	} finally {
		await client.logout();
		console.log("Logged out from the email provider.");
	}
}

async function extractUndeliveredMessage(emailBody: string) {
	const parsed = await simpleParser(emailBody);

	if (!parsed.text) {
		console.error("[FetchEmail] No email body found in the email.");
		return;
	}

	const emailRegex = /<([^>]+)>/g;
	const email = parsed.text.match(emailRegex) || [];

	return email[0] as string | undefined;
}

export async function verifyEmailUsingIMAP(subjectKey: keyof typeof SubjectMap, email: string) {
	const emailToFetch = { subject: SubjectMap[subjectKey] };

	if (!process.env.VERIFICATION_SMTP_EMAIL || !process.env.VERIFICATION_SMTP_PASS) {
		console.error("[FetchEmail] SMTP credentials not found in environment variables.");
		process.exit(1);
	}

	const credentials = { user: process.env.VERIFICATION_SMTP_EMAIL, pass: process.env.VERIFICATION_SMTP_PASS };

	return await getEmailStatus(emailToFetch, credentials, email);
}
