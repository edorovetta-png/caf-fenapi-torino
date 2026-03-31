# CAAT REACTIVATION — FASE 5: Collegamento WhatsApp Reale

## Configurazione Claude Code

```bash
claude config set --global autoApprove "bash,write,edit"
```

---

## Prerequisiti

Fasi 1-4 completate. Il simulatore funziona end-to-end: estrazione → generazione offerte → riepilogo titolare → comandi titolare → invio ai clienti → risposte clienti → escalation.

IMPORTANTE: Non procedere con questa fase finché il simulatore non funziona perfettamente. Ogni bug trovato qui costa molto di più che nel simulatore.

---

## Contesto

In questa fase sostituiamo il mock layer di WhatsApp con le chiamate reali alla WhatsApp Cloud API di Meta. Il principio è: cambiare SOLO il file `_shared/whatsapp.ts` e la configurazione webhook, senza toccare la logica.

---

## Istruzioni Operative

### Step 1: Setup Meta Business

Queste operazioni vanno fatte manualmente dal browser (non da Antigravity):

1. Vai su https://business.facebook.com/ e crea un Meta Business Portfolio (se non esiste)
2. Vai su https://developers.facebook.com/ e crea una nuova App di tipo "Business"
3. Aggiungi il prodotto "WhatsApp" all'app
4. Nella sezione WhatsApp → Getting Started:
   - Annota il Phone Number ID
   - Annota il WhatsApp Business Account ID
   - Genera un token di accesso permanente (System User token, non il temporaneo)
5. Registra il numero di telefono business (deve essere un numero che NON è già registrato su WhatsApp normale)

SALVA questi valori — serviranno come env vars.

### Step 2: Configura Webhook

Nella dashboard Meta Developers → WhatsApp → Configuration:

- Callback URL: `https://{TUO_PROGETTO}.supabase.co/functions/v1/whatsapp-webhook`
- Verify Token: scegli una stringa segreta (es: `caat-verify-2026`) e salvala come env var `WA_VERIFY_TOKEN`
- Sottoscrivi ai campi: `messages`

### Step 3: Crea i Template di Messaggio

Nella WhatsApp Manager (business.facebook.com → WhatsApp → Message Templates), crea questi template:

**Template 1: `riattivazione_cliente`**
- Categoria: Marketing
- Lingua: Italiano
- Header: nessuno
- Body: `Ciao {{1}}, è un po' che non ci vediamo al CAAT! {{2}} Rispondi SÌ per saperne di più o STOP per non ricevere più messaggi.`
- Variabili: {{1}} = nome cliente, {{2}} = testo offerta
- Footer: opzionale, es: "CAAT Alimentari Torino"
- Bottoni: Quick Reply "Sì, dimmi di più" + Quick Reply "STOP"

**Template 2: `notifica_titolare`**
- Categoria: Utility
- Lingua: Italiano
- Body: `{{1}}`
- Variabile: {{1}} = contenuto del riepilogo completo

Attendi l'approvazione dei template da parte di Meta (solitamente 1-24 ore).

### Step 4: Aggiorna le Env Vars

Aggiungi in Supabase → Edge Functions → Secrets:
```
WA_PHONE_NUMBER_ID=...
WA_ACCESS_TOKEN=...
WA_VERIFY_TOKEN=caat-verify-2026
WA_BUSINESS_ACCOUNT_ID=...
```

### Step 5: Aggiorna `_shared/whatsapp.ts`

Modifica il file per supportare la modalità reale:

