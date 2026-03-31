# CAAT REACTIVATION — FASE 2: Edge Functions Core

## Configurazione Claude Code

```bash
# Se non l'hai già fatto nella Fase 1:
claude config set --global autoApprove "bash,write,edit"
```

---

## Prerequisiti

La Fase 1 è completata: il database Supabase ha 10 tabelle popolate con seed data (30 clienti, 50 prodotti, 500+ righe storico acquisti, novità, regole commerciali, config sistema).

---

## Contesto

In questa fase costruiamo le Edge Functions Supabase che fanno il lavoro pesante: estrarre i clienti dormienti, generare le offerte con Claude API, comporre il messaggio per il titolare, e inviare (in mock) i messaggi ai clienti. Il documento di specifica completo è allegato (caat-reactivation-spec.docx) — riferisciti alle SEZIONI 3, 4 e 5.

IMPORTANTE: siamo in modalità MOCK. I messaggi WhatsApp NON vengono inviati davvero — vengono salvati nella tabella `conversazioni` con un campo note che indica "simulated". Quando collegheremo WhatsApp reale (Fase 5), cambieremo solo il layer di invio.

---

## Istruzioni Operative

### Step 1: Struttura shared utilities

Crea la cartella `supabase/functions/_shared/` con i moduli condivisi:

**supabase.ts** — Client Supabase inizializzato con le env vars:
```typescript
// Usa createClient da @supabase/supabase-js
// Leggi SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY da Deno.env
```

**claude.ts** — Wrapper per Claude API:
```typescript
// Funzione: generateOffer(systemPrompt: string, userPrompt: string): Promise<OfferJSON>
// Chiama https://api.anthropic.com/v1/messages
// Model: claude-sonnet-4-20250514
// Max tokens: 2000
// Parsa la risposta JSON dal content[0].text
// Gestisci errori con retry (1 tentativo)
// API key da ANTHROPIC_API_KEY env var
```

**whatsapp.ts** — Mock/Real WhatsApp sender:
```typescript
// Funzione: sendWhatsAppMessage(phone: string, message: string): Promise<{success: boolean, messageId: string}>
// Leggi MOCK_MODE da config_sistema o env var
// Se mock: salva in tabella conversazioni con interlocutore/direzione appropriati, restituisci messageId finto
// Se reale (futuro): chiama WhatsApp Cloud API
```

**whisper.ts** — Wrapper per OpenAI Whisper:
```typescript
// Funzione: transcribeAudio(audioBuffer: ArrayBuffer): Promise<string>
// Chiama https://api.openai.com/v1/audio/transcriptions
// Model: whisper-1
// Language: it
// API key da OPENAI_API_KEY env var
// Per ora può essere uno stub che ritorna "trascrizione mock" se MOCK_MODE=true
```

### Step 2: Edge Function `extract-dormant`

Questa è la funzione più importante. Viene triggerata dal cron alle 00:30.

**Logica:**

1. Query clienti dormienti:
```sql
SELECT c.id, c.nome, c.categoria, c.telefono,
  MAX(sa.data_acquisto) as ultimo_acquisto,
  CURRENT_DATE - MAX(sa.data_acquisto) as giorni_dormiente,
  ROUND(AVG(ordini.totale_ordine), 2) as media_ordine
FROM clienti c
JOIN storico_acquisti sa ON sa.cliente_id = c.id
LEFT JOIN blacklist b ON b.cliente_id = c.id
LEFT JOIN offerte_giornaliere og ON og.cliente_id = c.id 
  AND og.stato IN ('pending', 'sent') 
  AND og.data_generazione > CURRENT_DATE - 7
WHERE b.id IS NULL 
  AND og.id IS NULL
  AND c.consenso_whatsapp = true
GROUP BY c.id
HAVING CURRENT_DATE - MAX(sa.data_acquisto) > (
  SELECT valore::int FROM config_sistema WHERE chiave = 'giorni_dormienza_soglia'
)
ORDER BY giorni_dormiente DESC;
```
(Adatta la subquery per calcolare la media ordine aggregando per numero_documento)

2. Query novità della settimana:
```sql
SELECT p.id, p.nome, p.categoria, p.prezzo_listino, p.unita_misura, np.tipo
FROM novita_prodotti np
JOIN prodotti p ON p.id = np.prodotto_id
WHERE np.data_rilevamento > CURRENT_DATE - 7
  AND np.gia_proposto = false;
```

3. Per ogni cliente dormiente, recupera top 5 prodotti per frequenza:
```sql
SELECT p.id, p.nome, p.categoria, p.prezzo_listino,
  COUNT(*) as n_acquisti,
  ROUND(AVG(sa.prezzo_unitario), 2) as prezzo_medio,
  MAX(sa.data_acquisto) as ultimo_acquisto
FROM storico_acquisti sa
JOIN prodotti p ON p.id = sa.prodotto_id
WHERE sa.cliente_id = $1
  AND sa.data_acquisto > CURRENT_DATE - 365
GROUP BY p.id, p.nome, p.categoria, p.prezzo_listino
ORDER BY n_acquisti DESC
LIMIT 5;
```

4. Recupera regole commerciali attive:
```sql
SELECT nome_regola, descrizione, condizione, azione 
FROM regole_commerciali WHERE attiva = true ORDER BY priorita;
```

5. Per ogni cliente dormiente, componi il prompt Claude (vedi sezione 4 della specifica) e chiama `generateOffer()`. Il system prompt include le regole commerciali. Il user prompt include dati cliente + storico + novità.

