-- ══════════════════════════════════════════════════════════════════════════
-- CAAT REACTIVATION — Schema Iniziale
-- 10 tabelle, indici, trigger updated_at, RLS disabilitato
-- ══════════════════════════════════════════════════════════════════════════

-- ── Funzione trigger updated_at ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ══════════════════════════════════════════════════════════════════════════
-- 1. CLIENTI — anagrafica clienti
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE clienti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  arca_id TEXT UNIQUE,
  nome TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT,
  indirizzo TEXT,
  categoria TEXT,
  note_titolare TEXT,
  consenso_whatsapp BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_clienti_updated_at
  BEFORE UPDATE ON clienti
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

ALTER TABLE clienti DISABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════════════════
-- 2. PRODOTTI — catalogo prodotti
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE prodotti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  arca_articolo_id TEXT UNIQUE,
  nome TEXT NOT NULL,
  categoria TEXT,
  prezzo_listino NUMERIC(10,2),
  unita_misura TEXT,
  fornitore TEXT,
  disponibile BOOLEAN DEFAULT true,
  data_inserimento TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE prodotti DISABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════════════════
-- 3. STORICO_ACQUISTI — righe documento vendita
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE storico_acquisti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clienti(id) ON DELETE CASCADE,
  prodotto_id UUID NOT NULL REFERENCES prodotti(id) ON DELETE CASCADE,
  data_acquisto DATE NOT NULL,
  quantita NUMERIC(10,2),
  prezzo_unitario NUMERIC(10,2),
  importo_totale NUMERIC(10,2),
  numero_documento TEXT
);

ALTER TABLE storico_acquisti DISABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════════════════
-- 4. NOVITA_PRODOTTI — nuovi arrivi
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE novita_prodotti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prodotto_id UUID NOT NULL REFERENCES prodotti(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('nuovo', 'tornato_disponibile')),
  data_rilevamento DATE DEFAULT CURRENT_DATE,
  gia_proposto BOOLEAN DEFAULT false
);

ALTER TABLE novita_prodotti DISABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════════════════
-- 5. OFFERTE_GIORNALIERE — cuore del sistema
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE offerte_giornaliere (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clienti(id) ON DELETE CASCADE,
  data_generazione DATE NOT NULL DEFAULT CURRENT_DATE,
  giorni_dormiente INTEGER,
  offerta_claude JSONB NOT NULL,
  offerta_finale JSONB,
  messaggio_cliente TEXT,
  stato TEXT DEFAULT 'pending' CHECK (stato IN ('pending','approved','modified','sent','postponed','excluded')),
  data_rimando DATE,
  motivo_esclusione TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_offerte_giornaliere_updated_at
  BEFORE UPDATE ON offerte_giornaliere
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

ALTER TABLE offerte_giornaliere DISABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════════════════
-- 6. CONVERSAZIONI — storico messaggi WhatsApp
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE conversazioni (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clienti(id) ON DELETE SET NULL,
  interlocutore TEXT NOT NULL CHECK (interlocutore IN ('titolare', 'cliente')),
  direzione TEXT NOT NULL CHECK (direzione IN ('in', 'out')),
  tipo_messaggio TEXT NOT NULL CHECK (tipo_messaggio IN ('testo', 'audio', 'immagine')),
  contenuto TEXT,
  trascrizione TEXT,
  wa_message_id TEXT,
  offerta_id UUID REFERENCES offerte_giornaliere(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE conversazioni DISABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════════════════
-- 7. REGOLE_COMMERCIALI — regole per Claude
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE regole_commerciali (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_regola TEXT NOT NULL,
  descrizione TEXT,
  condizione JSONB,
  azione JSONB,
  attiva BOOLEAN DEFAULT true,
  priorita INTEGER DEFAULT 0
);

ALTER TABLE regole_commerciali DISABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════════════════
-- 8. BLACKLIST — esclusi permanenti
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clienti(id) ON DELETE CASCADE UNIQUE,
  motivo TEXT,
  escluso_da TEXT DEFAULT 'titolare',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE blacklist DISABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════════════════
-- 9. CONFIG_SISTEMA — configurazioni globali
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE config_sistema (
  chiave TEXT PRIMARY KEY,
  valore TEXT NOT NULL,
  descrizione TEXT
);

ALTER TABLE config_sistema DISABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════════════════
-- 10. OWNER_SESSION — stato sessione titolare
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE owner_session (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stato TEXT DEFAULT 'idle' CHECK (stato IN ('idle','reviewing','viewing_detail','modifying')),
  offerta_in_modifica UUID REFERENCES offerte_giornaliere(id) ON DELETE SET NULL,
  data_sessione DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_owner_session_updated_at
  BEFORE UPDATE ON owner_session
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

ALTER TABLE owner_session DISABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════════════════
-- INDICI
-- ══════════════════════════════════════════════════════════════════════════
CREATE INDEX idx_storico_acquisti_cliente_id ON storico_acquisti(cliente_id);
CREATE INDEX idx_storico_acquisti_data_acquisto ON storico_acquisti(data_acquisto);
CREATE INDEX idx_offerte_giornaliere_stato ON offerte_giornaliere(stato);
CREATE INDEX idx_offerte_giornaliere_data_generazione ON offerte_giornaliere(data_generazione);
