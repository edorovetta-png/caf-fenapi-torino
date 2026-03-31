# CAAT REACTIVATION — FASE 6: Collegamento Arca Evolution

## Configurazione Claude Code

```bash
claude config set --global autoApprove "bash,write,edit"
```

---

## Prerequisiti

Fasi 1-5 completate. Il sistema funziona end-to-end con WhatsApp reale. I dati nel database sono ancora i seed data mock.

IMPORTANTE: Questa fase richiede l'accesso al database SQL Server di Arca Evolution. Prima di procedere, il titolare deve aver ottenuto dal consulente/rivenditore Arca:
- Credenziali di lettura (read-only) al database SQL Server
- Nome del server/istanza SQL
- Nome del database
- Mappa delle tabelle principali (clienti, documenti, righe documento, articoli)

---

## Contesto

In questa fase sostituiamo i seed data con dati reali estratti da Arca Evolution. Il principio è: cambiare SOLO la fonte dati nella Edge Function extract-dormant, senza toccare la logica di generazione offerte, approvazione o invio.

Arca Evolution usa Microsoft SQL Server. Le Edge Functions Supabase girano in Deno. La connessione dipende da dove si trova il server Arca.

---

## Istruzioni Operative

### Step 1: Verifica raggiungibilità del server Arca

**Scenario A: Server Arca raggiungibile via internet (o VPN)**
Se il server SQL è esposto su un IP pubblico o raggiungibile via VPN, puoi connetterti direttamente dalla Edge Function.

**Scenario B: Server Arca solo su rete locale**
Se il server è solo sulla LAN dell'azienda (molto probabile), serve un bridge. Opzioni:
- **Cloudflare Tunnel:** installa cloudflared su un PC nella rete locale, crea un tunnel che espone il SQL Server su un dominio sicuro.
- **Script bridge:** un piccolo server Node.js che gira su un PC in azienda, fa le query ad Arca e espone i risultati su un endpoint HTTPS.

Per lo Scenario B, crea il bridge prima di procedere.

### Step 2: Mappa le tabelle Arca

Lavora col consulente Arca per identificare le tabelle e i campi rilevanti. Tipicamente in Arca Evolution:

```
TABELLE PROBABILI (da verificare col consulente):
- AnagClienti (o CF) → anagrafica clienti
  - CodCli, RagSoc, Indirizzo, Cap, Citta, Tel, Cell, Email, PIva, CodFis
  
- TeDocVen (o simile) → testata documenti vendita (DDT, fatture)
  - NumDoc, DataDoc, CodCli, TotDoc, TipoDoc
  
- RiDocVen (o simile) → righe documenti vendita
  - NumDoc, DataDoc, CodArt, Quantita, Prezzo, Importo
  
- AnagArticoli (o AR) → anagrafica articoli
  - CodArt, Descrizione, Categoria, UnitaMisura, Prezzo, DataIns
  
- MovMag (o simile) → movimenti di magazzino
  - CodArt, DataMov, Quantita, Causale, Giacenza
```

NOTA: I nomi esatti delle tabelle e dei campi VARIANO da installazione a installazione. Il consulente Arca è l'unico che può darti la mappa corretta. Compila il file `docs/arca-tables.md` con la mappa reale.

### Step 3: Crea il modulo di connessione Arca

Crea `supabase/functions/_shared/arca.ts`:

```typescript
// Per Scenario A (connessione diretta):
// Usa la libreria 'mssql' per Node.js o un equivalente Deno
// Oppure usa un HTTP fetch verso il bridge (Scenario B)

interface ArcaConfig {
  server: string;
  database: string;
  user: string;
  password: string;
  port: number;
}

export async function queryArca(sql: string, params?: any[]): Promise<any[]> {
  const config: ArcaConfig = {
    server: Deno.env.get('ARCA_SQL_SERVER')!,
    database: Deno.env.get('ARCA_SQL_DATABASE')!,
    user: Deno.env.get('ARCA_SQL_USER')!,
    password: Deno.env.get('ARCA_SQL_PASSWORD')!,
    port: parseInt(Deno.env.get('ARCA_SQL_PORT') || '1433'),
  };
  
  // Implementa la connessione e la query
  // IMPORTANTE: connessioni SOLO in lettura, mai in scrittura
}
```

### Step 4: Crea la funzione di sincronizzazione

Crea `supabase/functions/sync-arca/index.ts`:

Questa funzione sincronizza i dati da Arca a Supabase. Viene eseguita PRIMA di extract-dormant.

