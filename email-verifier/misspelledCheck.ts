import emailMisspelled, { top100 } from "email-misspelled";

export async function misspelledCheck(email: string) {
  const emailChecker = emailMisspelled({ domains: top100 });
  const result2 = emailChecker(email);
  if (result2.length > 0) {
    return true;
  } else {
    false;
  }
}
