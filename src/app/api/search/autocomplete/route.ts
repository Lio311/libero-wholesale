import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, searchLogs } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import { mapHebrewQuery } from '@/lib/hebrewMapping';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  try {
    // 1. Translate Hebrew to English (Layer 1)
    const translatedQuery = await mapHebrewQuery(q);

    // 2. Perform the Dual Strategy Query (Layer 2 & 3)
    const exactPattern = `%${translatedQuery}%`;
    
    // We use a raw SQL query with drizzle because we need the GREATEST function
    // and similarity operator from pg_trgm.
    const { rows: results } = await db.execute(sql`
      SELECT id, name, brand, model, name_he, image_url, price,
        GREATEST(
          similarity(name, ${translatedQuery}),
          similarity(brand, ${translatedQuery}),
          similarity(model, ${translatedQuery}),
          similarity(name_he, ${translatedQuery})
        ) as sim_score
      FROM ${products}
      WHERE status = 'active' AND is_draft = false
      AND (
          name ILIKE ${exactPattern}
          OR brand ILIKE ${exactPattern}
          OR model ILIKE ${exactPattern}
          OR name_he ILIKE ${exactPattern}
          OR similarity(name, ${translatedQuery}) > 0.2
          OR similarity(brand, ${translatedQuery}) > 0.2
          OR similarity(name_he, ${translatedQuery}) > 0.2
      )
      ORDER BY sim_score DESC
      LIMIT 5
    `);

    // 3. Fire-and-forget Analytics Logging
    // Use an un-awaited IIFE so we don't block the response
    (async () => {
      try {
        const { userId } = await auth();
        await db.insert(searchLogs).values({
          query: translatedQuery,
          resultsCount: results.length,
          userId: userId || null,
          userEmail: null, // Depending on Clerk setup, we could fetch the user's email
          platform: request.headers.get('sec-ch-ua-platform') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        });
      } catch (logError) {
        console.error('Failed to log search:', logError);
      }
    })();

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search Autocomplete Error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
