# CAAT REACTIVATION — FASE 3: Logica Conversazionale

## Configurazione Claude Code

```bash
claude config set --global autoApprove "bash,write,edit"
```

---

## Prerequisiti

Fase 1 completata: database con 10 tabelle + seed data.
Fase 2 completata: Edge Functions extract-dormant, notify-owner, send-approved, transcribe-audio funzionanti. Le offerte vengono generate da Claude e salvate in offerte_giornaliere.

---

## Contesto

In questa fase costruiamo il cervello conversazionale: il webhook che riceve i messaggi WhatsApp (simulati), li smista tra titolare e clienti, e gestisce l'intera logica di interazione. Riferisciti alle SEZIONI 3.4, 3.5, 3.6, 3.7 e 5 della specifica.

---

## Istruzioni Operative

### Step 1: Edge Function `whatsapp-webhook`

Questa è il punto di ingresso unico per tutti i messaggi WhatsApp in entrata. In produzione sarà chiamata dal webhook Meta; per ora la chiamiamo dal simulatore (Fase 4) o manualmente.

**Endpoint:** POST `/functions/v1/whatsapp-webhook`

**Logica:**

```typescript
// 1. Parsa il payload (formato WhatsApp Cloud API)
const message = parseWhatsAppPayload(req);
// message = { from: string, type: "text"|"audio"|"image", text?: string, audioUrl?: string }

// 2. Determina chi è il mittente
const ownerPhone = await getConfig('telefono_titolare');

// 3. Smista
if (message.from === ownerPhone) {
  return await ownerInteraction(message);
} else {
  return await clientInteraction(message);
}
```

**Validazione webhook Meta (per il futuro):**
Aggiungi anche la gestione del GET per la verifica webhook di Meta (challenge response). Per ora basta che non rompa nulla.

### Step 2: Edge Function `owner-interaction`

Gestisce TUTTI i comandi del titolare. È la funzione più complessa.

**Logica principale:**

```typescript
async function ownerInteraction(message) {
  // 1. Se il messaggio è un audio, trascrivilo prima
  let text = message.text;
  if (message.type === 'audio') {
    text = await transcribeAudio(message.audioUrl);
    // Salva la trascrizione in conversazioni
  }
  
  // 2. Recupera lo stato della sessione
  const session = await getOwnerSession();
  
  // 3. Logga il messaggio ricevuto in conversazioni
  await logConversation({
    interlocutore: 'titolare',
    direzione: 'in',
    tipo_messaggio: message.type,
    contenuto: text,
    trascrizione: message.type === 'audio' ? text : null,
  });
  
  // 4. Parsa il comando e gestisci in base allo stato
  if (session.stato === 'modifying') {
    return await handleModifyInput(text, session);
  }
  
  return await parseAndExecuteCommand(text, session);
}
```

**Parsing comandi (funzione parseAndExecuteCommand):**

```typescript
// Comando OK → approva tutti e triggera invio
if (/^(OK|INVIA|MANDA|VAI)$/i.test(text.trim())) {
  return await approveAllAndSend();
}

// Comando VEDI [n] → mostra dettaglio
const vediMatch = text.match(/^VEDI\s+(\d+)/i);
if (vediMatch) {
  return await showDetail(parseInt(vediMatch[1]));
}

// Comando MOD [n] → avvia modifica
const modMatch = text.match(/^MOD\s+(\d+)/i);
if (modMatch) {
  return await startModify(parseInt(modMatch[1]));
}

// Comando RIMANDA [n] [gg opzionale] → rimanda
const rimandaMatch = text.match(/^RIMANDA\s+(\d+)(?:\s+(\d+)\s*gg)?/i);
if (rimandaMatch) {
  const days = rimandaMatch[2] ? parseInt(rimandaMatch[2]) : 14;
  return await postpone(parseInt(rimandaMatch[1]), days);
}

// Comando STOP [n] → blacklist
const stopMatch = text.match(/^STOP\s+(\d+)/i);
if (stopMatch) {
  return await blacklistClient(parseInt(stopMatch[1]));
}

// Numeri separati da virgola → escludi quelli, approva il resto
if (/^[\d,\s]+$/.test(text.trim())) {
  const nums = text.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
  return await excludeAndApproveRest(nums);
}

// Comando SI/SÌ → conferma modifica in corso
if (/^(SI|SÌ|S[IÌ]|CONFERMA)$/i.test(text.trim()) && session.stato === 'viewing_detail') {
  // Approva il singolo che stava vedendo
}

// Se nessun comando riconosciuto E siamo in modalità reviewing:
// Passa il testo a Claude per interpretare l'intento (gestisce i vocali tipo
// "manda tutti tranne il tre che lo chiamo io")
return await claudeInterpretIntent(text, session);
```

