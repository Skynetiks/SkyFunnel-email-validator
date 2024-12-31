import { misspelledCheck } from "./misspelledCheck";
import { blacklistedEspCheck } from "./blacklistedEspCheck";
import { mxCheck } from "./mxCheck";
import { blacklistedEmailCheck } from "./blacklistedEmailCheck";

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


export async function EmailVerifier(email: string): Promise<boolean> {
  email = email.trim();
  if (!email) {
    throw new Error("Email is required.");
  }

  const isMisspelled = await misspelledCheck(email);
  if (isMisspelled) {
    return false;
  }

  const isESPBlacklisted = await blacklistedEspCheck(email);
  if (isESPBlacklisted) {
    return false;
  }

  const isEmailBlacklisted = await blacklistedEmailCheck(email);
  if (isEmailBlacklisted) {
    return false;
  }

  const isMxValid = await mxCheck(email);
  if (!isMxValid) {
    return false;
  }

  try {
    const response = await fetch(`http://64.23.239.176:8080/v1/${email}/verification`, {
      method: 'GET',
      headers: {
        'Authorization': `${process.env.AUTH_TOKEN}`,
      },
    });
    const data:EmailVerificationResponse = await response.json();
    if(data.reachable === "yes"){
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error verifying email via API:', error);
    return false
  }

}
