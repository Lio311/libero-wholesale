import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { checkIsAdmin } from "@/lib/admin";
import { CheckoutForm } from "./CheckoutForm";
import { redirect } from "next/navigation";

export default async function CheckoutPage() {
  const user = await currentUser();
  
  const email = user?.emailAddresses[0]?.emailAddress?.toLowerCase();
  const isAdmin = await checkIsAdmin(email);

  if (!user && !isAdmin) {
    redirect("/");
  }

  // Find store for normal user
  let store = null;
  if (user) {
    const storeRecord = await db.select().from(stores).where(eq(stores.clerkUserId, user.id)).limit(1);
    store = storeRecord[0];
  }

  if (!store && !isAdmin) {
    // If somehow they bypassed onboarding
    redirect("/"); 
  }

  // Mock store for admin if needed
  if (isAdmin && !store) {
    store = {
      id: "admin-store",
      name: "Admin Store",
      contactName: "Admin",
      phone: "000-0000000",
      email: email,
      address: "Admin Address",
    } as any;
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
      <h1 className="text-4xl font-bold mb-8 tracking-tight">קופה</h1>
      <CheckoutForm store={store} />
    </div>
  );
}
