-- Aggiunge indice corrente e lista offerte ordinate alla owner_session
ALTER TABLE owner_session ADD COLUMN IF NOT EXISTS indice_corrente INTEGER DEFAULT 0;
ALTER TABLE owner_session ADD COLUMN IF NOT EXISTS offerte_ids UUID[] DEFAULT '{}';
