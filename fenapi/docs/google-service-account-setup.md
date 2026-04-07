# Google Service Account Setup — fenapi/caffenapi

> **Scopo**: creare da zero un Service Account Google con accesso ai calendari degli operatori del CAF + cartella Drive per i documenti caricati. L'output è il file `GOOGLE_SERVICE_ACCOUNT_JSON` che alimenta le edge function Supabase di `caffenapi`.
>
> **Quando serve**: quando hai perso il vecchio JSON (es. perché era settato sul Supabase Lovable a cui non hai più accesso) e devi rigenerarlo da zero.
>
> **Tempo stimato**: 30-45 minuti (di cui ~20 di clic ripetuti per condividere gli 8 calendari).
>
> **Ultima revisione**: 2026-04-07

---

## 1. Cosa fa il Service Account in questo progetto

Il SA viene usato dalle edge function Supabase `check-availability`, `create-appointment`, `google-calendar`, `google-drive-upload`, `manage-appointment`. Le sue responsabilità sono:

| Operazione | Cosa fa | Permesso necessario |
|---|---|---|
| **freeBusy check** sui calendari operatori | Prima di confermare uno slot, l'edge function chiede a Google "questo operatore è libero il giorno X all'ora Y?" via API freeBusy. Previene doppie prenotazioni anche se l'operatore aggiunge eventi manualmente nel suo calendar. | Lettura `freeBusy` di ogni calendario operatore |
| **Creazione eventi** sul calendario operatore | Quando una prenotazione viene confermata, viene creato un evento sul calendario dell'operatore assegnato (con titolo "Servizio — Nome Cognome", descrizione con telefono/email/note, orario fisso). | Scrittura eventi sul calendario dell'operatore |
| **Upload documenti su Drive** | Per il servizio Modello 730, il cliente carica la carta d'identità. Il file viene salvato in una cartella Drive condivisa. | Scrittura file in una cartella Drive specifica |

Tutte queste operazioni passano dall'autenticazione SA (JWT signed con la private key del JSON), quindi il JSON è l'unica cosa che serve per riprenderle a funzionare.

---

## 2. Mappa delle email coinvolte

Devi avere accesso (tu o gli operatori stessi) a queste 8 caselle Gmail per ricondividere i calendari col nuovo SA:

