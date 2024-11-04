import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

const providerConfig = {
	host: "box.skyfunnel.us",
	port: 993,
	secure: true,
	spamFolder: "Inbox",
  };

const SubjectMap = {
  UndeliveredMail: ["undelivered", "failure", "failed", "undeliverable"],
} as const;

async function extractUndeliveredMessage(emailBody: string) {
  const parsed = await simpleParser(emailBody);
  if (!parsed.text) {
    console.error("[FetchEmail] No email body found in the email.");
    return;
  }

  const flags = "gm";
  const emailRegex = "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,}";
  const regexPattern = new RegExp(emailRegex, flags);

  const email = parsed.text.match(regexPattern) || [];
  return email[0] as string | undefined;
}

export async function verifyEmailDeliveryStatus(
  subjectKey: keyof typeof SubjectMap,
  email: string
) {
  const keywords = SubjectMap[subjectKey];
  let isEmailFound = false;

  if (
    !process.env.VERIFICATION_SMTP_EMAIL ||
    !process.env.VERIFICATION_SMTP_PASS
  ) {
    console.error(
      "[FetchEmail] SMTP credentials not found in environment variables."
    );
    process.exit(1);
  }

  const credentials = {
    user: process.env.VERIFICATION_SMTP_EMAIL,
    pass: process.env.VERIFICATION_SMTP_PASS,
  };

  const client = new ImapFlow({
    host: providerConfig.host,
    port: providerConfig.port,
    secure: providerConfig.secure,
    auth: credentials,
    logger: false,
    greetingTimeout: 30000,
  });

  try {
    await client.connect();
    console.log(`[FetchEmail] Connected to IMAP for: ${email}`);

    await client.mailboxOpen(providerConfig.spamFolder);

    for (const keyword of keywords) {
      const searchResult = await client.search({
        header: { subject: keyword },
		since: new Date(Date.now() - 2 * 60 * 1000),
      });

      if (!searchResult || searchResult.length === 0) {
        console.log(
          `[FetchEmail] No emails found with subject keyword: ${keyword}`
        );
        continue;
      }

      const results = client.fetch(searchResult, {
        envelope: true,
        source: true,
      });

      for await (const result of results) {
        if (
          result.envelope.subject &&
          result.envelope.subject.toLowerCase().includes(keyword.toLowerCase())
        ) {
          const emailBody = result.source.toString();
          const foundEmail = await extractUndeliveredMessage(emailBody);
          if (foundEmail?.includes(email)) {
            isEmailFound = true;
            console.log(
              `[FetchEmail] Found undelivered email to: ${foundEmail}`
            );
            break;
          }
        }
      }
      if (isEmailFound) break;
    }
  } catch (err) {
    console.error("[FetchEmail] Error in IMAP connection:", err);
    return false;
  } finally {
    client.logout();
    client.close();
  }

  return isEmailFound;
}
