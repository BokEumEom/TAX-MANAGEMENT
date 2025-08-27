-- Insert default tax types
INSERT INTO public.tax_types (name, description, rate) VALUES
  ('부가가치세', '전기차 충전 서비스에 대한 부가가치세', 0.1000),
  ('법인세', '법인 소득에 대한 세금', 0.2200),
  ('지방세', '지방자치단체에 납부하는 세금', 0.0500),
  ('전력산업기반기금', '전력산업 발전을 위한 기금', 0.0370)
ON CONFLICT DO NOTHING;
