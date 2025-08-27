-- Converting database structure to shared company data
-- Remove owner_id from charge_stations to make data shared across all users
ALTER TABLE charge_stations DROP COLUMN IF EXISTS owner_id;

-- Update existing data to be accessible by all users
-- No additional changes needed for taxes table as it's already linked through charge_stations
-- Reminders and settings remain user-specific

-- Add comment to clarify the new structure
COMMENT ON TABLE charge_stations IS 'Shared charge stations data for all company users';
COMMENT ON TABLE taxes IS 'Shared tax data linked to company charge stations';
COMMENT ON TABLE reminders IS 'User-specific reminders and notifications';
COMMENT ON TABLE settings IS 'User-specific application settings';
