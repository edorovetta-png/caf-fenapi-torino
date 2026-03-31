# CAAT REACTIVATION — FASE 1: Database e Seed Data

## Configurazione Claude Code (IMPORTANTE — LEGGERE PRIMA DI INIZIARE)

Prima di iniziare qualsiasi operazione, configura Claude Code per non chiedere autorizzazione ad ogni modifica:

```bash
# Esegui questo comando nel terminale PRIMA di iniziare:
claude config set --global autoApprove "bash,write,edit"
```

Questo evita che Claude Code chieda conferma per ogni file creato o comando eseguito. Se il comando non funziona nella tua versione, prova:
```bash
claude config set autoApprove true
```

Oppure, quando Claude Code ti chiede "Do you want to proceed?", rispondi con "always" invece di "yes" — questo abilita l'auto-approve per la sessione.

---

## Contesto del Progetto

Stai costruendo "CAAT Reactivation", un sistema per riattivare clienti dormienti di un'azienda alimentare al CAAT di Torino. Lo stack è: Supabase (DB + Edge Functions), Vercel (Next.js admin panel), Claude API, WhatsApp Cloud API, OpenAI Whisper.

In questa fase costruiamo SOLO il database Supabase e i dati di test. Nessuna logica, nessun frontend.

Il documento di specifica completo è allegato (caat-reactivation-spec.docx). Riferisciti alla SEZIONE 2 (Schema Database) e alla SEZIONE 6 (Seed Data) per tutti i dettagli.

---

## Istruzioni Operative

### Step 1: Crea il progetto Supabase

Se non esiste già, crea un nuovo progetto Supabase chiamato `caat-reactivation`. Regione: EU West (Frankfurt). Password database: generane una sicura e salvala in un file `.env.local`.

### Step 2: Crea lo schema database

Crea un file `supabase/migrations/001_initial_schema.sql` con TUTTE le tabelle seguenti. Riferisciti alla sezione 2 della specifica per i dettagli completi di ogni colonna.

**Tabelle da creare (10 totali):**

1. `clienti` — anagrafica clienti con campi: id (uuid PK), arca_id (text UNIQUE nullable), nome (text NOT NULL), telefono (text NOT NULL), email (text), indirizzo (text), categoria (text), note_titolare (text), consenso_whatsapp (boolean DEFAULT false), created_at, updated_at.

2. `prodotti` — catalogo con: id, arca_articolo_id (text UNIQUE nullable), nome, categoria, prezzo_listino (numeric 10,2), unita_misura, fornitore, disponibile (boolean DEFAULT true), data_inserimento (timestamptz), created_at.

3. `storico_acquisti` — righe documento vendita: id, cliente_id (FK clienti), prodotto_id (FK prodotti), data_acquisto (date), quantita (numeric 10,2), prezzo_unitario (numeric 10,2), importo_totale (numeric 10,2), numero_documento (text).

4. `novita_prodotti` — nuovi arrivi: id, prodotto_id (FK prodotti), tipo (text: "nuovo" o "tornato_disponibile"), data_rilevamento (date), gia_proposto (boolean DEFAULT false).

5. `offerte_giornaliere` — cuore del sistema: id, cliente_id (FK clienti), data_generazione (date), giorni_dormiente (integer), offerta_claude (jsonb NOT NULL), offerta_finale (jsonb nullable), messaggio_cliente (text), stato (text DEFAULT 'pending' — valori: pending/approved/modified/sent/postponed/excluded), data_rimando (date nullable), motivo_esclusione (text nullable), created_at, updated_at.

6. `conversazioni` — storico messaggi WA: id, cliente_id (FK clienti nullable — NULL per messaggi col titolare), interlocutore (text: "titolare" o "cliente"), direzione (text: "in" o "out"), tipo_messaggio (text: "testo"/"audio"/"immagine"), contenuto (text), trascrizione (text nullable), wa_message_id (text), offerta_id (FK offerte_giornaliere nullable), created_at.

7. `regole_commerciali` — regole per Claude: id, nome_regola (text NOT NULL), descrizione (text), condizione (jsonb), azione (jsonb), attiva (boolean DEFAULT true), priorita (integer DEFAULT 0).

8. `blacklist` — esclusi permanenti: id, cliente_id (FK clienti UNIQUE), motivo (text), escluso_da (text DEFAULT 'titolare'), created_at.

9. `config_sistema` — configurazioni globali: chiave (text PK), valore (text NOT NULL), descrizione (text).

10. `owner_session` — stato sessione titolare: id, stato (text DEFAULT 'idle' — valori: idle/reviewing/viewing_detail/modifying), offerta_in_modifica (FK offerte_giornaliere nullable), data_sessione (date), updated_at.

