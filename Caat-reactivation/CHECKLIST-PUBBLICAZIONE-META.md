# Checklist Pubblicazione App Meta — CAAT Reactivation

> Stato attuale: app in modalità **sviluppo** (Development)
> Obiettivo: passare a modalità **Live** per token stabili, nessun limite destinatari, numero business attivo

---

## 1. Requisiti Meta per pubblicare un'app WhatsApp Business

| Requisito | Stato | Bloccante? |
|---|---|---|
| Privacy Policy URL pubblica | Da creare | **SI** |
| Terms of Service URL | Da creare | No (consigliato) |
| Verifica Business (Meta Business Manager) | Non verificato | **SI** |
| Icona app 1024x1024 px | Da caricare | **SI** |
| Descrizione app (max 400 char) | Da scrivere | **SI** |
| Categoria app | Da selezionare | **SI** |
| Review permessi `whatsapp_business_messaging` | Da richiedere | **SI** |
| Review permessi `whatsapp_business_management` | Da richiedere | **SI** |
| Display name dell'app conforme alle policy | Verificare | **SI** |
| Account Business verificato con documenti | Non completato | **SI** |

---

## 2. Azioni da fare

### A) Azioni manuali — Edo su Meta Dashboard

Tutte bloccanti salvo dove indicato.

1. **Verifica Business** (bloccante)
   - Meta Business Manager > Impostazioni > Centro sicurezza > Verifica business
   - Servono: documento d'identita del legale rappresentante, documento aziendale (visura camerale o bolletta), dominio email aziendale o sito web
   - Azienda: Borgnino Vittorio srl / EXICA
   - Tempo stimato: 2-5 giorni lavorativi dopo l'invio

2. **Carica icona app** (bloccante)
   - Meta Developer > App > Impostazioni > Base
   - Formato: PNG o JPG, 1024x1024 px, sfondo non trasparente
   - Suggerimento: logo EXICA o un'icona generica food/commerce

3. **Compila info app** (bloccante)
   - Meta Developer > App > Impostazioni > Base
   - Display Name: "CAAT Reactivation" (o "EXICA WhatsApp")
   - Descrizione: "Sistema di riattivazione clienti per commercio alimentare all'ingrosso al CAAT di Torino. Invia offerte personalizzate via WhatsApp ai clienti dormienti dopo approvazione del titolare."
   - Categoria: "Business and Pages" o "Messaging"
   - Contact email: email aziendale

4. **Inserisci Privacy Policy URL** (bloccante)
   - Meta Developer > App > Impostazioni > Base > Privacy Policy URL
   - URL: `https://<tuo-dominio-vercel>/privacy-policy.html`
   - (il file e gia pronto in `/public/privacy-policy.html`, vedi sezione B)

5. **Inserisci Terms of Service URL** (consigliato, non bloccante)
   - Stessa pagina > Terms of Service URL
   - URL: `https://<tuo-dominio-vercel>/terms.html`

6. **Richiedi review dei permessi** (bloccante)
   - Meta Developer > App Review > Permissions and Features
   - Richiedi: `whatsapp_business_messaging`
   - Richiedi: `whatsapp_business_management`
   - Per ogni permesso Meta chiede:
     - Descrizione d'uso (come usi WhatsApp)
     - Screenshot/video del flusso
     - Conferma compliance con le policy WhatsApp Business
   - Descrizione suggerita: "L'app invia offerte commerciali personalizzate a clienti dormienti (>60gg senza acquisti) di un'azienda alimentare all'ingrosso. I messaggi vengono inviati solo dopo approvazione manuale del titolare via WhatsApp. I clienti possono rispondere STOP per essere rimossi."

7. **Passa l'app in modalita Live** (dopo la review)
   - Meta Developer > App > in alto a destra, toggle "Development" → "Live"
   - Prerequisiti: tutti i punti sopra completati

### B) Azioni automatiche — Claude Code

Tutte completate:

1. **Privacy Policy** (bloccante) — `apps/admin/public/privacy-policy.html`
   - Pagina professionale per EXICA/Borgnino Vittorio srl
   - Descrive uso WhatsApp per comunicazioni commerciali
   - Conforme GDPR e policy WhatsApp Business

2. **Terms of Service** (consigliato) — `apps/admin/public/terms.html`
   - Condizioni d'uso base del servizio

3. Entrambi i file sono nella cartella `/public` del progetto Next.js, pronti per il deploy su Vercel. Saranno accessibili a:
   - `https://<dominio-vercel>/privacy-policy.html`
   - `https://<dominio-vercel>/terms.html`

---

## 3. Ordine consigliato

```
1. Deploy su Vercel (per avere gli URL delle policy)        ← Claude Code
2. Compila info app + icona + URL policy su Meta Dashboard  ← Edo
3. Avvia verifica business su Meta Business Manager         ← Edo
4. Attendi verifica (2-5 giorni)                            ← Attesa
5. Richiedi review permessi WhatsApp                        ← Edo
6. Attendi review (1-3 giorni)                              ← Attesa
7. Toggle app → Live                                        ← Edo
8. Genera System User Token permanente                      ← Edo
9. Aggiorna WA_ACCESS_TOKEN nei secrets Supabase            ← Claude Code
```

---

## 4. Note importanti

- **Token permanente**: dopo la pubblicazione, crea un System User in Meta Business Manager > Impostazioni > System Users, assegnagli i permessi sull'app e genera un token permanente. Questo sostituira il token temporaneo che scade ogni 24h.
- **Numero business**: lo stato "In sospeso" si risolve automaticamente dopo la verifica business.
- **Rate limits**: in Development il limite e 250 messaggi/giorno. In Live sale a 1000+/giorno (aumentabile).
- **Opt-in**: Meta richiede che i destinatari abbiano dato consenso a ricevere messaggi WhatsApp. Il campo `consenso_whatsapp` nel database soddisfa questo requisito.
