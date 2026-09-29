import { env } from '@/config/env';
import { RESEND_CLIENT } from '@/lib/resend';
import { SendEmailParamsT } from '@/types/email';

const MAILER_SENDER = `Watchless <${env.RESEND_EMAIL_SENDER}>`;

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
  from = MAILER_SENDER,
}: SendEmailParamsT) => {
  return await RESEND_CLIENT.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    text,
    html,
  });
};
