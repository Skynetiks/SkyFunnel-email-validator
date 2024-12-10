import { EmailVerifier } from "./email-verifier";
import { EmailValidity } from "./types";

export async function verifyEmail(email: string) {
	let status: EmailValidity = "UNVERIFIED";

	const isEmailValid = await EmailVerifier(email);
	if(isEmailValid){
		status = "VALID";
	} else {
		status = "INVALID";
	}

	return { email, status };
}
