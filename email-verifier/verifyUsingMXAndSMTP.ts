import { verifyEmail } from "@devmehq/email-validator-js";

export async function checkMXRecordsAndSMTP(emailAddress: string) {
	const res = await verifyEmail({ emailAddress, verifyMx: true, verifySmtp: true, timeout: 3000 });

	return {
		isMXVerified: res.validMx,
		isSMTPVerified: res.validSmtp,
	};
}
