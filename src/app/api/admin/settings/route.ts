import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });
    
    // In a real app, verify admin role here
    
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
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });
    
    // In a real app, verify admin role here

    const body = await req.json();
    
    // body should be a key-value object { business_name: "Libero", phone: "123" }
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