**Implementa TUTTE queste funzioni:**

**approveAllAndSend():**
- Aggiorna tutte le offerte con stato 'pending' di oggi → 'approved'
- Chiama la Edge Function send-approved
- Aggiorna owner_session → 'idle'
- Invia conferma al titolare: "✅ Approvati e inviati {N} messaggi."

**showDetail(n):**
- La `n` è la posizione nella lista del riepilogo (1-based)
- Recupera l'offerta corrispondente dalla tabella offerte_giornaliere di oggi
- Componi il messaggio dettagliato (formato dalla sezione 3.4 della specifica):
```
📋 {nome cliente}
Ultimo acquisto: {data} ({gg} giorni fa)
Media ordine: €{media} | Frequenza: {freq}
Top prodotti: {lista}

💡 Offerta proposta:
{prodotto1}: €{listino} → €{offerta} (-{sconto}%)
{prodotto2}: €{prezzo} (NUOVO — {motivo})
{condizione extra}

🧠 Reasoning: {reasoning di Claude}

Rispondi: MOD {n} per modificare | OK per approvare tutti
```
- Aggiorna owner_session → 'viewing_detail'

**startModify(n):**
- Aggiorna owner_session → 'modifying', offerta_in_modifica = offerta_id
- Invia al titolare: "✏️ Scrivi la nuova offerta per {nome cliente}, oppure manda un vocale. Rispondi ANNULLA per tornare alla lista."

**handleModifyInput(text, session):**
- Recupera l'offerta corrente da session.offerta_in_modifica
- Invia il testo del titolare + offerta corrente a Claude con prompt:
```
Il titolare vuole modificare questa offerta per il cliente {nome}.
Offerta attuale: {JSON offerta corrente}
Istruzione del titolare: "{testo del titolare}"
Riformula l'offerta rispettando le istruzioni del titolare.
Rispondi in JSON con lo stesso schema dell'offerta originale.
```
- Salva la nuova offerta in offerta_finale
- Invia preview al titolare:
```
✅ Offerta aggiornata per {nome}:
{dettaglio offerta riformulata}

Confermi? Rispondi SÌ o modifica ancora.
```
- Se il titolare risponde SÌ: aggiorna stato → 'modified', torna a 'reviewing'
- Se il titolare scrive altro testo: ri-chiama Claude con la nuova istruzione

**postpone(n, days):**
- Aggiorna offerta: stato = 'postponed', data_rimando = oggi + days
- Invia conferma: "⏸️ {nome} rimandato di {days} giorni (riproposto il {data})."

**blacklistClient(n):**
- Chiedi prima conferma: "⚠️ Vuoi escludere permanentemente {nome}? Rispondi CONFERMO per procedere."
- Se confermato: inserisci in blacklist, aggiorna offerta stato = 'excluded'
- Invia conferma: "🚫 {nome} escluso permanentemente."

**excludeAndApproveRest(nums):**
- Per ogni numero nella lista: aggiorna offerta → 'postponed' (rimanda di default)
- Tutte le altre offerte pending → 'approved'
- Triggera send-approved
- Invia conferma: "✅ Esclusi {lista nomi}. Inviati {N} messaggi agli altri."

**claudeInterpretIntent(text, session):**
- Se il messaggio non matcha nessun comando ma siamo in reviewing, passa a Claude:
```
Il titolare sta revisionando le offerte del giorno. Ha scritto: "{text}"
Le offerte di oggi sono: {lista numerata}
Interpreta cosa vuole fare e rispondi in JSON:
{action: "approve_all"|"exclude"|"postpone"|"detail"|"unknown", targets: [numeri], days?: number}
```
- Esegui l'azione interpretata da Claude

### Step 3: Edge Function `client-interaction`

Gestisce le risposte dei clienti alle offerte.

**Logica:**

