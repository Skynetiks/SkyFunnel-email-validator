import { EmailVerifier } from "./email-verifier";
import { EmailValidity } from "./types";

export async function verifyEmail(email: string) {
	let status: EmailValidity = "UNVERIFIED";

	const isEmailValid = await EmailVerifier(email, "SkyNavigator");
	// if (!isMXVerified) status = "INVALID";
	// else if (!isSMTPVerified && !isEmailDelivered) status = "MXVERIFIED";
	// else if (!isEmailDelivered) status = "SMTPVERIFIED";
	// else status = "VALID";
	if(isEmailValid){
		status = "VALID";
	} else {
		status = "INVALID";
	}

	return { email, status };
}
