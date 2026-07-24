-- Add ip and country columns to analytics_events table
-- Run this in Supabase Dashboard → SQL Editor

ALTER TABLE analytics_events
  ADD COLUMN IF NOT EXISTS ip text,
  ADD COLUMN IF NOT EXISTS country text;
