import { nanoid } from 'nanoid';

/**
 * Email verification service
 * TODO: Integrate with actual SMTP service (SendGrid, Resend, etc.)
 * For now, logs verification links to console
 */

export function generateVerifyToken(): string {
  return nanoid(32);
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string,
  accountType: 'publisher' | 'advertiser'
): Promise<{ sent: boolean; error?: string }> {
  const verifyUrl = `https://api.adrail.ai/v1/verify-email?token=${token}&type=${accountType}`;
  
  // TODO: Replace with actual email sending
  // For now, log to console for development
  console.log(`
========================================
📧 VERIFICATION EMAIL (DEV MODE)
========================================
To: ${email}
Subject: Verify your AdRail ${accountType} account

Hi ${name},

Please verify your email by clicking the link below:

${verifyUrl}

Or use this verification code: ${token}

This link expires in 24 hours.

Best,
The AdRail Team
========================================
  `);

  // In production, this would use something like:
  // await resend.emails.send({
  //   from: 'AdRail <noreply@adrail.ai>',
  //   to: email,
  //   subject: `Verify your AdRail ${accountType} account`,
  //   html: `...`
  // });

  return { sent: true };
}
