import emailMisspelled, { top100 } from "email-misspelled";

export function misspelledCheck(email: string) {
  const emailChecker = emailMisspelled({ maxMisspelled: 1, domains: top100 });
  const result = emailChecker(email);
  if (result.length > 0) {
    console.log(`Email ${email} is misspelled: ${result[0]}`);
    return true;
  } else {
    return false;
  }
}
