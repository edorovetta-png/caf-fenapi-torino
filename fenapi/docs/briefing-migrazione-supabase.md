# Briefing per Claude Chat — Migrazione Supabase FENAPI

> Questo documento contiene tutto il contesto necessario per guidarmi nella migrazione del database Supabase del progetto caffenapi (sistema prenotazioni del Circolo FENAPI Torino).

---

## Cos'e il progetto

**caffenapi** e un'app React (Vite + TypeScript + shadcn/ui) per la prenotazione online di appuntamenti al CAF FENAPI di Torino. Backend: Supabase (PostgreSQL + 8 Edge Functions). Deploy: Vercel su `caffenapi.vercel.app`, dominio `prenotazioni.fenapipiemonte.org`.

---

## Il problema

La produzione gira su un Supabase **provisionato da Lovable** (`patzvzdxsglsbfqymgtz.supabase.co`), dentro l'organizzazione di Lovable. Io (Edoardo) non ho accesso amministrativo: niente CLI, niente dashboard, niente gestione secrets. Funziona solo perche l'anon key e hardcoded nel bundle Vite.

Ho un **mio Supabase** (`oswjgmavxbypnhhinypj.supabase.co`) nell'org `edorovetta-png's Org`, con pieno accesso. L'obiettivo e migrare tutto li.

---

## Cosa e gia stato fatto (7 aprile 2026)

### Migrazione dati completata sullo snapshot

Sul mio Supabase `oswjgmavxbypnhhinypj` ci sono gia:
- 8 auth users (UUID originali preservati tramite Auth Admin API)
- 22 categories, 7 profiles, 8 user_roles, 1 master_admins
- 36 user_service_assignments, 34 appointments, 21 document_uploads (solo metadata)
- Schema UTM tracking applicato (utm_source/medium/campaign/referrer/landing_path su appointments)
- Edge function `create-appointment` deployata

Lo script di migrazione (`fenapi/scripts/migrate-data-to-new-supabase.py`) e **idempotente** e puo essere rieseguito. Lo script di export (`fenapi/scripts/export-old-supabase.js`) gira nella console browser dell'admin per fare un nuovo snapshot.

### Rollback eseguito lo stesso giorno

Il frontend e stato riportato al vecchio Supabase perche mancavano 7 edge function su 8 e 2 dipendenze esterne bloccanti. Oggi la produzione e di nuovo su `patzvzdxsglsbfqymgtz`.

---

## Cosa manca per completare la migrazione

### Blocker 1 — Google Service Account JSON

Le edge function `check-availability`, `create-appointment`, `google-calendar`, `google-drive-upload`, `manage-appointment` usano un Service Account Google per:
- Controllare disponibilita operatori via freeBusy API
- Creare eventi sui calendari degli operatori
- Caricare documenti su Google Drive

Il vecchio SA JSON era settato come secret sul Supabase Lovable, a cui non ho accesso. Devo **ricrearlo da zero**.

**Procedura gia documentata** (pronta, step-by-step):
- `fenapi/docs/google-service-account-setup.md` — SOP tecnica completa
- `fenapi/docs/istruzioni-collega-google-cloud.md` — guida non-tecnica in italiano per la collega del CAF che ha le password di tutti i 7 Gmail degli operatori

**La collega deve fare 2 cose** (~30 min totali):
1. Creare un GCP project + Service Account + scaricare il JSON (~13 min)
2. Condividere 7 calendari operatori col SA (~15 min)

I 7 Gmail degli operatori:
| Operatore | Gmail |
|---|---|
| Erika Borghese | fenapicaf2022@gmail.com |
| Giorgia Longhi | fenapitorino@gmail.com |
| Glennys De Morla | iseefenapi1@gmail.com |
| Leonardo Ottaiano | infofenapitorino@gmail.com |
| Eliane Do Carmo | paghefenapi@gmail.com |
| Michela Salerno | inapitorino1@gmail.com |
| Dott.ssa Daniela Palillo | daniela.palillo@torino.fenapipiemonte.org (da verificare se ha Calendar attivo) |

### Blocker 2 — Servizio email

Le edge function `send-booking-email` e `process-email-queue` usano `LOVABLE_API_KEY` + `LOVABLE_SEND_URL` (API proprietaria Lovable) per inviare email di conferma. Non ho accesso a queste credenziali.

**Soluzione scelta**: sostituire con **Resend** (free tier 100 email/giorno, piu che sufficiente). Richiede:
- Registrazione su resend.com
- Creazione API key
- Modifica delle 2 edge function per usare l'API Resend al posto di Lovable
- Configurazione dominio per email transazionali (opzionale ma consigliato)

### Blocker 3 — Re-sync dei dati

Dal 7 aprile a oggi sono passati dei giorni. Nuove prenotazioni potrebbero essere arrivate sul vecchio Supabase. Prima di switchare devo:
1. Fare un nuovo export dal vecchio Supabase (script browser console)
2. Rieseguire lo script di migrazione (idempotente, non duplica)

---

## Procedura di migrazione completa (checklist ordinata)

### Fase 1 — Prerequisiti (da fare PRIMA di tutto il resto)

- [ ] **Rigenerare la service_role key** di `oswjgmavxbypnhhinypj` dalla dashboard Supabase (Settings > API > Reset) — era stata esposta in chat il 7 aprile
- [ ] **Ottenere il Google SA JSON** dalla collega (seguendo le istruzioni gia pronte)
- [ ] **Registrarsi su Resend** e ottenere API key
- [ ] (Opzionale) Configurare dominio su Resend per email da `@fenapipiemonte.org`

### Fase 2 — Preparazione codice

- [ ] Modificare `send-booking-email` edge function: sostituire Lovable API con Resend API
- [ ] Modificare `process-email-queue` edge function: stesso cambio
- [ ] Testare le edge function modificate localmente (se possibile)

### Fase 3 — Refresh dati

- [ ] Eseguire `export-old-supabase.js` dalla console browser dell'admin su `prenotazioni.fenapipiemonte.org`
- [ ] Eseguire `migrate-data-to-new-supabase.py` verso `oswjgmavxbypnhhinypj`
- [ ] (Opzionale) Migrare i file Storage dal bucket `appointment-documents`

### Fase 4 — Deploy edge functions + secrets

- [ ] Verificare che `caffenapi/supabase/config.toml` punti a `oswjgmavxbypnhhinypj`
- [ ] Deploy TUTTE le edge function: `supabase functions deploy` (senza argomenti = deploya tutte)
- [ ] Settare secrets:
  ```bash
  supabase secrets set GOOGLE_SERVICE_ACCOUNT_JSON="$(cat ~/path/al/sa.json)"
  supabase secrets set FRIDAY_OPERATOR_ID=187e9f13-ae3d-4471-b272-835126bec10a
  supabase secrets set RESEND_API_KEY=re_xxxxxxxxx
  # + eventuali altri (DRIVE_FOLDER_ID, ecc.)
  ```
- [ ] Verificare secrets: `supabase secrets list`

### Fase 5 — Switch frontend

- [ ] Aggiornare env vars su Vercel (production + development):
  - `VITE_SUPABASE_URL` = `https://oswjgmavxbypnhhinypj.supabase.co`
  - `VITE_SUPABASE_PUBLISHABLE_KEY` = anon key del nuovo project
