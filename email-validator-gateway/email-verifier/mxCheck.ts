import DNS2 from 'dns2';

// In-memory cache for DNS results (TTL: 5 minutes)
const DNS_CACHE = new Map<string, { valid: boolean; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const DNS_TIMEOUT = 3000; // 3 second timeout

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
};

export async function mxCheck(email: string): Promise<boolean> {
  const splitEmail = email.split("@");
  if (splitEmail.length !== 2) {
    return false;
  }

  const domain = splitEmail[1].toLowerCase();

  // Check cache first
  const cached = DNS_CACHE.get(domain);
  if (cached && cached.expires > Date.now()) {
    return cached.valid;
  }

  const dns = new DNS2();

  try {
    // Race DNS lookup with timeout
    const mxLookup = dns.resolve(domain, "MX");
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('DNS timeout')), DNS_TIMEOUT)
    );

    const mxResponse = await Promise.race([mxLookup, timeoutPromise]);
    const mxRecords = mxResponse.answers as MxRecord[];

    if (mxRecords.length === 0) {
      cacheResult(domain, false);
      return false;
    }

    // Check A records in parallel for faster resolution
    // Sort by priority and check top 3 MX servers only
    const topMxRecords = mxRecords
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 3);

    const aRecordChecks = topMxRecords.map(async (mx) => {
      try {
        const aLookup = dns.resolve(mx.exchange, "A");
        const aTimeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('DNS timeout')), DNS_TIMEOUT)
        );

        const aResponse = await Promise.race([aLookup, aTimeoutPromise]);
        const aRecords = aResponse.answers as ARecord[];
        return aRecords.length > 0;
      } catch {
        return false;
      }
    });

    // Return true as soon as any MX server has valid A records
    const results = await Promise.all(aRecordChecks);
    const isValid = results.some(result => result === true);

    cacheResult(domain, isValid);
    return isValid;

  } catch (error) {
    console.error(`DNS error for ${domain}:`, error instanceof Error ? error.message : error);
    cacheResult(domain, false);
    return false;
  }
}

function cacheResult(domain: string, valid: boolean): void {
  DNS_CACHE.set(domain, {
    valid,
    expires: Date.now() + CACHE_TTL
  });

  // Clean up old cache entries (simple LRU)
  if (DNS_CACHE.size > 10000) {
    const firstKey = DNS_CACHE.keys().next().value;
    if (firstKey) DNS_CACHE.delete(firstKey);
  }
}
