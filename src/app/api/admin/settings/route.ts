import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { checkIsAdmin } from "@/lib/admin";
import { z } from "zod";

const settingsSchema = z.object({
  business_name: z.string().optional(),
  admin_emails: z.string().optional(),
  currency: z.string().optional(),
  contact_email: z.string().optional(),
  contact_phone: z.string().optional(),
});

export async function GET() {
  try {
    const user = await currentUser();
    if (!user || !user.emailAddresses.length) return new NextResponse("Unauthorized", { status: 401 });
    
    const email = user.emailAddresses[0].emailAddress;
    const isAdmin = await checkIsAdmin(email);
    if (!isAdmin) return new NextResponse("Forbidden", { status: 403 });
    
    const allSettings = await db.select().from(settings);
    const settingsMap = allSettings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
    
    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error("[SETTINGS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user || !user.emailAddresses.length) return new NextResponse("Unauthorized", { status: 401 });
    
    const email = user.emailAddresses[0].emailAddress;
    const isAdmin = await checkIsAdmin(email);
    if (!isAdmin) return new NextResponse("Forbidden", { status: 403 });

    const rawBody = await req.json();
    const parseResult = settingsSchema.safeParse(rawBody);
    
    if (!parseResult.success) {
      return new NextResponse("Invalid settings payload", { status: 400 });
    }
    
    const body = parseResult.data;
    
    const promises = Object.entries(body).map(([key, value]) => {
      if (typeof value === "string") {
        return db.insert(settings).values({
          key,
          value
        }).onConflictDoUpdate({
          target: settings.key,
          set: { value, updatedAt: new Date() }
        });
      }
      return Promise.resolve();
    });

    await Promise.all(promises);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SETTINGS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
