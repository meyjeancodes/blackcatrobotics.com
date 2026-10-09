#!/usr/bin/env node
/**
 * Mint a TechMedix connector API key for a customer.
 *
 *   node scripts/mint-api-key.mjs --customer <customer_id> [--name <label>]
 *
 * Env required:
 *   NEXT_PUBLIC_SUPABASE_URL      Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY     service-role key (server-side only)
 *
 * Prints the full key ONCE — it is never stored in plaintext, only its
 * SHA-256 hash. Save it immediately; it cannot be recovered later.
 */

import { randomBytes, createHash } from "node:crypto";

function arg(name) {
  const i = process.argv.indexOf(name);
  return i === -1 ? null : process.argv[i + 1];
}

const customerId = arg("--customer");
const name = arg("--name") ?? "default";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!customerId) {
  console.error("Usage: node scripts/mint-api-key.mjs --customer <customer_id> [--name <label>]");
  process.exit(1);
}
if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
  process.exit(1);
}

// tmdx_live_<48 hex chars> — 200 bits of entropy
const key = `tmdx_live_${randomBytes(24).toString("hex")}`;
const keyHash = createHash("sha256").update(key).digest("hex");
const keyPrefix = key.slice(0, 12);

const res = await fetch(`${supabaseUrl}/rest/v1/api_keys`, {
  method: "POST",
  headers: {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  },
  body: JSON.stringify({
    key_hash: keyHash,
    key_prefix: keyPrefix,
    customer_id: customerId,
    name,
  }),
});

if (!res.ok) {
  const text = await res.text();
  console.error(`Failed to store key (${res.status}): ${text}`);
  process.exit(1);
}

const [row] = await res.json();
console.log("\nAPI key minted. Save this now — it will never be shown again:\n");
console.log(`  ${key}\n`);
console.log(`  id:         ${row.id}`);
console.log(`  prefix:     ${keyPrefix}`);
console.log(`  customer:   ${customerId}`);
console.log(`  name:       ${name}`);
console.log("\nUse as:  Authorization: Bearer <key>\n");
