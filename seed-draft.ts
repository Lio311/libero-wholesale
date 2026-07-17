import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db } from "./src/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Adding is_draft column...");
  try {
    await db.execute(sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT false NOT NULL;`);
    console.log("Column added successfully.");
  } catch (err) {
    console.error("Error adding column:", err);
  }
  process.exit(0);
}

main();
