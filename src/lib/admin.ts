import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cache } from "react";

export const checkIsAdmin = cache(async (email: string | undefined | null) => {
  if (!email) return false;
  
  const normalizedEmail = email.toLowerCase().trim();
  if (normalizedEmail === "lior31197@gmail.com") return true;
  
  try {
    const adminsRecord = await db.select().from(settings).where(eq(settings.key, "admin_emails")).limit(1);
    if (adminsRecord.length > 0 && adminsRecord[0].value) {
      const adminEmails = adminsRecord[0].value.split(',').map(e => e.trim().toLowerCase());
      if (adminEmails.includes(normalizedEmail)) {
        return true;
      }
    }
  } catch (error) {
    console.error("Error checking admin status:", error);
  }
  
  return false;
});
