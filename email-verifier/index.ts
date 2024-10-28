import { sendVerificationEmail } from "./sendMail";
import { verifyEmailUsingIMAP } from "./verifyUsingIMAP";
import { checkMXRecordsAndSMTP } from "./verifyUsingMXAndSMTP";

export async function EmailVerifier(email: string, firstName: string, verificationByIMAP = false, waitingTime = 2000) {
	if (!email) {
		throw new Error("Email is required.");
	}

	const { isMXVerified, isSMTPVerified } = await checkMXRecordsAndSMTP(email);

	// console.log(`[VerifyEmail] Email: ${email}, isEmailValid: ${isEmailValid}`);

	let isEmailDelivered = undefined;

	if (isMXVerified && verificationByIMAP) {
		await sendVerificationEmail(email, firstName);

		console.log(`[VerifyEmail] Sent verification email to: ${email}`);

		await new Promise((resolve) => setTimeout(resolve, waitingTime));

		const isEmailUndelivered = await verifyEmailUsingIMAP("UndeliveredMail", email);

		isEmailDelivered = !isEmailUndelivered;
	}

	return {
		isMXVerified,
		isSMTPVerified,
		isEmailDelivered,
	};
}