**Aggiungi anche:**
- Indici su storico_acquisti(cliente_id), storico_acquisti(data_acquisto), offerte_giornaliere(stato), offerte_giornaliere(data_generazione)
- Trigger `updated_at` automatico su clienti, offerte_giornaliere, owner_session
- RLS policies: per ora disabilita RLS su tutte le tabelle (le attiveremo nella Fase 4 con l'auth)

### Step 3: Applica la migration

Esegui la migration su Supabase. Verifica che tutte le 10 tabelle siano state create correttamente.

### Step 4: Crea lo script di seed

Crea il file `supabase/seed/seed.sql` con dati realistici per il mercato alimentare del CAAT di Torino.

**Clienti (30):**
Mix di categorie: 8 ristoranti, 6 pizzerie, 4 rosticcerie, 4 bar, 3 catering, 2 hotel, 3 trattorie. Nomi realistici torinesi/italiani. Tutti con consenso_whatsapp = true. Numeri di telefono finti ma formato italiano (+39 3xx xxx xxxx). Circa 18 dormienti (ultimo acquisto >60 giorni fa), 12 attivi.

**Prodotti (50):**
Prodotti tipici del commercio alimentare all'ingrosso: latticini (mozzarella, burrata, ricotta, provolone, scamorza, parmigiano), conserve (pomodori, passata, pelati), olio (EVO varie provenienze), farine (Caputo, Manitoba, integrale), salumi (prosciutto, nduja, bresaola, salame), pasta (di Gragnano, fresca), pesce (baccalà, tonno), bevande (acqua, birra artigianale). Prezzi realistici all'ingrosso. 3-4 prodotti con data_inserimento negli ultimi 7 giorni (sono le novità).

**Novità prodotti (3-4):**
Collegati ai prodotti con data_inserimento recente. Tipo "nuovo".

**Storico acquisti:**
Per ogni cliente dormiente, genera 6-12 mesi di storico con pattern realistici:
- Ogni cliente ha 3-6 prodotti "abituali" che compra con frequenza regolare
- Le frequenze variano: settimanale per freschi (mozzarella, burrata), bisettimanale per conserve, mensile per olio/farine
- Le quantità variano leggermente (+/- 20%) tra un ordine e l'altro
- Lo storico si interrompe alla data coerente con i giorni di dormienza
- Per i clienti attivi, lo storico arriva fino a oggi
- Genera almeno 500-800 righe totali di storico_acquisti

**Regole commerciali (6):**
```
1. sconto_base: condizione {giorni_dormiente: "60-90"}, azione {sconto_max_pct: 10}
2. sconto_aggressivo: condizione {giorni_dormiente: ">90"}, azione {sconto_max_pct: 20}
3. trasporto_gratis: condizione {media_ordine_eur: ">300"}, azione {trasporto_gratuito: true}
4. novita_categoria: condizione {novita_in_categoria_abituale: true}, azione {includi_suggerimento: true}
5. limite_prodotti: condizione {sempre: true}, azione {max_prodotti: 4}
6. validita: condizione {sempre: true}, azione {giorni_validita: 7}
```

**Config sistema:**
```
ora_estrazione: "00:30"
ora_notifica: "02:00"
timeout_approvazione: "04:00"
telefono_titolare: "+39 333 000 0000"
giorni_dormienza_soglia: "60"
giorni_rimando_default: "14"
mock_mode: "true"
```

**Owner session:**
Una riga con stato "idle".

### Step 5: Esegui il seed

Esegui il seed SQL su Supabase. Verifica che i dati siano stati inseriti.

### Step 6: Query di verifica

Esegui queste query di verifica e mostrami i risultati:

```sql
-- 1. Conta totale per tabella
SELECT 'clienti' as tabella, count(*) from clienti
UNION ALL SELECT 'prodotti', count(*) from prodotti
UNION ALL SELECT 'storico_acquisti', count(*) from storico_acquisti
UNION ALL SELECT 'novita_prodotti', count(*) from novita_prodotti
UNION ALL SELECT 'regole_commerciali', count(*) from regole_commerciali
UNION ALL SELECT 'config_sistema', count(*) from config_sistema;

-- 2. Clienti dormienti (>60 giorni senza acquisti)
SELECT c.nome, c.categoria,
  MAX(sa.data_acquisto) as ultimo_acquisto,
  CURRENT_DATE - MAX(sa.data_acquisto) as giorni_dormiente,
  ROUND(AVG(sa.importo_totale), 2) as media_importo
FROM clienti c
JOIN storico_acquisti sa ON sa.cliente_id = c.id
LEFT JOIN blacklist b ON b.cliente_id = c.id
WHERE b.id IS NULL
GROUP BY c.id, c.nome, c.categoria
HAVING CURRENT_DATE - MAX(sa.data_acquisto) > 60
ORDER BY giorni_dormiente DESC;

-- 3. Novità della settimana
SELECT p.nome, p.categoria, p.prezzo_listino, np.tipo
FROM novita_prodotti np
JOIN prodotti p ON p.id = np.prodotto_id
WHERE np.data_rilevamento > CURRENT_DATE - 7;

-- 4. Top prodotti per un cliente dormiente specifico (prendi il primo dalla query 2)
-- Sostituisci 'NOME_CLIENTE' con il nome reale
SELECT p.nome, COUNT(*) as n_acquisti,
  ROUND(AVG(sa.prezzo_unitario), 2) as prezzo_medio,
  MAX(sa.data_acquisto) as ultimo
FROM storico_acquisti sa
JOIN prodotti p ON p.id = sa.prodotto_id
JOIN clienti c ON c.id = sa.cliente_id
WHERE c.nome = 'NOME_PRIMO_CLIENTE_DORMIENTE'
GROUP BY p.nome
ORDER BY n_acquisti DESC
LIMIT 5;
```

---

## CHECKPOINT FASE 1

Quando hai completato tutti gli step, mandami screenshot di:

1. **Screenshot della dashboard Supabase** → Table Editor che mostra la lista delle 10 tabelle create
2. **Screenshot del risultato della query 1** → conteggi per tabella (devo vedere almeno 30 clienti, 50 prodotti, 500+ storico)
3. **Screenshot del risultato della query 2** → lista clienti dormienti con giorni di dormienza
4. **Screenshot del risultato della query 3** → novità della settimana

Con questi 4 screenshot posso verificare che tutto è corretto prima di passare alla Fase 2.

---

## Struttura file creati in questa fase

```
caat-reactivation/
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── seed/
│       └── seed.sql
├── .env.local          (credenziali Supabase)
└── .gitignore          (includi .env.local)
```