```typescript
export async function sendWhatsAppMessage(phone: string, message: string, templateName?: string, templateParams?: string[]) {
  const mockMode = await getConfig('mock_mode');
  
  if (mockMode === 'true') {
    // Salva in DB come prima (mock)
    return await mockSend(phone, message);
  }
  
  // Modalità reale
  const phoneNumberId = Deno.env.get('WA_PHONE_NUMBER_ID');
  const accessToken = Deno.env.get('WA_ACCESS_TOKEN');
  
  let body;
  if (templateName) {
    // Messaggio proattivo (fuori finestra 24h) → usa template
    body = {
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: templateName,
        language: { code: "it" },
        components: [{
          type: "body",
          parameters: templateParams.map(p => ({ type: "text", text: p }))
        }]
      }
    };
  } else {
    // Risposta entro 24h → messaggio libero
    body = {
      messaging_product: "whatsapp",
      to: phone,
      type: "text",
      text: { body: message }
    };
  }
  
  const response = await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );
  
  const data = await response.json();
  
  // Logga in conversazioni
  await logConversation({
    interlocutore: isOwnerPhone(phone) ? 'titolare' : 'cliente',
    direzione: 'out',
    tipo_messaggio: 'testo',
    contenuto: message,
    wa_message_id: data.messages?.[0]?.id,
  });
  
  return { success: response.ok, messageId: data.messages?.[0]?.id };
}
```

### Step 6: Aggiorna whatsapp-webhook per payload reale Meta

Il webhook Meta manda payload in formato specifico. Aggiorna il parsing:

```typescript
function parseWhatsAppPayload(req) {
  const body = req.body;
  
  // Verifica webhook (GET) per setup iniziale
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === Deno.env.get('WA_VERIFY_TOKEN')) {
      return new Response(challenge, { status: 200 });
    }
    return new Response('Forbidden', { status: 403 });
  }
  
  // Messaggio reale (POST)
  const entry = body.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;
  const message = value?.messages?.[0];
  
  if (!message) return null; // Status update, non un messaggio
  
  return {
    from: message.from,
    type: message.type, // text, audio, image, etc.
    text: message.text?.body,
    audioId: message.audio?.id, // Per scaricare l'audio
    timestamp: message.timestamp,
  };
}
```

### Step 7: Aggiorna transcribe-audio per audio reale

```typescript
// Scarica l'audio da WhatsApp Media API
async function downloadWhatsAppAudio(mediaId: string): Promise<ArrayBuffer> {
  const accessToken = Deno.env.get('WA_ACCESS_TOKEN');
  
  // 1. Ottieni l'URL del file
  const mediaResponse = await fetch(
    `https://graph.facebook.com/v21.0/${mediaId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const { url } = await mediaResponse.json();
  
  // 2. Scarica il file
  const audioResponse = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return await audioResponse.arrayBuffer();
}
```

### Step 8: Aggiorna config_sistema

```sql
UPDATE config_sistema SET valore = 'false' WHERE chiave = 'mock_mode';
```

### Step 9: Test con Titolare

1. Imposta mock_mode = false
2. Esegui manualmente extract-dormant (se non ci sono offerte pending)
3. Esegui notify-owner → il titolare deve ricevere il messaggio WA REALE
4. Il titolare testa i comandi: VEDI 1, MOD 2, OK
5. Verifica che i messaggi vengano inviati davvero

### Step 10: Test con 2-3 Clienti Pilota

Seleziona 2-3 clienti reali, verifica che abbiano consenso WhatsApp, e testa l'invio. Monitora le risposte.

---

## CHECKPOINT FASE 5

Mandami screenshot di:

1. **Screenshot della dashboard Meta Developers** → mostra l'app WhatsApp configurata con webhook URL
2. **Screenshot dei template approvati** → mostra i template riattivazione_cliente e notifica_titolare approvati
3. **Screenshot del messaggio WhatsApp REALE ricevuto dal titolare** → il riepilogo vero sul telefono
4. **Screenshot della risposta del titolare** → un comando reale (VEDI, OK, etc.) e la risposta del sistema
5. **Screenshot del messaggio ricevuto da un cliente pilota** → l'offerta vera inviata

---

## Note Importanti

- Se qualcosa non funziona, riattiva mock_mode = true e testa nel simulatore
- I template Meta possono impiegare fino a 24h per essere approvati
- Le prime 1000 conversazioni di servizio al mese sono gratuite
- Ogni conversazione marketing costa circa €0.057 in Italia
- Il titolare deve avere un numero DIVERSO da quello del business WhatsApp
