import { misspelledCheck } from "./misspelledCheck";
import { blacklistedEspCheck } from "./blacklistedEspCheck";
import { blacklistedEmailCheck } from "./blacklistedEmailCheck";
import { EmailValidity } from "../types";
import { mxCheck } from "./mxCheck";

// Known valid domains - skip preliminary checks for these
const KNOWN_VALID_DOMAINS = new Set([
  // Google
  'gmail.com', 'googlemail.com',
  // Microsoft
  'outlook.com', 'hotmail.com', 'live.com', 'msn.com', 'outlook.in',
  // Yahoo
  'yahoo.com', 'yahoo.co.uk', 'yahoo.in', 'yahoo.co.in', 'ymail.com',
  // Apple
  'icloud.com', 'me.com', 'mac.com',
  // Other major providers
  'protonmail.com', 'proton.me', 'aol.com', 'zoho.com', 'mail.com',
  'gmx.com', 'gmx.net', 'yandex.com', 'mail.ru',
]);

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
  error: string;
}


export async function EmailVerifier(email: string): Promise<EmailValidity> {
  email = email.trim();
  if (!email) {
    throw new Error("Email is required.");
  }

  // Always check if specific email is blacklisted (even for known domains)
  const isEmailBlacklisted = await blacklistedEmailCheck(email);
  if (isEmailBlacklisted) {
    return "INVALID";
  }

  // Extract domain from email
  const domain = email.split('@')[1]?.toLowerCase();
  const isKnownDomain = domain && KNOWN_VALID_DOMAINS.has(domain);

  // For unknown domains: do all validation checks
  // For known domains (Gmail, Outlook, etc.): skip checks and go straight to API
  if (!isKnownDomain) {
    const isMisspelled = misspelledCheck(email);
    if (isMisspelled) {
      return "INVALID";
    }

    const isESPBlacklisted = await blacklistedEspCheck(email);
    if (isESPBlacklisted) {
      return "UNKNOWN";
    }

    const isMxValid = await mxCheck(email);
    if (!isMxValid) {
      return "INVALID";
    }
  }

  // External API verification (for both known and unknown domains)
  try {
    const response = await fetch(`http://go_service:8080/v1/${email}/verification`, {
      method: 'GET',
      headers: {
        'Authorization': `${process.env.AUTH_TOKEN}`,
      },
    });
    const data:EmailVerificationResponse = await response.json();
    if(response.ok){
      if(data.reachable === "yes" && data.syntax && data.syntax.valid) {
        console.log(`Email ${email} is Valid`)
        return "VALID";
      } else if(data.smtp && data.smtp.catch_all) {
        console.log(`Domain for ${email} is Catch all`)
        return "CATCHALL";
      } else {
        console.log(`Email ${email} is Invalid`)
        return "INVALID";
      }
    } else {
      console.error('Error from proxy server', data.error);
      return "UNKNOWN"
    }
   
  } catch (error) {
    console.error('Error verifying email via API:', error);
    return "UNKNOWN"
  }

}
