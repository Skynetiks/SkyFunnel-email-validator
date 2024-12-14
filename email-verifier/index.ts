import { misspelledCheck } from "./misspelledCheck";
import { blacklistedEspCheck } from "./blacklistedEspCheck";
import { mxCheck } from "./mxCheck";
import { blacklistedEmailCheck } from "./blacklistedEmailCheck";

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
  return true;
}
