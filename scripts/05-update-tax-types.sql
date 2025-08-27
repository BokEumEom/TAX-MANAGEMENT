-- Update tax types to 취득세, 재산세, 기타세
-- Clear existing tax types and insert new ones
DELETE FROM tax_types;

-- Insert new tax types
INSERT INTO tax_types (id, name, description, rate, created_at) VALUES
(gen_random_uuid(), '취득세', '부동산 취득 시 부과되는 세금', 0.04, NOW()),
(gen_random_uuid(), '재산세', '부동산 보유 시 부과되는 세금', 0.002, NOW()),
(gen_random_uuid(), '기타세', '기타 세무 관련 세금', 0.01, NOW());
