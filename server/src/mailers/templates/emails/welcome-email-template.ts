import { generateBaseTemplate } from '@/mailers/templates/emails/base-template';
import type { BaseTemplateParamsT } from '@/types/email';

export const generateWelcomeEmailTemplate = (
  name: string,
  welcomeUrl: string
) => {
  const displayName = name?.trim() || 'friend';

  const bodySection = `
    <p style="font-size: 18px; color: #1a1a1a; margin-bottom: 8px;">
      Hey ${displayName} 👋
    </p>
    <p style="color: #4b5563; margin-bottom: 24px;">
      You verified. You’re in. Welcome to the club of people who’d rather
      <strong>read the good parts</strong> than sit through a 47-minute video
      for one tip.
    </p>

    <h2 style="font-size: 20px; color: #1a1a1a; text-align: center; margin: 28px 0 16px;">
      What you just unlocked ✨
    </h2>

    <div class="feature-card" style="margin-bottom: 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="56" valign="top">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); text-align: center; line-height: 48px; font-size: 22px; box-shadow: 0 2px 8px rgba(79, 70, 229, 0.35);">
              ⚡
            </div>
          </td>
          <td valign="top" style="padding-left: 12px;">
            <p style="margin: 0 0 4px; font-size: 16px; font-weight: 700; color: #1a1a1a;">
              Paste a YouTube link
            </p>
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              We handle the transcript + summary so you don’t have to.
            </p>
          </td>
        </tr>
      </table>
    </div>

    <div class="feature-card" style="margin-bottom: 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="56" valign="top">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%); text-align: center; line-height: 48px; font-size: 22px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);">
              🧠
            </div>
          </td>
          <td valign="top" style="padding-left: 12px;">
            <p style="margin: 0 0 4px; font-size: 16px; font-weight: 700; color: #1a1a1a;">
              Get the juice, skip the fluff
            </p>
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              Clear takeaways you can actually use — not a wall of filler.
            </p>
          </td>
        </tr>
      </table>
    </div>

    <div class="feature-card" style="margin-bottom: 8px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="56" valign="top">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%); text-align: center; line-height: 48px; font-size: 22px; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);">
              💾
            </div>
          </td>
          <td valign="top" style="padding-left: 12px;">
            <p style="margin: 0 0 4px; font-size: 16px; font-weight: 700; color: #1a1a1a;">
              Save it for later
            </p>
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              Your summaries live in your account. Future-you will say thanks.
            </p>
          </td>
        </tr>
      </table>
    </div>

    <div style="margin-top: 32px; padding: 24px; border-radius: 12px; text-align: center; background: linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%);">
      <p style="margin: 0 0 8px; font-size: 18px; font-weight: 700; color: #1a1a1a;">
        Ready to watch less?
      </p>
      <p style="margin: 0; font-size: 14px; color: #6b7280;">
        Drop a link. We’ll do the boring part. You keep the insight.
      </p>
    </div>
  `;

  const baseTemplateParams: BaseTemplateParamsT = {
    title: 'Welcome to Watchless',
    body: bodySection,
    buttonText: 'Summarize my first video',
    buttonUrl: welcomeUrl,
  };

  return generateBaseTemplate(baseTemplateParams);
};
