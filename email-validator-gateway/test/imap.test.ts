import dotenv from "dotenv";

import { describe, it } from "vitest";
import { EmailVerifier } from "../email-verifier/index.js";

dotenv.config();

describe("Checking Imap Verification", () => {
  it(
    "Should Return True For Undelivered Mail",
    async () => {
      await EmailVerifier("skardam@appolosys.com");
    },
    { timeout: 100000 }
  );
});
