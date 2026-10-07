import { BaseTemplateParamsT } from '@/types/email';
import { generateBaseTemplate } from '@/mailers/templates/base-template';

export const generateEmailVerificationTemplate = (verificationUrl: string) => {
  const bodySection = `
        <p>Click the button below to verify your email:</p>
        <a href="${verificationUrl}">Verify email</a>
        `;

  const baseTemplateParams: BaseTemplateParamsT = {
    title: 'Verify your email',
    body: bodySection,
    buttonText: 'Verify email',
    buttonUrl: verificationUrl,
  };
  return generateBaseTemplate(baseTemplateParams);
};
