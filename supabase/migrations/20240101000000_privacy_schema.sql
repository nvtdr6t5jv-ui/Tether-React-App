-- Migration: Privacy-focused schema update
-- This migration removes PII from cloud storage and adds phone_hash for cross-device matching

-- Step 1: Add new columns to friends table
ALTER TABLE friends ADD COLUMN IF NOT EXISTS phone_hash TEXT;
ALTER TABLE friends ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;

-- Step 2: Remove PII columns from friends table
-- First, backup existing data if needed (run separately if you want to preserve)
-- CREATE TABLE friends_backup AS SELECT * FROM friends;

ALTER TABLE friends DROP COLUMN IF EXISTS name;
ALTER TABLE friends DROP COLUMN IF EXISTS initials;
ALTER TABLE friends DROP COLUMN IF EXISTS phone;
ALTER TABLE friends DROP COLUMN IF EXISTS email;
ALTER TABLE friends DROP COLUMN IF EXISTS birthday;
ALTER TABLE friends DROP COLUMN IF EXISTS notes;
ALTER TABLE friends DROP COLUMN IF EXISTS how_met;

-- Step 3: Remove PII from interactions table
ALTER TABLE interactions DROP COLUMN IF EXISTS note;

-- Step 4: Remove potentially sensitive data from calendar_events
ALTER TABLE calendar_events DROP COLUMN IF EXISTS description;

-- Step 5: Remove message from reminders (could contain PII)
ALTER TABLE reminders DROP COLUMN IF EXISTS message;

-- Step 6: Create index on phone_hash for efficient matching
CREATE INDEX IF NOT EXISTS idx_friends_phone_hash ON friends(phone_hash);
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);

-- Note: After running this migration, all contact PII will only exist on users' local devices
-- Cloud will only store: metadata (orbit, favorite status, reminder frequency, last contact, streak)
-- Cross-device sync uses phone_hash to match local contacts with cloud records
