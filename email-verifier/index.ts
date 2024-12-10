import DNS2 from 'dns2';
import { misspelledCheck } from './misspelledCheck';

export async function EmailVerifier(email: string): Promise<boolean> {
  email = email.trim();
  if (!email) {
    throw new Error("Email is required.");
  }

  const isMisspelled = await misspelledCheck(email);
  if(isMisspelled) {
    return false
  }

  const splitEmail = email.split('@');
  if (splitEmail.length !== 2) {
    throw new Error("Invalid email format.");
  }

  const dns = new DNS2();

  // Define a custom type for MX record answers
  type MxRecord = {
    exchange: string;
    priority: number;
    name: string;
    type: number;
    class: number;
    ttl: number;
    address?: string;
    domain?: string;
    data?: string;
  };

  type ARecord = {
    address: string;
  }

  try {
    // Resolve the MX records for the domain
    const mxRecords = (await dns.resolve(splitEmail[1], "MX")).answers as MxRecord[];

    if (mxRecords.length === 0) {
      console.log("No MX records found.");
      return false;
    }

    for (const mx of mxRecords) {
      const domain = mx.exchange; // Domain of the MX record

      // Resolve A records for the MX record domain
      const aRecords = (await dns.resolve(domain, "A")).answers as ARecord[];

      if (aRecords.length > 0) {
        console.log(`MX record: ${domain} has valid A records: ${aRecords.map(record => record.address).join(', ')}`);
        return true; // At least one MX record with an IP address is enough
      }
    }

    console.log("No A records found for any MX record.");
    return false;
  } catch (error) {
    console.error("Error resolving DNS:", error);
    return false;
  }
}
