-- Add missing tables that exist in production but were not in migrations
-- Generated: 2026-04-24T01:34:25.794122

-- Migration: add ai_insights_cache
CREATE TABLE IF NOT EXISTS ai_insights_cache (
    type text NOT NULL,
    insight text,
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (type)
);

-- Migration: add api_keys
CREATE TABLE IF NOT EXISTS api_keys (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL,
    label text NOT NULL,
    key_hash text NOT NULL,
    last_used_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- Migration: add customer_memberships
CREATE TABLE IF NOT EXISTS customer_memberships (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role app_role NOT NULL DEFAULT 'customer_operator'::app_role,
    PRIMARY KEY (id)
);

-- Migration: add energy_states
CREATE TABLE IF NOT EXISTS energy_states (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    robot_id uuid,
    battery_level integer NOT NULL,
    consumption_rate numeric,
    solar_kwh numeric DEFAULT 0,
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);

-- Migration: add energy_transactions
CREATE TABLE IF NOT EXISTS energy_transactions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    buyer_id uuid,
    seller_id uuid,
    kwh numeric,
    price_per_kwh numeric,
    total_price numeric,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);

-- Migration: add tasks
CREATE TABLE IF NOT EXISTS tasks (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    robot_id uuid,
    type text,
    priority integer DEFAULT 2,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);

-- Migration: add user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id uuid NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    global_role app_role NOT NULL DEFAULT 'customer_operator'::app_role,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);
