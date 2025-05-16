// emailValid.d.ts

declare module "emailvalid" {
    interface ValidationResult {
      valid: boolean;
      reason?: string;
    }
  
    interface EmailValidationOptions {
      allowFreemail?: boolean;
    }
  
    class EmailValidation {
      constructor();
  
      // Method to set options for email validation
      setOptions(options: EmailValidationOptions): void;
  
      // Method to add an email domain to the blacklist
      blacklist(email: string): void;

      // Method to add an email domain to the whitelist
      whitelist(email: string): void;
  
      // Method to check if an email is valid
      check(email: string): ValidationResult;
    }
  
    export = EmailValidation;
  }
  