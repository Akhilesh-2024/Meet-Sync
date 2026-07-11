import { env } from "../config/env";
import { logger } from "../utils/logger";

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

/**
 * EmailService — swaps between a real SendGrid client and a console-log
 * stub depending on whether SENDGRID_API_KEY is configured, so the app is
 * fully runnable in local dev without a SendGrid account.
 */
export async function sendEmail(payload: EmailPayload): Promise<void> {
  if (!env.sendgridApiKey) {
    logger.info(`[email:dev-stub] Would send email to ${payload.to}`, { subject: payload.subject });
    return;
  }

  // Lazily require so the dependency is optional for local dev without SendGrid.
  // npm install @sendgrid/mail  before enabling this path.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const sgMail = require("@sendgrid/mail");
  sgMail.setApiKey(env.sendgridApiKey);
  await sgMail.send({
    to: payload.to,
    from: env.emailFrom,
    subject: payload.subject,
    html: payload.html,
  });
}
