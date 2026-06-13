import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@vercel/postgres';

// Logical keys we persist per user. Everything else in localStorage stays device-local.
const ALLOWED_KEYS = new Set([
  'cgs_profile',
  'cgs_voice',
  'cgs_quotes',
  'cgs_saved',
  'cgs_kits',
  'cgs_design',
  'cgs_machine_content',
  'cgs_machine_type',
  'cgs_theme',
]);

const MAX_VALUE_BYTES = 1_000_000; // 1MB per key (avatar data URLs can be large)

let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS user_data (
      user_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, key)
    )
  `;
  tableReady = true;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await ensureTable();
    const { rows } = await sql`SELECT key, value, updated_at FROM user_data WHERE user_id = ${userId}`;
    const data: Record<string, string> = {};
    const updatedAt: Record<string, number> = {};
    for (const row of rows) {
      data[row.key] = row.value;
      updatedAt[row.key] = new Date(row.updated_at).getTime();
    }
    return NextResponse.json({ data, updatedAt });
  } catch (e) {
    console.error('data GET failed', e);
    return NextResponse.json({ error: 'Storage unavailable' }, { status: 503 });
  }
}

export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    // Accepts { entries: { key: value, ... } } — value of null deletes the key
    const entries = body?.entries;
    if (!entries || typeof entries !== 'object') {
      return NextResponse.json({ error: 'Missing entries' }, { status: 400 });
    }

    await ensureTable();
    for (const [key, value] of Object.entries(entries)) {
      if (!ALLOWED_KEYS.has(key)) continue;
      if (value === null) {
        await sql`DELETE FROM user_data WHERE user_id = ${userId} AND key = ${key}`;
        continue;
      }
      if (typeof value !== 'string' || value.length > MAX_VALUE_BYTES) continue;
      await sql`
        INSERT INTO user_data (user_id, key, value, updated_at)
        VALUES (${userId}, ${key}, ${value}, NOW())
        ON CONFLICT (user_id, key) DO UPDATE SET value = ${value}, updated_at = NOW()
      `;
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('data PUT failed', e);
    return NextResponse.json({ error: 'Storage unavailable' }, { status: 503 });
  }
}
