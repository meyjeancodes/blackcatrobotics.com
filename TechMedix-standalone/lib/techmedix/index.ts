/**
 * TechMedix — Root Index
 *
 * Imports all skill modules so they get registered with the skill registry
 * at server startup. Next.js will eagerly evaluate these imports.
 *
 * Import this from app/layout.tsx to register all skills.
 */

// Import skill modules — each one calls registerSkill() on import
import "@/lib/techmedix/skills/parts-lookup";
import "@/lib/techmedix/skills/parts-inventory-sync";
import "@/lib/techmedix/skills/fleet-telemetry-ingestion";
import "@/lib/techmedix/skills/ar-guidance";
