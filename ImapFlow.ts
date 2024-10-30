import { ImapFlow } from "imapflow";

let instance: ImapFlow | null = null;

export async function getImapClient() {
  if (!instance) {
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
    const { host, port, secure } = providerConfig;
    instance = new ImapFlow({
      host,
      port,
      secure,
      auth: credentials,
      logger: false,
      greetingTimeout: 30000,
    });
    await instance.connect()
  }
  // Update if worker concurrency > 10
    instance.setMaxListeners(20);
  return instance;
}

export async function disconnectImapClient() {
  if (instance) {
    await instance.logout();
    instance = null;
    console.log("Logged out from the email provider.");
  }
}
