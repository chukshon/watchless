import { env } from '@/config/env';
import { RESEND_CLIENT } from '@/lib/resend';

type ParamsT = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  from?: string;
};

const MAILER_SENDER = `Watchless <${env.RESEND_EMAIL_SENDER}>`;

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
  from = MAILER_SENDER,
}: ParamsT) => {
  return await RESEND_CLIENT.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    text,
    html,
  });
};
