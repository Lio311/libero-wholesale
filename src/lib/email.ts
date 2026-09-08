import nodemailer from 'nodemailer';
import { db } from './db';
import { settings } from './db/schema';
import { eq } from 'drizzle-orm';

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
  try {
    const record = await db.query.settings.findFirst({
      where: eq(settings.key, "notification_emails")
    });
    if (record && record.value) {
      return record.value.split(',').map((e: string) => e.trim()).filter(Boolean);
    }
  } catch (e) {
    console.error('Error fetching notification emails from settings:', e);
  }
  return ["lior31197@gmail.com", "suppliers@libero-il.co.il"];
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  try {
    const from = process.env.GMAIL_ADDRESS || process.env.EMAIL_FROM || '"Libero Wholesale" <noreply@libero.co.il>';
    const toStr = Array.isArray(to) ? to.join(', ') : to;
    const info = await transporter.sendMail({
      from,
      to: toStr,
      subject,
      html,
    });
    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
