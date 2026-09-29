import { env } from '@/config/env';
import { InternalServerErrorException } from '@/errors/http-errors';

import { logger } from '@/lib/logger';
import { sendEmail } from '@/mailers';

import { SendEmailParamsT } from '@/types/email';

import { generateEmailVerificationTemplate } from '@/mailers/templates/emails/email-verification.template';

export class EmailService {
  static async sendEmailVerification(email: string, token: string) {
    try {
      const verificationUrl = `${env.FRONTEND_URL}/email-verification?token=${token}`;
      const emailVerificationText = `Click the link below to verify your email: ${verificationUrl}`;
      const emailVerificationHtml =
        generateEmailVerificationTemplate(verificationUrl);

      const emailParams: SendEmailParamsT = {
        to: email,
        subject: 'Verify your email',
        text: emailVerificationText,
        html: emailVerificationHtml,
      };

      await sendEmail(emailParams);
      logger.info(`Email verification email sent to ${email}`);
    } catch (error) {
      logger.error(
        `Failed to send email verification email to ${email}: ${error}`
      );
      throw new InternalServerErrorException(
        'Failed to send email verification email'
      );
    }
  }
}
