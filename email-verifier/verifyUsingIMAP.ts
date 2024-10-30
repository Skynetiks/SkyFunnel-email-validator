import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { disconnectImapClient, getImapClient, providerConfig } from "../ImapFlow";


const SubjectMap = {
	UndeliveredMail: "Undelivered Mail Returned to Sender",
} as const;

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

export async function verifyEmailDeliveryStatus(subjectKey: keyof typeof SubjectMap, email: string) {
	const emailToFetch = { subject: SubjectMap[subjectKey] };
	let isEmailFound = false;

	try {
		const client = await getImapClient();
		await client.connect();
		console.log(`[FetchEmail] Connected to the email provider for user: ${process.env.VERIFICATION_SMTP_EMAI}`);

		await client.mailboxOpen(providerConfig.spamFolder);

		const searchResult = await client.search({
			header: { Subject: emailToFetch.subject },
			since: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
		});

		if (searchResult?.length === 0) {
			console.log(`[FetchEmail] No emails found matching subject: ${emailToFetch.subject}`);
			return;
		}

		console.log(`[FetchEmail] Found email(s) with UID(s): ${searchResult.join(", ")}`);

		const results = client.fetch(searchResult, { envelope: true, source: true });

		for await (const result of results) {
			if (result.envelope.subject.includes(emailToFetch.subject)) {
				const emailBody = result.source.toString();
				const foundEmail = await extractUndeliveredMessage(emailBody);
				if (foundEmail?.includes(email)) {
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
		disconnectImapClient();
	}
}
