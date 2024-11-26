import dotenv from "dotenv";

import { sendVerificationEmail } from "../email-verifier/sendMail.js";
import { verifyEmailDeliveryStatus } from "../email-verifier/verifyUsingIMAP.js";
import { describe, it, expect, beforeEach, vi, test } from "vitest";
import { InvalidEspCheck } from "../email-verifier/invalidEspCheck.js";
import { EmailVerifier } from "../email-verifier/index.js";

dotenv.config();

describe("Checking Imap Verification", () => {
  it(
    "Should Return True For Undelivered Mail",
    async () => {
      // const FAKE_EMAIL = `fake${(Math.random() * 1000).toFixed(0)}@somethingrandommx.com`;
      // const firstName = "John";
      // const waitingTime = 2000; // default waiting time

      // await sendVerificationEmail(FAKE_EMAIL, firstName);

      // await new Promise((resolve) => setTimeout(resolve, waitingTime));

      // const isEmailUndelivered = await verifyEmailDeliveryStatus(
      //   "UndeliveredMail",
      //   FAKE_EMAIL
      // );
      // expect(isEmailUndelivered).toBe(true);
      EmailVerifier("skardam@appolosys.com")
    },
    { timeout: 100000 }
  );

  // it(
  //   "Should Return False For Delivered Mail",
  //   async () => {
  //     const CORRECT_EMAIL = "deewanshu@skynetiks.com";
  //     const firstName = "Diwanshu";
  //     const waitingTime = 2000; // default waiting time

  //     await sendVerificationEmail(CORRECT_EMAIL, firstName);

  //     await new Promise((resolve) => setTimeout(resolve, waitingTime));

  //     const isEmailUndelivered = await verifyEmailDeliveryStatus(
  //       "UndeliveredMail",
  //       CORRECT_EMAIL
  //     );
  //     expect(isEmailUndelivered).toBe(false);
  //   },
  //   { timeout: 100000 }
  // );

  // it(
  //   "Should Handle Concurrent Email Verifications for 10 Emails",
  //   async () => {
  //     const generate10FakeEmails = () => {
  //       return Array.from({ length: 25 }, (_, i) => `fake${(Math.random() * 1000).toFixed(0)}@somethingrandommx.com`);
  //     };
  //     const emails = generate10FakeEmails();
  //     const firstName = "John";
  //     const waitingTime = 2000;
  
  //     // Send verification emails concurrently
  //     await Promise.all(
  //       emails.map(email => sendVerificationEmail(email, firstName))
  //     );
  
  //     // Wait for emails to process
  //     await new Promise(resolve => setTimeout(resolve, waitingTime));
  
  //     // Verify that each email is marked as undelivered
  //     const undeliveredStatuses = await Promise.all(
  //       emails.map(email => verifyEmailDeliveryStatus("UndeliveredMail", email))
  //     );
  
  //     // Expect all to be true (all emails undelivered)
  //     undeliveredStatuses.forEach(isEmailUndelivered => {
  //       expect(isEmailUndelivered).toBe(true);
  //     });
  //   },
  //   { timeout: 100000 }
  // );
  
});

describe("Imap Individual Tests", () => {

});
