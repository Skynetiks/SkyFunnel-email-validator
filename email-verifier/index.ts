import { InvalidEspCheck } from "./invalidEspCheck";
import { sendVerificationEmail } from "./sendMail";
import { verifyEmailDeliveryStatus } from "./verifyUsingIMAP";
import { checkMXRecordsAndSMTP } from "./verifyUsingMXAndSMTP";

export async function EmailVerifier(
  email: string,
) {
  if (!email) {
    throw new Error("Email is required.");
  }

  const isEspValid = await InvalidEspCheck(email);
  if (!isEspValid) {
    console.log(`[VerifyEmail] Email: ${email}, isEspValid: ${isEspValid}`);
    return false;
  }

  const { isMXVerified, isSMTPVerified } = await checkMXRecordsAndSMTP(email);

  // console.log(`[VerifyEmail] Email: ${email}, isEmailValid: ${isEmailValid}`);

  // let isEmailDelivered = false;

  if (isEspValid && isMXVerified && isSMTPVerified !== false) {
    // 	await sendVerificationEmail(email, firstName);

    // 	console.log(`[VerifyEmail] Sent verification email to: ${email}`);

    // 	await new Promise((resolve) => setTimeout(resolve, waitingTime));

    // 	const isEmailUndelivered = await verifyEmailDeliveryStatus("UndeliveredMail", email);

    // 	isEmailDelivered = !isEmailUndelivered;
    return true;
  }
}
