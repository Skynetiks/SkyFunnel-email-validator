import { misspelledCheck } from "./misspelledCheck";
import { blacklistedEspCheck } from "./blacklistedEspCheck";
import { mxCheck } from "./mxCheck";
import { blacklistedEmailCheck } from "./blacklistedEmailCheck";
import { EmailValidity } from "../types";

interface Syntax {
  username: string;
  domain: string;
  valid: boolean;
}

interface Smtp {
  host_exists: boolean;
  full_inbox: boolean;
  catch_all: boolean;
  deliverable: boolean;
  disabled: boolean;
}

interface EmailVerificationResponse {
  email: string;
  reachable: string;
  syntax: Syntax;
  smtp: Smtp;
  gravatar: string | null;
  suggestion: string;
  disposable: boolean;
  role_account: boolean;
  free: boolean;
  has_mx_records: boolean;
}


export async function EmailVerifier(email: string): Promise<EmailValidity> {
  email = email.trim();
  if (!email) {
    throw new Error("Email is required.");
  }

  const isMisspelled = await misspelledCheck(email);
  if (isMisspelled) {
    return "INVALID";
  }

  const isESPBlacklisted = await blacklistedEspCheck(email);
  if (isESPBlacklisted) {
    return "INVALID";
  }

  const isEmailBlacklisted = await blacklistedEmailCheck(email);
  if (isEmailBlacklisted) {
    return "INVALID";
  }

  const isMxValid = await mxCheck(email);
  if (!isMxValid) {
    return "INVALID";
  }

  try {
    const response = await fetch(`http://localhost:8080/v1/${email}/verification`, {
      method: 'GET',
      headers: {
        'Authorization': `${process.env.AUTH_TOKEN}`,
      },
    });
    const data:EmailVerificationResponse = await response.json();
    if(data.reachable === "yes"){
      return "VALID";
    } else if(data.smtp.catch_all) {
      return "CATCHALL";
    } else {
      return "INVALID";
    }
  } catch (error) {
    console.error('Error verifying email via API:', error);
    return "INVALID"
  }

}
