import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export interface RepairRow {
  scooter_id?: string | null;
  platform?: string | null;
  fault_code?: string | null;
  summary?: string | null;
  parts_used?: Record<string, unknown> | null;
  duration_min?: number | null;
}

export interface FailureRow {
  scooter_id?: string | null;
  platform?: string | null;
  fault_code?: string | null;
  symptom?: string | null;
}

export interface UiPrefRow {
  key: string;
  value: string;
}

export async function getSupabase() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => store.getAll(), setAll: () => {} } }
  );
}

export async function repairHistoryRows(opts?: { scooterId?: string; platform?: string; limit?: number }) {
  const db = await getSupabase();
  let q = db
    .from('repair_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(opts?.limit ?? 200);

  if (opts?.scooterId) q = q.eq('scooter_id', opts.scooterId);
  if (opts?.platform) q = q.eq('platform', opts.platform);

  const { data } = await q;
  return data ?? [];
}

export async function failurePatternRows() {
  const db = await getSupabase();
  const { data } = await db
    .from('failure_patterns')
    .select('*')
    .order('seen_count', { ascending: false })
    .limit(200);

  return data ?? [];
}

export async function uiPrefsRows(key?: string) {
  const db = await getSupabase();
  const target = key ?? '';
  const { data } = await db.from('ui_prefs').select('*').eq('key', target).maybeSingle();
  return data?.value ?? null;
}

export async function insertRepair(row: RepairRow) {
  const db = await getSupabase();
  return db.from('repair_history').insert({
    scooter_id: row.scooter_id,
    platform: row.platform,
    fault_code: row.fault_code,
    summary: row.summary,
    parts_used: row.parts_used,
    duration_min: row.duration_min,
  });
}

export async function insertFailurePattern(row: FailureRow) {
  const db = await getSupabase();
  return db.from('failure_patterns').upsert(
    {
      scooter_id: row.scooter_id,
      platform: row.platform,
      fault_code: row.fault_code,
      symptom: row.symptom,
    },
    { onConflict: 'scooter_id,fault_code,symptom' }
  );
}

export async function setUiPref(row: UiPrefRow) {
  const db = await getSupabase();
  return db.from('ui_prefs').upsert({ key: row.key, value: row.value }, { onConflict: 'key' });
}