| Operatore | Email Gmail (calendar_id) |
|---|---|
| Erika Borghese | `fenapicaf2022@gmail.com` |
| Giorgia Longhi | `fenapitorino@gmail.com` |
| Glennys De Morla | `iseefenapi1@gmail.com` |
| Leonardo Ottaiano | `infofenapitorino@gmail.com` |
| Eliane Do Carmo | `paghefenapi@gmail.com` |
| Michela Salerno | `inapitorino1@gmail.com` |
| Dott.ssa Daniela Palillo | `daniela.palillo@torino.fenapipiemonte.org` (NOTA: dominio custom, non gmail.com — verificare se ha calendar Workspace o se il calendar è altrove) |
| Master Tecnos | `mi.salerno@tecnos-servizi.it` (NON ha un calendar operatore — è solo l'utente master admin del sistema, non assegnato ad appuntamenti) |

> ⚠️ Per Daniela Palillo il `calendar_id` è vuoto nei profili migrati. Va verificato se ha effettivamente un calendar Google associato al suo dominio Workspace o se nel sistema attuale viene comunque assegnata senza sync calendar (in tal caso il SA non deve preoccuparsi del suo calendar).

---

## 3. Creazione del Service Account su Google Cloud Console

### 3.1 Account Google da usare

Devi loggarti su Google Cloud Console con un account che abbia diritti di amministratore di un Google Cloud Project. Possibilità:

- **Account personale Gmail**: va benissimo, puoi creare progetti gratis. La fatturazione resta zero finché non superi il free tier (le API Calendar/Drive sono gratuite per uso normale del CAF — qualche centinaio di chiamate al giorno è praticamente gratuito).
- **Account Google Workspace** del Circolo FENAPI (`@torino.fenapipiemonte.org`): meglio se esiste, perché lega il SA all'organizzazione del CAF anziché a un account personale. Ma non è strettamente necessario.

### 3.2 Crea un nuovo Google Cloud Project

1. Vai su https://console.cloud.google.com/
2. In alto a sinistra, accanto al logo Google Cloud, c'è il **selettore progetti**. Clicca.
3. In alto a destra del modale, clicca **"NEW PROJECT"** (o "Nuovo progetto")
4. Nome: `caffenapi-edge-functions` (o quello che preferisci)
5. Organization: lascia default (o scegli quella di FENAPI se ne hai una)
6. Location: lascia "No organization" se non hai Workspace
7. Click **CREATE**
8. Aspetta ~30 secondi che il project venga provisionato. Quando è pronto, **selezionalo** dal selettore (importante: tutto ciò che faccio nei passi seguenti riguarda QUESTO progetto, non un altro).

### 3.3 Abilita le API necessarie

1. Menu in alto a sinistra (☰) → **APIs & Services** → **Library**
2. Cerca **"Google Calendar API"** → click → **ENABLE**
3. Torna indietro alla Library → cerca **"Google Drive API"** → click → **ENABLE**
4. (Opzionale, non strettamente necessario ma utile) cerca **"Google Sheets API"** → ENABLE

Entrambe le API devono risultare "Enabled" prima di proseguire. Vedrai "API Enabled" in verde.

### 3.4 Crea il Service Account

1. Menu (☰) → **IAM & Admin** → **Service Accounts**
2. In alto, click **"+ CREATE SERVICE ACCOUNT"**
3. **Step 1 — Service account details**:
   - **Service account name**: `caffenapi-edge` (o simile)
   - **Service account ID**: viene generato automaticamente dal nome (es. `caffenapi-edge`). Annotalo: questa è la parte prima della @ dell'email del SA.
   - **Description**: `Edge functions for caffenapi - Calendar/Drive access for CAF operators`
   - Click **CREATE AND CONTINUE**
4. **Step 2 — Grant access (optional)**: **NESSUN ruolo da assegnare**. I permessi del SA su questo progetto sono irrilevanti — l'accesso ai calendari avviene via condivisione esplicita lato Calendar (sezione 4 sotto), non via IAM. Click **CONTINUE**.
5. **Step 3 — Grant users access (optional)**: lascia vuoto. Click **DONE**.

Adesso vedi il SA appena creato nella lista. La sua **email** è del tipo:

```
caffenapi-edge@<PROJECT_ID>.iam.gserviceaccount.com
```

Ad esempio: `caffenapi-edge@caffenapi-edge-functions-447821.iam.gserviceaccount.com`.

**Questa è l'email che dovrai condividere con ogni calendar operatore.** Annotala in un posto comodo (Notes, paste in chat con Claude, ecc.).

### 3.5 Genera la chiave JSON

1. Click sull'email del SA appena creato (entri nei dettagli)
2. Tab **"KEYS"** in alto
3. **ADD KEY** → **Create new key**
4. Tipo: **JSON** (default)
5. Click **CREATE**
6. Il browser **scarica automaticamente** un file `<project-id>-<random>.json` nella cartella Downloads

⚠️ **Sicurezza importante**:
- Il file scaricato contiene una **private key RSA**. Chi la possiede può impersonare il SA e accedere a tutti i calendari condivisi con esso.
- **NON committare mai questo file in git.** Già `.gitignore` esclude `*.json` in alcuni livelli, ma per sicurezza rinominalo subito o spostalo fuori dal repo.
- **Conservalo** in un password manager (1Password, Bitwarden) o in una cartella criptata. Se lo perdi puoi sempre rigenerare una nuova chiave dallo stesso SA (non serve ricreare il SA né ricondividere i calendari — la condivisione è legata all'email, che resta uguale).

---

## 4. Condividi ognuno degli 8 calendari operatori col Service Account

Questo è il pezzo più tedioso ma indispensabile. **Il SA non vede i calendari finché ogni proprietario non lo invita esplicitamente.**

Per ognuno dei 7 operatori che hanno un calendar Google attivo (vedi tabella sezione 2 — escluso Daniela Palillo da verificare e mi.salerno che non è un operatore):

### 4.1 Procedura di condivisione (ripeti 7 volte)

1. **Login su `https://calendar.google.com`** con l'account dell'operatore (es. `fenapicaf2022@gmail.com`)
   - **Tip**: usa una finestra in incognito per ognuno per non doversi sloggare-rilogare 7 volte. Oppure crea profili Chrome diversi.
   - **Tip 2**: chiedi all'operatore di farlo lui sul suo PC se preferisci, mandandogli queste istruzioni semplificate
2. Nella sidebar sinistra, sotto **"My calendars"**, trova il calendario principale dell'account (di solito ha il nome dell'utente o l'email). 
3. Passa il mouse sopra → click sui **3 puntini** che appaiono → **"Settings and sharing"** (o "Impostazioni e condivisione")
4. Scorri fino a **"Share with specific people or groups"** (o "Condividi con persone e gruppi specifici")
5. Click **"+ Add people and groups"**
6. Nel campo email, **incolla l'email del SA** (la trovi nel JSON sotto la chiave `client_email`, esempio: `caffenapi-edge@caffenapi-edge-functions-447821.iam.gserviceaccount.com`)
7. **Permission**: scegli **"Make changes to events"** (la terza opzione, NON "owner" che è troppo, NON "see only free/busy" che è troppo poco)
8. **Send** (può apparire "Send notification" — disabilita se vuoi, il SA non legge email comunque)
9. Verifica: dovresti vedere l'email del SA elencata sotto "Shared with" con il permesso giusto

### 4.2 Lista da spuntare

Quando hai finito di condividere ogni calendario, segna ☑ qui:

- [ ] `fenapicaf2022@gmail.com` (Erika Borghese)
- [ ] `fenapitorino@gmail.com` (Giorgia Longhi)
- [ ] `iseefenapi1@gmail.com` (Glennys De Morla)
- [ ] `infofenapitorino@gmail.com` (Leonardo Ottaiano)
- [ ] `paghefenapi@gmail.com` (Eliane Do Carmo)
- [ ] `inapitorino1@gmail.com` (Michela Salerno)
- [ ] (eventuale Daniela Palillo, se ha calendar attivo da verificare)

---

## 5. Configura la cartella Google Drive (solo se serve upload documenti)

Le edge function `google-drive-upload` salva su Drive i documenti caricati dai clienti (es. carta d'identità per il 730). Serve una **cartella destinazione** condivisa col SA.

### 5.1 Crea una cartella Drive

1. Login su `https://drive.google.com` con un account a tua scelta (può essere quello del Circolo o uno personale del CAF — l'importante è che tu/il CAF ne abbia il controllo)
2. **+ New** → **Folder** → nome `caffenapi-documenti` (o simile)
3. Apri la cartella

### 5.2 Condividi la cartella col SA

1. Click destro sulla cartella → **Share** (o l'icona "share" in alto)
2. Nel campo "Add people and groups", incolla l'**email del SA**
3. Permission: **Editor** (non "Viewer", non "Commenter")
4. Disabilita "Notify people" se vuoi
5. **Send** / **Share**

### 5.3 Annota il Folder ID

L'ID della cartella Drive è la parte finale dell'URL quando sei dentro:

```
https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ_1234567
                                       ^-------- folder ID --------^
```

Salvalo. Va settato come ulteriore secret (sezione 7 sotto), oppure è hardcoded nel codice di `google-drive-upload` (verifica grep `DRIVE_FOLDER_ID` o simile nel sorgente).

---

## 6. Anatomia del file JSON scaricato

Il file ha questa struttura (i valori sono fittizi):

```json
{
  "type": "service_account",
  "project_id": "caffenapi-edge-functions-447821",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkq...\n-----END PRIVATE KEY-----\n",
  "client_email": "caffenapi-edge@caffenapi-edge-functions-447821.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/caffenapi-edge%40caffenapi-edge-functions-447821.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
```

I campi che il codice delle edge function legge sono solo 3:
- `client_email` — usato come `iss` del JWT
- `private_key` — usato per firmare il JWT in RS256
- `token_uri` — endpoint per scambiare il JWT con un access token

Gli altri campi sono ridondanti per il nostro uso ma vanno comunque mantenuti nel JSON così com'è.

---

## 7. Come settarlo come secret Supabase

Una volta che hai il JSON in mano e tutti i 7 calendari condivisi:

```bash
# 1. Spostati nella cartella caffenapi (linkata al project oswjgmavxbypnhhinypj)
cd ~/Desktop/Antigravity/fenapi/caffenapi

# 2. Verifica di essere linkato al project giusto
supabase status
# Dovrebbe mostrare: API URL: https://oswjgmavxbypnhhinypj.supabase.co

# 3. Set the secret (legge il file JSON e lo passa come stringa)
supabase secrets set GOOGLE_SERVICE_ACCOUNT_JSON="$(cat ~/path/al/file/scaricato.json)"

# 4. Setta anche FRIDAY_OPERATOR_ID (UUID di Michela)
supabase secrets set FRIDAY_OPERATOR_ID=187e9f13-ae3d-4471-b272-835126bec10a

# 5. (Opzionale, se hai messo l'ID cartella Drive in un secret)
supabase secrets set DRIVE_FOLDER_ID=1aBcDeFgHiJkLmNoPqRsTuVwXyZ_1234567

# 6. Verifica
supabase secrets list
```

⚠️ **Quoting**: il JSON contiene caratteri `\n` letterali nella `private_key` e doppi apici. Se passi il valore in linea di comando, **usa SEMPRE** il `$()` con `cat` come sopra. NON copia-incollare il contenuto JSON tra virgolette manuali — la shell mangerebbe i caratteri di escape.

---

## 8. Verifica end-to-end

Dopo aver settato i secrets, deploya (o ridepoyy) le edge function:

```bash
supabase functions deploy
```

Poi prova una chiamata di test all'edge `check-availability`:

```bash
curl -X POST "https://oswjgmavxbypnhhinypj.supabase.co/functions/v1/check-availability" \
  -H "apikey: <ANON_KEY_DEL_NUOVO_PROJECT>" \
  -H "Authorization: Bearer <ANON_KEY_DEL_NUOVO_PROJECT>" \
  -H "Content-Type: application/json" \
  -d '{"service":"730","date":"2026-04-15","operatorId":null}'
```

**Cosa ti aspetti**:
- HTTP 200
- Risposta `{"bookedSlots": [...]}` — dove `[...]` è la lista degli slot occupati per quel giorno
- Se nei log della function (Supabase Dashboard → Edge Functions → check-availability → Logs) vedi `FreeBusy API error: { error: { code: 403, ... } }` significa che il SA è stato chiamato ma **NON è stato autorizzato sui calendari** → torna alla sezione 4 e verifica che hai condiviso bene
- Se vedi `Token error: ...` significa che il JSON è malformato o la `private_key` ha problemi di escape → ri-set del secret con `$(cat ...)` come sopra

---

## 9. Sicurezza & rotazione

- **Le chiavi JSON dei SA non scadono mai per default** — restano valide finché non le elimini manualmente.
- Se sospetti che il file sia compromesso, vai su **Cloud Console → IAM → Service Accounts → caffenapi-edge → Keys** → elimina la vecchia chiave → crea una nuova → ri-set del secret. **Non serve ricondividere i calendari** perché la condivisione è legata all'email del SA (che non cambia), non alla chiave.
- **NON** condividere il JSON in chat pubbliche, repository pubblici, screenshot, ticket di supporto. Se per errore lo fai, ruota la chiave subito (procedura sopra).
- Per ulteriore paranoia: imposta su Cloud Console **"Constraint: disable service account key creation"** dopo aver creato la chiave, così nessuno (nemmeno tu loggato) può crearne altre senza disabilitarlo prima.

---

## 10. Cosa fare se NON vuoi/non puoi creare un SA

Se sei senza tempo o accesso, le edge function continueranno a funzionare in modo **degradato**:

| Funzione | Comportamento senza SA |
|---|---|
| `check-availability` | Salta il controllo freeBusy, ritorna solo gli slot occupati da DB. ⚠️ Non protegge da double-booking causato da eventi aggiunti manualmente al calendar dell'operatore. |
| `create-appointment` | Salta il check freeBusy + non crea l'evento sul Google Calendar dell'operatore. La prenotazione finisce solo in DB. L'operatore vedrà comunque l'appuntamento dalla dashboard admin, ma non sul suo Calendar. |
| `google-calendar` | Se chiamata, fallisce con errore 401/403 ma non blocca il flusso principale (è chiamata in fire-and-forget). |
| `google-drive-upload` | Upload documenti fallisce. I file caricati dai clienti vanno persi (non salvati né su Drive né altrove). ⚠️ Per il servizio Modello 730 questa è una regressione importante: la carta d'identità deve essere conservata per delega all'Agenzia delle Entrate. |
| `manage-appointment` | Le funzioni di reschedule/cancel funzionano in DB ma non sincronizzano col Calendar. |

In sintesi: **senza SA il sistema è utilizzabile ma con due rischi reali**: (1) double-booking se gli operatori usano anche il loro Calendar manuale, (2) perdita dei documenti caricati dai clienti per il 730. Decidi tu se accettarli come trade-off temporaneo.

---

## 11. Come darmi questo documento in una sessione futura

Quando riapri Claude Code in una nuova sessione, basta che tu mi dica una di queste due cose:

> "leggi `fenapi/docs/google-service-account-setup.md`"

oppure

> "@fenapi/docs/google-service-account-setup.md ho il JSON pronto in `~/Desktop/sa.json`"

Io leggo il file, capisco esattamente cosa abbiamo fatto / cosa serve fare, e posso guidarti dal punto in cui ti sei fermato senza richiederti di rispiegare nulla.
