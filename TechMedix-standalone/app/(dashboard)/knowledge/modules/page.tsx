import Link from "next/link";
import { GraduationCap, ArrowRight } from "lucide-react";
import { getModules, getUserStats } from "@/lib/techmedix/lms";
import { ModuleCard } from "@/components/lms/ModuleCard";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function ModulesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase?.auth.getUser() ?? { data: { user: null } };

  // Anonymous visitors see the catalog with neutral (unlocked-but-unstarted) progress.
  const anonId = "00000000-0000-0000-0000-000000000000";
  const [modules, stats] = await Promise.all([
    getModules(user?.id ?? anonId),
    getUserStats(user?.id ?? anonId),
  ]);

  return (
    <div className="space-y-8">
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="kicker">Level 4 — Certification</p>
          <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-theme-primary lg:text-5xl">
            Learning Modules
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-theme-52">
            Structured certification courses covering repair protocols, telemetry
            analysis, and fleet operations. Complete lessons to earn XP and unlock
            higher tiers.
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <div className="rounded-2xl border border-theme-10 bg-theme-2 px-5 py-4">
            <p className="font-ui text-[0.58rem] uppercase tracking-[0.28em] text-theme-35">Level</p>
            <p className="mt-1 font-header text-3xl leading-none text-theme-primary">{stats.level}</p>
          </div>
          <div className="rounded-2xl border border-theme-10 bg-theme-2 px-5 py-4">
            <p className="font-ui text-[0.58rem] uppercase tracking-[0.28em] text-theme-35">Total XP</p>
            <p className="mt-1 font-header text-3xl leading-none text-ember">{stats.xp}</p>
          </div>
          <div className="rounded-2xl border border-theme-10 bg-theme-2 px-5 py-4">
            <p className="font-ui text-[0.58rem] uppercase tracking-[0.28em] text-theme-35">Lessons</p>
            <p className="mt-1 font-header text-3xl leading-none text-moss">{stats.completed_lessons}</p>
          </div>
        </div>
      </div>

      {/* ── Active module banner ───────────────────────────────────────────── */}
      {stats.active_module && (
        <Link
          href={`/knowledge/modules/${stats.active_module.id}`}
          className="panel-dark relative flex flex-col items-start gap-4 overflow-hidden px-8 py-6 lg:flex-row lg:items-center lg:justify-between"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(circle at 10% 50%, rgba(232,96,30,0.18), transparent 45%)" }}
          />
          <div className="relative flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-2 text-ember">
              <GraduationCap size={16} />
            </div>
            <div>
              <p className="font-ui text-[0.58rem] uppercase tracking-[0.22em] text-white/45">Continue</p>
              <p className="mt-0.5 text-sm text-white/80">{stats.active_module.title}</p>
            </div>
          </div>
          <span className="relative inline-flex items-center gap-1.5 rounded-full bg-ember px-4 py-2 font-ui text-[0.62rem] uppercase tracking-[0.18em] font-semibold text-white">
            Resume <ArrowRight size={11} />
          </span>
        </Link>
      )}

      {/* ── Sign-in prompt ─────────────────────────────────────────────────── */}
      {!user && (
        <div className="panel border border-theme-10 bg-theme-2 p-8 text-center">
          <p className="font-ui text-[0.62rem] uppercase tracking-[0.22em] text-theme-35">
            Certification required
          </p>
          <p className="mt-3 font-header text-xl text-theme-primary">Sign in to start training</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-theme-52">
            Learning modules, progress tracking, and XP require an account.
          </p>
          <Link
            href="/login"
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-ember px-5 py-2.5 font-ui text-[0.66rem] uppercase tracking-[0.18em] font-semibold text-white transition hover:bg-ember/90"
          >
            Sign in <ArrowRight size={11} />
          </Link>
        </div>
      )}

      {/* ── Module grid ────────────────────────────────────────────────────── */}
      {user && modules.length === 0 ? (
        <div className="panel p-10 text-center">
          <p className="text-sm text-theme-52">
            No learning modules are published yet. Check back soon.
          </p>
        </div>
      ) : null}

      {user && modules.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((mod) => (
            <ModuleCard key={mod.id} module={mod} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
