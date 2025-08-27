-- Adding new tax status stages including 회계사검토 for acquisition tax
-- Update existing tax records to use new status values
UPDATE taxes SET status = 'pending' WHERE status = '납부예정';
UPDATE taxes SET status = 'completed' WHERE status = '납부완료';

-- Add constraint to ensure valid status values
ALTER TABLE taxes DROP CONSTRAINT IF EXISTS taxes_status_check;
ALTER TABLE taxes ADD CONSTRAINT taxes_status_check 
CHECK (status IN ('pending', 'completed', 'accountant_review', 'overdue'));

-- Add comment to clarify status meanings
COMMENT ON COLUMN taxes.status IS 'Tax payment status: pending (납부예정), completed (납부완료), accountant_review (회계사검토 - 취득세만), overdue (연체)';