```typescript
async function clientInteraction(message) {
  // 1. Identifica il cliente dal numero di telefono
  const client = await findClientByPhone(message.from);
  if (!client) return; // Numero sconosciuto, ignora

  // 2. Se audio, trascrivi
  let text = message.text;
  if (message.type === 'audio') {
    text = await transcribeAudio(message.audioUrl);
  }

  // 3. Logga in conversazioni
  await logConversation({
    cliente_id: client.id,
    interlocutore: 'cliente',
    direzione: 'in',
    tipo_messaggio: message.type,
    contenuto: text,
    trascrizione: message.type === 'audio' ? text : null,
  });

  // 4. Recupera l'offerta attiva per questo cliente
  const offer = await getActiveOffer(client.id);

  // 5. Check STOP
  if (/^STOP$/i.test(text.trim())) {
    await addToBlacklist(client.id, 'Richiesto dal cliente');
    await sendWhatsAppMessage(client.telefono, 
      "Non riceverai più messaggi. Se cambi idea, contattaci direttamente.");
    return;
  }

  // 6. Chiama Claude per generare risposta contestuale
  const reply = await generateClientReply(client, offer, text);

  // 7. Verifica se serve escalation
  if (reply.escalate) {
    await notifyOwner(
      `⚡ ${client.nome} ha risposto e serve il tuo intervento:\n"${text}"\n\nMotivo: ${reply.escalationReason}`
    );
    await sendWhatsAppMessage(client.telefono, reply.message);
  } else {
    await sendWhatsAppMessage(client.telefono, reply.message);
  }
}
```

### Step 4: Edge Function `ai-reply`

Wrapper per la generazione di risposte ai clienti.

**System prompt per risposte ai clienti:**
```
Sei l'assistente commerciale di un'azienda alimentare al CAAT di Torino.
Stai gestendo una conversazione WhatsApp con un cliente a cui è stata inviata un'offerta.

REGOLE:
- Rispondi in modo amichevole e professionale, come un collega del CAAT
- Se il cliente è interessato, conferma i dettagli dell'offerta e proponi di finalizzare l'ordine
- Se chiede info su prodotti non nell'offerta, rispondi se puoi, altrimenti escala
- Se il cliente ha un reclamo o problema, ESCALA SEMPRE al titolare
- Se non sei sicuro di come rispondere, ESCALA
- Risposte brevi (max 150 parole) — siamo su WhatsApp, non email
- Non fare mai promesse su prezzi o condizioni non nell'offerta originale

RISPONDI IN JSON:
{
  "message": "testo della risposta al cliente",
  "escalate": true/false,
  "escalationReason": "motivo se escalate=true"
}
```

**User prompt:**
```
CLIENTE: {nome} ({categoria})
OFFERTA INVIATA: {JSON offerta}
STORICO CONVERSAZIONE: {ultimi 5 messaggi}
ULTIMO MESSAGGIO DEL CLIENTE: "{text}"

Genera la risposta.
```

### Step 5: Test end-to-end manuale

Testa l'intero flusso chiamando le Edge Functions manualmente:

1. Esegui extract-dormant → verifica offerte generate
2. Esegui notify-owner → verifica messaggio riepilogativo in conversazioni
3. Chiama whatsapp-webhook simulando il titolare che manda "VEDI 1" → verifica risposta dettaglio
4. Chiama whatsapp-webhook simulando "OK" → verifica che send-approved venga chiamata e le offerte passino a "sent"
5. Chiama whatsapp-webhook simulando un cliente che risponde "Sì mi interessa" → verifica risposta Claude

---

## CHECKPOINT FASE 3

Mandami screenshot di:

1. **Screenshot dei log di whatsapp-webhook** → dopo aver simulato un messaggio del titolare "VEDI 1", mostra i log che confermano il routing verso owner-interaction
2. **Screenshot della tabella conversazioni** → dopo il test completo, devo vedere una sequenza di messaggi: riepilogo → VEDI 1 → dettaglio → OK → conferma invio
3. **Screenshot della tabella offerte_giornaliere** → devo vedere offerte con stati diversi: alcune "sent", eventualmente qualcuna "postponed"
4. **Screenshot di un messaggio dettaglio cliente** → il contenuto del messaggio inviato al titolare quando chiede VEDI, con storico acquisti, offerta e reasoning
5. **Screenshot di una risposta Claude a un cliente** → il contenuto della risposta generata quando un cliente risponde "mi interessa"

---

## Struttura file creati in questa fase

```
caat-reactivation/
├── supabase/
│   └── functions/
│       ├── whatsapp-webhook/
│       │   └── index.ts
│       ├── owner-interaction/
│       │   └── index.ts
│       ├── client-interaction/
│       │   └── index.ts
│       └── ai-reply/
│           └── index.ts
```