6. Salva il risultato in `offerte_giornaliere`:
```typescript
{
  cliente_id: cliente.id,
  data_generazione: new Date().toISOString().split('T')[0],
  giorni_dormiente: cliente.giorni_dormiente,
  offerta_claude: claudeResponse, // il JSON completo
  messaggio_cliente: claudeResponse.messaggio_cliente,
  stato: 'pending'
}
```

7. Logga il risultato: quanti clienti processati, quante offerte generate, eventuali errori.

### Step 3: Edge Function `notify-owner`

Triggerata dal cron alle 02:00.

**Logica:**

1. Query offerte pending di oggi:
```sql
SELECT og.id, og.giorni_dormiente, og.offerta_claude, c.nome, c.categoria
FROM offerte_giornaliere og
JOIN clienti c ON c.id = og.cliente_id
WHERE og.data_generazione = CURRENT_DATE AND og.stato = 'pending'
ORDER BY og.giorni_dormiente DESC;
```

2. Componi il messaggio riepilogativo (formato dalla sezione 3.3 della specifica):
```
🔄 Clienti da riattivare oggi: {N}

1. {nome} ({gg}gg) — {riassunto offerta breve}
2. {nome} ({gg}gg) — {riassunto offerta breve}
...

Rispondi:
OK → invia tutti
2,5 → escludi quei numeri
VEDI 3 → dettaglio cliente 3
RIMANDA 4 → rimanda 2 settimane
STOP 6 → blacklist permanente
```

Il riassunto offerta breve è: nomi prodotti in sconto + eventuale "NOVITÀ" se ci sono novità suggerite.

3. Invia il messaggio via `sendWhatsAppMessage()` al numero del titolare (da config_sistema).

4. Aggiorna owner_session: stato = 'reviewing', data_sessione = oggi.

### Step 4: Edge Function `send-approved`

Triggerata dopo la conferma del titolare (chiamata da owner-interaction nella Fase 3, ma la creiamo ora).

**Logica:**

1. Query offerte approvate di oggi:
```sql
SELECT og.*, c.nome, c.telefono
FROM offerte_giornaliere og
JOIN clienti c ON c.id = og.cliente_id
WHERE og.data_generazione = CURRENT_DATE 
  AND og.stato IN ('approved', 'modified');
```

2. Per ogni offerta, determina il messaggio da inviare:
   - Se `offerta_finale` è NULL → usa `messaggio_cliente` originale di Claude
   - Se `offerta_finale` esiste → usa il messaggio dalla versione modificata

3. Invia TUTTI i messaggi in parallelo con `Promise.all()`:
```typescript
const results = await Promise.all(
  approvedOffers.map(offer => 
    sendWhatsAppMessage(offer.telefono, offer.messaggio_finale)
  )
);
```

4. Aggiorna ogni offerta: stato = 'sent'.

5. Manda riepilogo al titolare: "✅ Inviati {N} messaggi su {totale}. {rimandati} rimandati, {esclusi} esclusi."

### Step 5: Edge Function `transcribe-audio` (stub)

Per ora uno stub funzionante che:
- Se MOCK_MODE = true, ritorna un testo fisso: "Questo è un messaggio vocale di test trascritto"
- Se MOCK_MODE = false, chiama Whisper API reale
- Accetta un audio buffer o un URL da cui scaricare l'audio

### Step 6: Configura i Cron Jobs

Configura i cron trigger in Supabase per:
- `extract-dormant`: ogni giorno alle 00:30 UTC (01:30 ora italiana invernale, 02:30 estiva — adatteremo)
- `notify-owner`: ogni giorno alle 01:00 UTC (02:00 ora italiana)

### Step 7: Test manuale

Esegui manualmente la funzione `extract-dormant` e verifica che:
- Vengano identificati i clienti dormienti corretti (quelli del seed con >60gg)
- Claude API venga chiamato e restituisca JSON valido
- Le offerte vengano salvate in offerte_giornaliere

Poi esegui `notify-owner` e verifica che:
- Il messaggio riepilogativo venga composto correttamente
- Venga salvato nella tabella conversazioni (in mock mode)

---

## Variabili d'Ambiente da Configurare

Aggiungi queste variabili in Supabase Dashboard → Settings → Edge Functions → Secrets:

```
ANTHROPIC_API_KEY=sk-ant-...      (la tua chiave Claude API)
OPENAI_API_KEY=sk-...              (la tua chiave OpenAI — serve per Whisper)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## CHECKPOINT FASE 2

Quando hai completato, mandami screenshot di:

1. **Screenshot della lista Edge Functions** nella dashboard Supabase → mostra che extract-dormant, notify-owner, send-approved, transcribe-audio esistono
2. **Screenshot dei log di extract-dormant** dopo un'esecuzione manuale → devo vedere quanti clienti processati e conferma che Claude ha risposto
3. **Screenshot della tabella offerte_giornaliere** dopo l'esecuzione → devo vedere le righe create con stato "pending" e il JSON in offerta_claude
4. **Screenshot della tabella conversazioni** dopo l'esecuzione di notify-owner → devo vedere il messaggio riepilogativo salvato
5. **Screenshot di UNA offerta_claude JSON completa** → apri una riga di offerte_giornaliere e mostrami il contenuto del campo jsonb — devo verificare che Claude stia generando offerte sensate con prodotti, sconti, novità e reasoning

---

## Struttura file creati in questa fase

```
caat-reactivation/
├── supabase/
│   └── functions/
│       ├── _shared/
│       │   ├── supabase.ts
│       │   ├── claude.ts
│       │   ├── whatsapp.ts
│       │   └── whisper.ts
│       ├── extract-dormant/
│       │   └── index.ts
│       ├── notify-owner/
│       │   └── index.ts
│       ├── send-approved/
│       │   └── index.ts
│       └── transcribe-audio/
│           └── index.ts
```
