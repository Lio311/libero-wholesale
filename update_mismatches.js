require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function run() {
  console.log("Updating Drafts...");
  // London, Abu Dhabi, New York, Ambre Nomade
  const drafts = await sql`
    UPDATE products 
    SET status = 'draft', is_synced = false, barcode = NULL
    WHERE name ILIKE '%London%' 
       OR name ILIKE '%Abu Dhabi%' 
       OR name ILIKE '%New York%' 
       OR name ILIKE '%Ambre Nomade%'
    RETURNING id, name, status, barcode;
  `;
  console.log("Drafts updated:", drafts);

  console.log("Updating Zanzibar & Trouble...");
  const zanzibar = await sql`
    UPDATE products 
    SET size = '75ml', barcode = '5070000674506', status = 'active', is_synced = false
    WHERE name ILIKE '%Tales From Zanzibar%'
    RETURNING id, name, size, barcode, status;
  `;
  console.log("Zanzibar updated:", zanzibar);

  const trouble = await sql`
    UPDATE products 
    SET size = '75ml', barcode = '5070000674582', status = 'active', is_synced = false
    WHERE name ILIKE '%Trouble In Paradise%'
    RETURNING id, name, size, barcode, status;
  `;
  console.log("Trouble updated:", trouble);

  console.log("Updating Moonwalk & Gardenia...");
  const moonwalk = await sql`
    UPDATE products 
    SET barcode = '3770015534216', status = 'active', is_synced = false
    WHERE name ILIKE '%Moonwalk SeaCoco%'
    RETURNING id, name, size, barcode, status;
  `;
  console.log("Moonwalk updated:", moonwalk);

  const gardenia = await sql`
    UPDATE products 
    SET barcode = '5214002848033', status = 'active', is_synced = false
    WHERE name ILIKE '%Gardenia%'
    RETURNING id, name, size, barcode, status;
  `;
  console.log("Gardenia updated:", gardenia);
}
run().catch(console.error);
