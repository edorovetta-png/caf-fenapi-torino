# CAAT REACTIVATION — FASE 4: Web App Admin + Simulatore WhatsApp

## Configurazione Claude Code

```bash
claude config set --global autoApprove "bash,write,edit"
```

---

## Prerequisiti

Fase 1-3 completate: database popolato, Edge Functions funzionanti (extract-dormant, notify-owner, send-approved, whatsapp-webhook, owner-interaction, client-interaction, ai-reply, transcribe-audio).

---

## Contesto

In questa fase costruiamo la web app Next.js su Vercel. Ha DUE scopi: pannello admin per configurazione e analytics (uso settimanale), e simulatore WhatsApp per testare l'intero flusso senza collegare WhatsApp reale (uso durante lo sviluppo). Riferisciti alle SEZIONI 7 e 8 della specifica.

---

## Istruzioni Operative

### Step 1: Setup progetto Next.js

Crea il progetto nella cartella `apps/admin/`:

```bash
npx create-next-app@latest apps/admin --typescript --tailwind --app --src-dir
```

Installa dipendenze:
```bash
cd apps/admin
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

Configura le variabili d'ambiente in `apps/admin/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Step 2: Autenticazione

Setup Supabase Auth con magic link:
- Crea un componente `LoginPage` con input email + bottone "Accedi"
- Al click, chiama `supabase.auth.signInWithOtp({ email })`
- Middleware Next.js che protegge tutte le rotte tranne `/login`
- Per ora, qualsiasi email funziona (limiteremo in produzione)

### Step 3: Layout e Navigazione

Crea un layout con sidebar di navigazione. Stile: pulito, professionale, colori scuri (slate/gray). Pagine:

- Dashboard (/)
- Clienti (/clienti)
- Regole Commerciali (/regole)
- Conversazioni (/conversazioni)
- Simulatore (/simulatore) ← LA PIÙ IMPORTANTE
- Impostazioni (/impostazioni)

### Step 4: Pagina Dashboard

KPI principali con query a Supabase:

**Card 1:** Clienti dormienti oggi — count di clienti con ultimo acquisto >60gg
**Card 2:** Offerte inviate questa settimana — count offerte con stato='sent' negli ultimi 7gg
**Card 3:** Tasso di risposta — % di offerte sent che hanno almeno una conversazione in risposta
**Card 4:** Clienti riattivati questo mese — count di clienti che hanno ricevuto offerta E poi fatto un nuovo acquisto (per ora sarà 0, è predisposto)

**Tabella recente:** ultime 10 offerte generate con nome cliente, stato, data.

### Step 5: Pagina Regole Commerciali

CRUD completo sulla tabella `regole_commerciali`:

- Lista di tutte le regole con toggle attiva/disattiva
- Bottone "Aggiungi regola" che apre un form
- Form con: nome_regola (text), descrizione (textarea), condizione (JSON editor o campi strutturati), azione (JSON editor o campi strutturati), priorità (numero)
- Click su una regola per modificarla
- Bottone elimina con conferma

### Step 6: Pagina Conversazioni

Storico completo dalla tabella `conversazioni`:

- Lista conversazioni raggruppate per cliente (o titolare)
- Filtri: per cliente, per data, per tipo (titolare/cliente)
- Ogni conversazione mostra i messaggi in stile chat (bolle a sinistra per messaggi in entrata, a destra per messaggi in uscita)
- Per i messaggi audio, mostra sia il badge "🎤 Audio" che la trascrizione
- Collegamento all'offerta di riferimento se presente

### Step 7: Pagina Simulatore (PRIORITÀ ALTA)

Questa è la pagina più importante di questa fase. È il modo in cui testeremo tutto il sistema senza WhatsApp reale.

**Layout:** Due pannelli affiancati, stile WhatsApp.

**Pannello sinistro: Simulatore Titolare**
- Interfaccia chat che mostra i messaggi tra il sistema e il "titolare"
- Input di testo in basso per digitare comandi (OK, VEDI 1, MOD 3, RIMANDA 2, STOP 5, numeri, testo libero)
- Bottone "🎤" per simulare un vocale (upload file audio o campo testo che viene trattato come se fosse stato trascritto da un vocale)
- Bottone "▶️ Trigger Riepilogo" che chiama manualmente notify-owner per generare il messaggio riepilogativo
- Bottone "▶️ Trigger Estrazione" che chiama manualmente extract-dormant

