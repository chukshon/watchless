export type SendEmailParamsT = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  from?: string;
};

export type BaseTemplateParamsT = {
  title: string;
  body: string;
  buttonText: string;
  buttonUrl: string;
};

export type EmailVerificationParamsT = {
  verificationUrl: string;
};
