-- SROI-uitbreiding op de Impact Calculator (aug 2026): investeringsinput + afgeleide ratio.
ALTER TABLE impact_calculator_leads ADD COLUMN IF NOT EXISTS investering_kosten NUMERIC(10,2);
ALTER TABLE impact_calculator_leads ADD COLUMN IF NOT EXISTS avoided_verzuim_euro NUMERIC(12,2);
ALTER TABLE impact_calculator_leads ADD COLUMN IF NOT EXISTS sroi_ratio NUMERIC(6,2);
