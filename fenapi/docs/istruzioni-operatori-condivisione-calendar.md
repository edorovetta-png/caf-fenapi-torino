# Messaggio da inviare a ogni operatore — condivisione del calendario

> **Per il proprietario del progetto (Edoardo)**: questo è un template messaggio da copiare 7 volte e personalizzare col nome di ogni operatore. Ogni operatore deve fare la procedura **dal suo PC**, loggato col **suo Gmail personale**. Tempo per loro: 1 minuto. Tempo totale per te: ~10 minuti per scrivere/mandare i 7 messaggi.
>
> **Da inviare DOPO** che hai ricevuto dalla collega l'email del Service Account (formato: `caffenapi-edge@<id>.iam.gserviceaccount.com`).

---

## Template messaggio (copia, personalizza, invia)

**Sostituisci** ogni occorrenza di:
- `[NOME]` con il nome dell'operatore (es. `Erika`)
- `[EMAIL_SA]` con l'email del Service Account che la collega ti ha mandato

**Manda lo stesso messaggio identico a tutti e 7** via WhatsApp / Telegram / Email — quello che usi di solito.

---

```
Ciao [NOME] 👋

Ho bisogno di 1 minuto del tuo tempo per un aggiornamento tecnico al sistema 
di prenotazione del CAF. Devi solo aggiungere un permesso al tuo calendario 
Google così che il sistema possa continuare a vedere i tuoi appuntamenti e 
crearti gli eventi automaticamente quando qualcuno prenota con te.

📋 ISTRUZIONI (1 minuto, sul tuo PC, loggata col tuo Gmail):

1. Apri Google Calendar nel browser:
   👉 https://calendar.google.com
   (assicurati di essere loggata col tuo account, in alto a destra)

2. Nella colonna sinistra, sotto "I miei calendari", trova il tuo calendario
   principale (di solito ha il tuo nome)

3. Passa il mouse sopra il nome del calendario → vedrai apparire 3 puntini "⋮"
   alla destra del nome → cliccaci sopra

4. Si apre un piccolo menu → clicca "Impostazioni e condivisione"

5. Nella nuova pagina che si apre, scorri in basso fino alla sezione 
   "Condividi con persone e gruppi specifici"

6. Clicca il pulsante "+ Aggiungi persone e gruppi"

7. Nel campo email che appare, copia e incolla esattamente questa email:

   [EMAIL_SA]

8. Sotto, dove c'è il menu a tendina dei permessi, seleziona:
   "Apportare modifiche agli eventi" 
   ⚠️ NON "Vedere solo (libero/occupato)" — quello non basta
   ⚠️ NON "Apportare modifiche e gestire la condivisione" — quello è troppo

9. Clicca "Invia"

10. Quando hai finito, scrivimi "fatto" qui in chat 🙏

Ti ringrazio infinitamente, è una cosa veloce ma fondamentale per non 
interrompere il sistema.

Se ti blocchi su qualunque passaggio, mandami uno screenshot di quello 
che vedi e ti aiuto io.
```

---

## Cosa fare quando arrivano le risposte

Tieni una checklist mentale (o su un foglietto) e spunta man mano:

- [ ] Erika Borghese — `fenapicaf2022@gmail.com`
- [ ] Giorgia Longhi — `fenapitorino@gmail.com`
- [ ] Glennys De Morla — `iseefenapi1@gmail.com`
- [ ] Leonardo Ottaiano — `infofenapitorino@gmail.com`
- [ ] Eliane Do Carmo — `paghefenapi@gmail.com`
- [ ] Michela Salerno — `inapitorino1@gmail.com`
- [ ] Dott.ssa Daniela Palillo — `daniela.palillo@torino.fenapipiemonte.org` (verificare se ha calendar Google attivo — se non ce l'ha, salta)

⚠️ **Daniela Palillo** ha un'email su dominio custom (`@torino.fenapipiemonte.org`) e nei dati migrati il suo `calendar_id` risulta vuoto. Prima di mandarle il messaggio, verifica con lei se ha effettivamente un Google Calendar attivo collegato a quell'email. Se non ce l'ha, **non farle fare la procedura** — il sistema gestirà i suoi appuntamenti senza sync calendar (visibili solo nella dashboard admin).

---

## Quanto può durare la fase di attesa

Dipende dalla disponibilità degli operatori:

- **Best case**: tutti rispondono nello stesso pomeriggio → ~3 ore totali
- **Realistic**: 2-3 giorni (qualcuno è in ferie, qualcuno se ne dimentica e va sollecitato)
- **Worst case**: 1 settimana se devi inseguire qualcuno

**Suggerimento**: manda i messaggi tutti insieme un lunedì mattina (quando tutti sono al lavoro / sul telefono), così entro mercoledì la maggior parte ha risposto.

**Suggerimento 2**: se vuoi, dopo 24h da chi non ha ancora risposto, manda un follow-up gentile tipo: *"Ciao [Nome], ricorda quando hai 1 minuto la cosa del calendario, grazie 🙏"*

---

## Cosa NON dire agli operatori

Per non confonderli o spaventarli, **NON spiegare**:

- ❌ Che stiamo migrando da un Supabase Lovable a uno tuo
- ❌ Che è collegato alla cosa del QR code
- ❌ Cos'è un "Service Account" o cosa vuol dire `client_email`
- ❌ Che senza questa procedura il sistema potrebbe fare double-booking
- ❌ Qualunque dettaglio tecnico su Edge Functions, Supabase, Google Cloud Console

Loro devono solo capire: *"Edoardo mi ha chiesto di aggiungere un permesso al mio calendario, è una cosa banale, fatto fatto."*

Più informazione tecnica metti nel messaggio, **più dubbi e domande ti faranno**. Tieni il messaggio breve e operativo. Se qualcuno è curioso e te lo chiede direttamente, allora gli spiegherai a voce.

---

## Verifica che la condivisione abbia funzionato

Quando un operatore ti scrive "fatto", puoi (opzionale) verificare velocemente che la condivisione esista davvero **dalla console Google Cloud** dopo che il SA è in produzione. Ma in pratica si vede solo quando il sistema lo userà davvero.

Il modo più rapido per verificare TUTTI insieme è far partire la migrazione finale (l'edge function `check-availability` che fa freeBusy su tutti i calendar dei 7 operatori). Se uno non è stato condiviso correttamente, vedrai nei log Supabase un errore `403 Forbidden` con il nome di quell'email — a quel punto sai chi sollecitare.

Non serve verificare prima — fidati che se ti rispondono "fatto" l'hanno fatto. Al massimo, dopo che la migrazione è in produzione, controlli i log e re-prompti chi ha sbagliato.
