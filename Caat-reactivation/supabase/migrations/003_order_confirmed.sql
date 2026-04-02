-- Aggiunge stato order_confirmed e campo ordine_confermato
ALTER TABLE offerte_giornaliere DROP CONSTRAINT IF EXISTS offerte_giornaliere_stato_check;
ALTER TABLE offerte_giornaliere ADD CONSTRAINT offerte_giornaliere_stato_check
  CHECK (stato IN ('pending','approved','modified','sent','postponed','excluded','order_confirmed'));

ALTER TABLE offerte_giornaliere ADD COLUMN IF NOT EXISTS ordine_confermato JSONB;
