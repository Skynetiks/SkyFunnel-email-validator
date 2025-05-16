import { query } from "../db.js";

export async function blacklistedEmailCheck(email: string) {
  try {
    const result = await query(
      'SELECT 1 FROM "BlacklistedEmail" where email=$1',
      [email]
    );
    if (result.rowCount && result.rowCount > 0) {
      console.log(`Email ${email} is blacklisted`);
      return true;
    }
  } catch (e) {
    console.error("Error while fetching blacklisted Email");
  }
  return false;
}
