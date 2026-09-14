import nodemailer from 'nodemailer';
import { db } from './db';
import { settings } from './db/schema';
import { eq } from 'drizzle-orm';

const REQUIRED_NOTIFICATION_EMAILS = ['suppliers@libero-il.co.il'];

const transporter = nodemailer.createTransport(
  process.env.GMAIL_ADDRESS && (process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASSWORD)
    ? {
        service: "gmail",
        auth: {
          user: process.env.GMAIL_ADDRESS,
          pass: process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASSWORD,
        },
      }
    : {
        host: process.env.EMAIL_HOST || 'smtp.example.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER || 'user',
          pass: process.env.EMAIL_PASS || 'pass',
        },
      }
);

export async function getNotificationEmails(): Promise<string[]> {
  let emails: string[] = ["lior31197@gmail.com", "suppliers@libero-il.co.il"];
  try {
    const record = await db.query.settings.findFirst({
      where: eq(settings.key, "notification_emails")
    });
    if (record && record.value) {
      emails = record.value.split(',').map((e: string) => e.trim()).filter(Boolean);
    }
  } catch (e) {
    console.error('Error fetching notification emails from settings:', e);
  }
  // Always ensure required emails are in the list
  for (const required of REQUIRED_NOTIFICATION_EMAILS) {
    if (!emails.some(e => e.toLowerCase() === required.toLowerCase())) {
      emails.push(required);
    }
  }
  return emails;
}

/**
 * Returns the application base URL for use in server-side code (emails, PDFs).
 * Uses APP_URL (server-only) first, then NEXT_PUBLIC_APP_URL, then VERCEL_URL, then hardcoded fallback.
 */
export function getAppUrl(): string {
  if (process.env.APP_URL) return process.env.APP_URL;
  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'https://www.libero-wholesale.co.il';
}

export async function sendEmail({
  to,
  subject,
  html,
  attachments,
}: {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer | Uint8Array; contentType?: string }[];
}) {
  try {
    const from = process.env.GMAIL_ADDRESS || process.env.EMAIL_FROM || '"Libero Wholesale" <noreply@libero.co.il>';
    const toStr = Array.isArray(to) ? to.join(', ') : to;
    const info = await transporter.sendMail({
      from,
      to: toStr,
      subject,
      html,
      attachments: attachments?.map(a => ({
        filename: a.filename,
        content: Buffer.from(a.content),
        contentType: a.contentType || 'application/pdf',
      })),
    });
    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
