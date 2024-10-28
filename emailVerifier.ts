import { EmailVerifier } from "./email-verifier";
import { EmailValidity } from "./types";

export async function verifyEmail(email: string, verificationBySMTP: boolean) {
	let status: EmailValidity = "UNVERIFIED";

	const { isMXVerified, isSMTPVerified, isEmailDelivered } = await EmailVerifier(email, "User", verificationBySMTP);
	if (!isMXVerified) status = "INVALID";
	else if (!isSMTPVerified && !isEmailDelivered) status = "MXVERIFIED";
	else if (!isEmailDelivered) status = "SMTPVERIFIED";
	else status = "VALID";

	return { email, status };
}
