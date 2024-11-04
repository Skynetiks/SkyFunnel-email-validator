import { sendVerificationEmail } from "./sendMail";
import { verifyEmailDeliveryStatus } from "./verifyUsingIMAP";
import { checkMXRecordsAndSMTP } from "./verifyUsingMXAndSMTP";

export async function EmailVerifier(email: string, firstName: string, waitingTime = 500) {
	if (!email) {
		throw new Error("Email is required.");
	}

	const { isMXVerified, isSMTPVerified } = await checkMXRecordsAndSMTP(email);

	// console.log(`[VerifyEmail] Email: ${email}, isEmailValid: ${isEmailValid}`);

	let isEmailDelivered = false;

	if (isMXVerified && isSMTPVerified!==false) {
		await sendVerificationEmail(email, firstName);

		console.log(`[VerifyEmail] Sent verification email to: ${email}`);

		await new Promise((resolve) => setTimeout(resolve, waitingTime));

		const isEmailUndelivered = await verifyEmailDeliveryStatus("UndeliveredMail", email);

		isEmailDelivered = !isEmailUndelivered;
	}

	return {
		isMXVerified,
		isSMTPVerified,
		isEmailDelivered,
	};
}
