import emailMisspelled, { all } from "email-misspelled";
import EmailValidation from "emailvalid";
import { query } from "../db.js";
import { getRedisConnection } from "../redis.js";

export async function InvalidEspCheck(email: string) {
  const emailChecker = emailMisspelled({ domains: all });
  const result2 = emailChecker(email);
  if (result2.length > 0) {
    return false;
  }

  try {
    const blacklistedEsp = await getBlacklistedDomains();;
    const ev = new EmailValidation();
    ev.setOptions({ allowFreemail: true });
    blacklistedEsp.forEach((esp: {id: string, domain: string}) => {
      ev.blacklist(esp.domain);
    });
    const result = ev.check(email);
    if (!result.valid) {
      return false;
    }
  } catch (e) {
    console.error("Error while fetching blacklisted esp");
  }
  return true;
}

async function getBlacklistedDomains() {
    const redis = await getRedisConnection();
    const cacheKey = "blacklistedDomains";
  
    // Check if domains are already cached in Redis
    if (redis) {
      const cachedDomains = await redis.get(cacheKey);
      if (cachedDomains) {
        return JSON.parse(cachedDomains); // Return cached result if available
      }
    }
  
    // If not in cache, fetch from the database
    const result = await query('SELECT "id", "domain" FROM "BlacklistedEsp"', []);
    const domains = result.rows;
  
    // Cache the result in Redis for 1 day (86400 seconds)
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(domains), "EX", 86400);
    }
  
    return domains;
  }
