import { createSupabaseServerClient } from "../../../lib/supabase-server";
import type { Supplier, Component } from "../../../types/atlas";
import { ExternalLink, AlertTriangle, Package } from "lucide-react";

const COMPONENT_TYPE_OPTIONS = [
  "all",
  "motor",
  "battery",
  "actuator",
  "sensor",
  "pcb",
  "reducer",
  "hand",
  "bearing",
] as const;

const REGION_OPTIONS = ["all", "Asia", "Europe", "North America"] as const;

interface PageProps {
  searchParams: Promise<{ type?: string; region?: string }>;
}

export default async function AcquirePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const typeFilter = params.type ?? "all";
  const regionFilter = params.region ?? "all";

  const supabase = await createSupabaseServerClient();

  // Fetch suppliers
  let query = supabase
    .from("suppliers")
    .select("*")
    .order("is_bottleneck", { ascending: false })
    .order("name");

  if (typeFilter !== "all") {
    query = query.eq("component_type", typeFilter);
  }
  if (regionFilter !== "all") {
    query = query.eq("region", regionFilter);
  }

  const { data: suppliers } = await query;
  const supplierList = (suppliers ?? []) as Supplier[];

  // Fetch components to map supplier → H1 components
  const { data: components } = await supabase
    .from("components")
    .select("id, name, type, oem_supplier_id");
  const componentList = (components ?? []) as Pick<
    Component,
    "id" | "name" | "type" | "oem_supplier_id"
  >[];

  const componentsBySupplier: Record<string, typeof componentList> = {};
  for (const comp of componentList) {
    if (comp.oem_supplier_id) {
      componentsBySupplier[comp.oem_supplier_id] ??= [];
      componentsBySupplier[comp.oem_supplier_id].push(comp);
    }
  }

  const regionColor: Record<string, string> = {
    Asia: "bg-sky-500/10 text-sky-400",
    Europe: "bg-violet-500/10 text-violet-400",
    "North America": "bg-emerald-500/10 text-emerald-400",
  };

  const typeColor: Record<string, string> = {
    motor: "bg-orange-500/10 text-orange-400",
    battery: "bg-yellow-500/10 text-yellow-400",
    actuator: "bg-red-500/10 text-red-400",
    sensor: "bg-cyan-500/10 text-cyan-400",
    pcb: "bg-indigo-500/10 text-indigo-400",
    reducer: "bg-purple-500/10 text-purple-400",
    hand: "bg-pink-500/10 text-pink-400",
    bearing: "bg-stone-500/10 text-stone-400",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Supplier Catalog</p>
          <h1 className="font-header text-2xl tracking-[-0.03em] text-black mt-0.5">
            Acquire
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Atlas-sourced supplier data for Unitree H1 components.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Type filter */}
          <form method="GET" className="flex items-center gap-1">
            <input type="hidden" name="region" value={regionFilter} />
            <select
              name="type"
              defaultValue={typeFilter}
              onChange={(e) => {
                (e.target.form as HTMLFormElement).submit();
              }}
              className="text-xs border border-black/10 rounded-lg px-3 py-2 bg-white text-zinc-700 cursor-pointer"
            >
              {COMPONENT_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t === "all" ? "All types" : t}
                </option>
              ))}
            </select>
          </form>
          {/* Region filter */}
          <form method="GET" className="flex items-center gap-1">
            <input type="hidden" name="type" value={typeFilter} />
            <select
              name="region"
              defaultValue={regionFilter}
              onChange={(e) => {
                (e.target.form as HTMLFormElement).submit();
              }}
              className="text-xs border border-black/10 rounded-lg px-3 py-2 bg-white text-zinc-700 cursor-pointer"
            >
              {REGION_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r === "all" ? "All regions" : r}
                </option>
              ))}
            </select>
          </form>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="panel px-5 py-4">
          <p className="kicker">Total Suppliers</p>
          <p className="text-3xl font-header tracking-[-0.04em] text-black mt-1">
            {supplierList.length}
          </p>
        </div>
        <div className="panel px-5 py-4">
          <p className="kicker">Bottleneck Suppliers</p>
          <p className="text-3xl font-header tracking-[-0.04em] text-ember mt-1">
            {supplierList.filter((s) => s.is_bottleneck).length}
          </p>
        </div>
        <div className="panel px-5 py-4">
          <p className="kicker">Regions Covered</p>
          <p className="text-3xl font-header tracking-[-0.04em] text-black mt-1">
            {new Set(supplierList.map((s) => s.region).filter(Boolean)).size}
          </p>
        </div>
      </div>

      {/* Supplier grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {supplierList.length === 0 ? (
          <div className="col-span-full text-center text-zinc-400 py-16">
            No suppliers match current filters.
          </div>
        ) : (
          supplierList.map((supplier) => {
            const mapped = componentsBySupplier[supplier.id] ?? [];
            return (
              <div
                key={supplier.id}
                className="panel px-5 py-5 flex flex-col gap-3"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-black leading-tight">
                      {supplier.name}
                    </h3>
                    {supplier.ticker && (
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {supplier.ticker}
                      </p>
                    )}
                  </div>
                  {supplier.is_bottleneck && (
                    <span className="flex-shrink-0 flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3" />
                      Bottleneck
                    </span>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      typeColor[supplier.component_type] ??
                      "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {supplier.component_type}
                  </span>
                  {supplier.region && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        regionColor[supplier.region] ??
                        "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {supplier.country ?? supplier.region}
                    </span>
                  )}
                  {supplier.market_share && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                      {supplier.market_share} share
                    </span>
                  )}
                </div>

                {/* Price */}
                {supplier.unit_price != null && (
                  <p className="text-lg font-header tracking-[-0.03em] text-black">
                    ${supplier.unit_price.toLocaleString()}
                    <span className="text-xs text-zinc-400 font-normal ml-1">
                      /unit
                    </span>
                  </p>
                )}

                {/* H1 components */}
                {mapped.length > 0 && (
                  <div>
                    <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      H1 Components
                    </p>
                    <div className="space-y-1">
                      {mapped.map((c) => (
                        <p key={c.id} className="text-xs text-zinc-600 leading-tight">
                          {c.name}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Links */}
                <div className="flex gap-2 mt-auto pt-1">
                  {supplier.website && (
                    <a
                      href={supplier.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-zinc-500 hover:text-black transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Website
                    </a>
                  )}
                  <a
                    href={`https://www.humanoidatlas.com/companies/${supplier.atlas_supplier_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 transition-colors ml-auto"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Atlas
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
