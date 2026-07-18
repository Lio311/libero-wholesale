import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";

export const checkIsAdmin = cache(async (email?: string | undefined | null) => {
  try {
    const user = await currentUser();
    // If no email was passed, check the current user's clerk metadata directly
    if (!email && user?.publicMetadata?.role === "admin") {
      return true;
    }
    // If an email was passed, check if it matches the current user's email before relying on current user's metadata
    const userEmail = user?.emailAddresses[0]?.emailAddress?.toLowerCase();
    if (email && userEmail === email.toLowerCase() && user?.publicMetadata?.role === "admin") {
      return true;
    }
  } catch (error) {
    // Silently ignore if currentUser() throws (e.g. not in a valid context)
  }

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
