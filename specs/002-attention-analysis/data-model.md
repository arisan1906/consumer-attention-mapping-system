# Data Model Design (Milestone 2)

This document details the database tables added to Supabase PostgreSQL for tracking telemetry and dwell analytics.

## SQL Schemas

```sql
-- 1. Tracking Sessions Table
create table public.tracking_sessions (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  track_id integer not null, -- YOLO unique track ID
  start_time timestamp with time zone default timezone('utc'::text, now()) not null,
  end_time timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for fast query of active sessions
create index idx_tracking_sessions_store on public.tracking_sessions(store_id);

-- 2. Dwell Events Table
create table public.dwell_events (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.tracking_sessions(id) on delete cascade not null,
  zone_id uuid references public.zones(id) on delete cascade not null,
  shelf_id uuid references public.shelves(id) on delete cascade,
  duration float not null, -- total seconds spent in zone
  gaze_duration float default 0.0 not null, -- total seconds looking at shelf
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for analytics extraction
create index idx_dwell_events_zone on public.dwell_events(zone_id);
create index idx_dwell_events_shelf on public.dwell_events(shelf_id);

-- 3. Live Telemetry Logs Table (High-frequency data)
create table public.telemetry_logs (
  id bigserial primary key,
  session_id uuid references public.tracking_sessions(id) on delete cascade not null,
  camera_id uuid references public.cameras(id) on delete cascade not null,
  x_coord float not null, -- projected x position (meters)
  y_coord float not null, -- projected y position (meters)
  head_yaw float,
  head_pitch float,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for rendering tracking paths
create index idx_telemetry_logs_session on public.telemetry_logs(session_id, created_at desc);
```
