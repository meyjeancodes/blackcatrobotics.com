-- Phase 4: Parts inventory baseline (Supabase-backed)

create table if not exists parts_inventory (
  part_name      text not null,
  part_number    text,
  supplier       text,
  region         text,
  on_hand        integer not null default 0,
  reorder_point  integer not null default 0,
  unit_cost_usd  numeric(10,2),
  lead_time_days integer,
  min_order_qty  integer not null default 1,
  last_restocked_at timestamptz,
  updated_at     timestamptz default now(),
  primary key (part_name, part_number, supplier)
);

create index if not exists idx_parts_inventory_supplier on parts_inventory (supplier);
create index if not exists idx_parts_inventory_region on parts_inventory (region);
create index if not exists idx_parts_inventory_reorder on parts_inventory (on_hand, reorder_point);

create table if not exists replenishment_requests (
  id            bigserial primary key,
  part_name     text not null,
  part_number   text,
  supplier      text,
  region        text,
  qty           integer not null,
  est_cost_usd  numeric(10,2),
  reason        text,
  source        text,
  status        text not null default 'pending'
                  check (status in ('pending','ordered','received','cancelled')),
  requested_at  timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists idx_replenishment_status on replenishment_requests (status);
create index if not exists idx_replenishment_supplier on replenishment_requests (supplier);