- [ ] Redeploy production: `vercel --prod` (dalla cartella caffenapi)
- [ ] Verificare che il bundle usi il nuovo URL

### Fase 6 — Verifica end-to-end

- [ ] Login admin funzionante
- [ ] Visualizzazione appuntamenti esistenti
- [ ] Creazione nuovo appuntamento di test (verifica che l'evento compaia su Google Calendar dell'operatore)
- [ ] Ricezione email di conferma (via Resend)
- [ ] Upload documento (verifica che finisca su Google Drive)
- [ ] Check availability (verifica che la freeBusy API risponda)
- [ ] Dashboard Analytics funzionante (inclusa card UTM tracking)

### Fase 7 — Post-migrazione

- [ ] Sostituire QR fisico in vetrina col nuovo (ha UTM tags)
- [ ] Monitorare per qualche giorno che tutto funzioni
- [ ] (Opzionale) Disattivare/eliminare il vecchio export se non serve piu

---

## Informazioni tecniche utili

- **Supabase CLI**: installato in `/usr/local/bin/supabase` (v2.84.2)
- **Repo caffenapi**: `github.com/edorovetta-png/caffenapi.git` (separato dal repo Antigravity)
- **Cartella locale caffenapi**: `~/Desktop/Antigravity/fenapi/caffenapi/`
- **Vercel project**: `caffenapi` su Vercel, deploy automatico da push su main
- Le 8 edge function sono in `caffenapi/supabase/functions/`:
  1. `check-availability` — controlla slot liberi (freeBusy + DB)
  2. `create-appointment` — crea prenotazione + evento Calendar
  3. `google-calendar` — sync bidirezionale Calendar
  4. `google-drive-upload` — upload documenti
  5. `manage-appointment` — reschedule/cancel
  6. `manage-operators` — CRUD operatori
  7. `send-booking-email` — invio email conferma (DA MODIFICARE: Lovable -> Resend)
  8. `process-email-queue` — coda email (DA MODIFICARE: Lovable -> Resend)

---

## Note importanti

- Il sistema e IN PRODUZIONE e usato quotidianamente dagli operatori del CAF. La migrazione va fatta con attenzione e possibilmente in un momento di basso traffico (sera/weekend).
- Le password degli operatori non cambiano: gli auth users sono stati migrati con UUID identici.
- Il venerdì Michela ha slot fino alle 16:30, gli altri operatori solo mattina — gestito server-side con `FRIDAY_OPERATOR_ID`.
- Lo script di migrazione e idempotente: usa `ON CONFLICT DO UPDATE` e non duplica dati.
