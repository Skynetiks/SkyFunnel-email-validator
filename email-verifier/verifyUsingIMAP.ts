import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

const providerConfig = {
  host: "box.skyfunnel.us",
  port: 993,
  secure: true,
  inboxFolder: "Inbox",
  spamFolder: "Spam",
};

const SubjectMap = {
  UndeliveredMail: ["undelivered", "failure", "failed", "undeliverable"],
};

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

    // Step 1: Search in the Inbox
    await client.mailboxOpen(providerConfig.inboxFolder);
    isEmailFound = await searchFolder(client, keywords, email);

    // Step 2: If no email is found in Inbox, search in Spam
    if (!isEmailFound) {
      console.log(
        "[FetchEmail] No undelivered email found in Inbox. Checking Spam folder."
      );
      await client.mailboxOpen(providerConfig.spamFolder);
      isEmailFound = await searchFolder(client, keywords, email);
    }
  } catch (err) {
    console.error("[FetchEmail] Error in IMAP connection:", err);
    return false;
  } finally {
    await client.logout();
  }

  return isEmailFound;
}

async function searchFolder(
  client: ImapFlow,
  keywords: string[],
  email: string
) {
  for (const keyword of keywords) {
    const searchResult = await client.search({
      header: { subject: keyword },
      body: email,
    });

    if (!searchResult || searchResult.length === 0) {
      console.log(
        `[FetchEmail] No emails found with subject keyword: ${keyword}`
      );
      continue;
    } else if (searchResult.length > 0) {
      await client.messageDelete(searchResult);
      console.log("Email found. Deleting email...");
      return true;
    }
  }
  return false; // No email found
}
