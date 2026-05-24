export interface BaseEmailContext {
  company?: string;
  year?: number;
  logoUrl?: string;
  firstName?: string;
}

export interface WelcomeEmailContext extends BaseEmailContext {
  email: string;
}

export interface ForgotPasswordEmailContext extends BaseEmailContext {
  email: string;
  temporaryPassword: string;
  supportEmail: string;
}

export interface PasswordResetEmailContext extends BaseEmailContext {
  email: string;
}

export interface AccountLockedEmailContext extends BaseEmailContext {
  email: string;
}

export interface DeactivationEmailContext extends BaseEmailContext {
  email: string;
  confirmationDate: string;
}

export type MailContext =
  | WelcomeEmailContext
  | ForgotPasswordEmailContext
  | PasswordResetEmailContext
  | AccountLockedEmailContext
  | DeactivationEmailContext;