**Come funziona tecnicamente:**
Quando l'utente scrive un messaggio nel simulatore, il frontend chiama la Edge Function `whatsapp-webhook` con un payload che simula un messaggio WhatsApp dal numero del titolare:
```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/whatsapp-webhook`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  body: JSON.stringify({
    simulated: true,
    from: ownerPhone,
    type: 'text',
    text: userInput,
  })
});
```
La risposta del sistema (salvata in conversazioni) viene mostrata nella chat.

**Pannello destro: Simulatore Cliente**
- Dropdown per selezionare quale cliente simulare (lista clienti dal DB)
- Chat che mostra la conversazione tra sistema e quel cliente
- Input testo per scrivere risposte come se fossi il cliente
- Bottone upload audio per testare trascrizione Whisper
- Mostra l'offerta che è stata inviata a quel cliente (se esiste)

**Come funziona:** Stessa logica del pannello titolare, ma il payload simula il numero del cliente selezionato.

**Polling messaggi:** La chat deve aggiornarsi in tempo reale. Usa Supabase Realtime subscription sulla tabella conversazioni filtrata per interlocutore e cliente:
```typescript
supabase
  .channel('conversations')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'conversazioni',
    filter: `interlocutore=eq.titolare`
  }, (payload) => {
    // Aggiungi il nuovo messaggio alla chat
  })
  .subscribe();
```

### Step 8: Pagina Impostazioni

Form per modificare i valori in `config_sistema`:
- Ora estrazione (00:30)
- Ora notifica (02:00)
- Timeout approvazione (04:00)
- Numero titolare
- Soglia dormienza (giorni)
- Giorni rimando default
- Mock mode (toggle)

Ogni modifica fa un UPDATE sulla tabella config_sistema.

### Step 9: Pagina Clienti

Lista clienti con:
- Nome, categoria, ultimo acquisto, giorni dormiente, stato (attivo/dormiente/blacklist)
- Click su un cliente → dettaglio con storico acquisti, storico offerte, conversazioni
- Possibilità di aggiungere/rimuovere dalla blacklist
- Campo note_titolare editabile

### Step 10: Deploy su Vercel

Connetti il repo GitHub a Vercel e deploya. Configura le env vars su Vercel.

---

## CHECKPOINT FASE 4

Mandami screenshot di:

1. **Screenshot della pagina Dashboard** → devo vedere le 4 card KPI e la tabella offerte recenti
2. **Screenshot del Simulatore Titolare** → dopo aver cliccato "Trigger Estrazione" e poi "Trigger Riepilogo", devo vedere il messaggio riepilogativo nella chat
3. **Screenshot del Simulatore Titolare dopo "VEDI 1"** → devo vedere la scheda dettagliata del primo cliente
4. **Screenshot del Simulatore Titolare dopo "OK"** → devo vedere la conferma di invio
5. **Screenshot del Simulatore Cliente** → dopo aver selezionato un cliente e scritto "mi interessa", devo vedere la risposta di Claude
6. **Screenshot della pagina Regole Commerciali** → devo vedere le 6 regole seed con toggle attiva/disattiva
7. **URL del deploy Vercel** → l'URL dove posso accedere alla web app

Questo è il checkpoint più importante: se il simulatore funziona end-to-end, il sistema è pronto per collegare WhatsApp reale (Fase 5).

---

## Struttura file creati in questa fase

```
caat-reactivation/
├── apps/
│   └── admin/
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx          # Layout con sidebar
│       │   │   ├── page.tsx            # Dashboard
│       │   │   ├── login/page.tsx      # Login
│       │   │   ├── clienti/page.tsx
│       │   │   ├── regole/page.tsx
│       │   │   ├── conversazioni/page.tsx
│       │   │   ├── simulatore/page.tsx # ← PRIORITÀ
│       │   │   └── impostazioni/page.tsx
│       │   ├── components/
│       │   │   ├── Sidebar.tsx
│       │   │   ├── ChatSimulator.tsx   # Componente chat riusabile
│       │   │   ├── KpiCard.tsx
│       │   │   └── ...
│       │   └── lib/
│       │       └── supabase.ts
│       ├── package.json
│       ├── next.config.js
│       ├── tailwind.config.ts
│       └── .env.local
```