```typescript
async function syncFromArca() {
  // 1. Sincronizza clienti
  const arcaClienti = await queryArca(`
    SELECT CodCli, RagSoc, Cell, Email, Indirizzo, ... 
    FROM [tabella_clienti_arca]
    WHERE [condizioni — es: solo clienti attivi, con numero cell]
  `);
  // Upsert in tabella clienti Supabase (match su arca_id = CodCli)
  
  // 2. Sincronizza prodotti
  const arcaProdotti = await queryArca(`
    SELECT CodArt, Descrizione, Categoria, Prezzo, UnitaMisura, DataIns
    FROM [tabella_articoli_arca]
    WHERE [condizioni]
  `);
  // Upsert in tabella prodotti (match su arca_articolo_id = CodArt)
  
  // 3. Sincronizza storico acquisti (ultimi 12 mesi)
  const arcaVendite = await queryArca(`
    SELECT r.CodArt, t.CodCli, t.DataDoc, r.Quantita, r.Prezzo, r.Importo, t.NumDoc
    FROM [righe_documenti] r
    JOIN [testata_documenti] t ON t.NumDoc = r.NumDoc
    WHERE t.DataDoc > DATEADD(month, -12, GETDATE())
      AND t.TipoDoc IN ('DDT', 'FAT') -- solo documenti di vendita
  `);
  // Upsert in storico_acquisti
  
  // 4. Rileva novità prodotti
  const nuoviProdotti = await queryArca(`
    SELECT CodArt, Descrizione, Categoria, DataIns
    FROM [tabella_articoli_arca]
    WHERE DataIns > DATEADD(day, -7, GETDATE())
  `);
  // Inserisci in novita_prodotti se non già presenti
  
  // 5. Rileva prodotti tornati disponibili (giacenza da 0 a >0)
  // Questa query dipende molto dalla struttura di Arca — chiedi al consulente
}
```

### Step 5: Aggiorna il cron

Aggiungi il cron per sync-arca PRIMA di extract-dormant:
- `sync-arca`: ogni giorno alle 00:00 (prima dell'estrazione)
- `extract-dormant`: resta alle 00:30 (dopo la sync)

### Step 6: Aggiungi env vars Arca

In Supabase → Edge Functions → Secrets:
```
ARCA_SQL_SERVER=...
ARCA_SQL_DATABASE=...
ARCA_SQL_USER=...
ARCA_SQL_PASSWORD=...
ARCA_SQL_PORT=1433
ARCA_BRIDGE_URL=...  (se usi Scenario B)
```

### Step 7: Prima sincronizzazione e validazione

1. Esegui sync-arca manualmente
2. Verifica nella dashboard Supabase che:
   - La tabella clienti contenga i clienti reali
   - I prodotti corrispondano al catalogo reale
   - Lo storico acquisti sia coerente
3. Esegui extract-dormant e verifica che i clienti dormienti reali vengano identificati correttamente
4. Mostra il risultato al titolare per validazione: "Questi sono i clienti che il sistema ha identificato come dormienti. Sono corretti?"

### Step 8: Pulizia

- Elimina i seed data (o meglio: la sync li sovrascrive)
- Verifica che consenso_whatsapp sia impostato correttamente per i clienti reali
- Aggiorna le regole commerciali se necessario in base ai dati reali

---

## CHECKPOINT FASE 6

Mandami screenshot di:

1. **Screenshot del file arca-tables.md compilato** → la mappa delle tabelle reali di Arca con i nomi esatti
2. **Screenshot dei log di sync-arca** → conferma che la sincronizzazione è andata a buon fine con conteggi
3. **Screenshot della tabella clienti** dopo la sync → devo vedere clienti reali (puoi oscurare dati sensibili)
4. **Screenshot della query clienti dormienti** con dati reali → conferma che i clienti giusti vengono identificati
5. **Conferma del titolare** → un suo OK che i clienti dormienti identificati sono corretti

A questo punto il sistema è COMPLETO e operativo.

---

## Env Vars aggiuntive

```
ARCA_SQL_SERVER=
ARCA_SQL_DATABASE=
ARCA_SQL_USER=
ARCA_SQL_PASSWORD=
ARCA_SQL_PORT=1433
ARCA_BRIDGE_URL=    (opzionale, per Scenario B)
```

---

## Struttura file creati in questa fase

```
caat-reactivation/
├── supabase/
│   └── functions/
│       ├── sync-arca/
│       │   └── index.ts
│       └── _shared/
│           └── arca.ts
├── docs/
│   └── arca-tables.md  (compilato col consulente)
```
