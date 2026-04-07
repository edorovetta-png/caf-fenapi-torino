# Istruzioni per [Nome Collega] — creazione Service Account Google + condivisione 7 calendari

> Ciao! 🙋‍♀️  
> Mi serve il tuo aiuto per **circa 30 minuti** in due fasi:
> 1. **Prima parte (~13 min)**: creare un account tecnico (un "Service Account") sulla console Google Cloud, scaricare un file `.json`, mandarmelo
> 2. **Seconda parte (~15 min)**: visto che hai accesso ai 7 Gmail dei nostri operatori, fare un piccolo aggiornamento di permesso su ognuno dei 7 calendari (sempre cliccando bottoni, niente di tecnico)
>
> Sembra complicato ma sono solo clic in fila — ti guido passo per passo per entrambe le parti.
>
> **Cosa NON ti serve sapere**: niente di programmazione. Mai. È tutto cliccare bottoni in pagine web.
>
> **Cosa TI serve avere**:
> - Un account Google personale TUO (per la prima parte — può essere quello che usi di solito)
> - **Le credenziali dei 7 Gmail degli operatori** (per la seconda parte) — quelli che usi anche per altre cose del CAF
> - **30 minuti** senza interruzioni
> - Un browser (Chrome o Firefox)
>
> ⚠️ Tip per la seconda parte: prima di iniziare, **apri 7 finestre Chrome in modalità incognito** (o usa profili Chrome diversi), una per ogni Gmail. Così non devi sloggarti/rilogarti continuamente.

---

## 🔐 Sicurezza importantissima

Il file `.json` che scaricherai è come una **password molto importante**. Chi lo ha può accedere a cose nostre. Quindi:

1. **NON aprirlo** con doppio click (potresti vedere strane parole tipo `private_key`, è normale, ma non serve aprirlo)
2. **NON mandarlo per WhatsApp normale, email aziendale, o farlo vedere a nessuno**
3. **Mandalo SOLO** con uno dei metodi sicuri che ti ho indicato in chat (Signal, Telegram secret chat, AirDrop)
4. **Quando avrai conferma da me che l'ho ricevuto**, **cancella il file** dalla tua cartella Download

Tranquilla, è una procedura standard, non c'è nulla di pericoloso se segui queste regole.

---

## Step 1 — Apri la console Google Cloud (1 min)

1. Apri **Chrome** o **Firefox**
2. Vai a questo indirizzo (copia-incolla):  
   **https://console.cloud.google.com/**
3. Se ti chiede di loggarti, **logga col tuo account Google personale** (non importa quale, basta che sia tuo)
4. La prima volta che entri, Google ti chiederà di **accettare i termini di servizio**: spunta la casella e clicca **AGREE AND CONTINUE**
5. Se ti chiede paese e tipo di account, scegli **Italia** e **Individuale**

✅ **Sei dentro** quando vedi una pagina con "Welcome" o "Dashboard" e in alto a sinistra il logo "Google Cloud".

---

## Step 2 — Crea un nuovo progetto (2 min)

1. In alto a sinistra, **accanto al logo Google Cloud**, c'è una scritta tipo **"Select a project"** (o un nome di progetto qualsiasi). Clicca su quella scritta.
2. Si apre una finestrella → in alto a destra di quella finestrella clicca **"NEW PROJECT"** (o "Nuovo Progetto")
3. Compila i campi:
   - **Project name**: scrivi `caffenapi-edge-functions`
   - **Organization**: lascia quello che c'è (probabilmente "No organization") — non toccare
   - **Location**: lascia quello che c'è — non toccare
4. Clicca il bottone blu **CREATE**
5. **Aspetta ~30 secondi** che il progetto venga creato. In alto a destra vedrai una notifica "Creating project..." e poi "Project created"
6. Ora **devi selezionare il progetto appena creato**: clicca di nuovo in alto a sinistra dove c'è il selettore progetti → si apre la finestrella → clicca su **caffenapi-edge-functions** nella lista

✅ **Sei a posto** quando in alto a sinistra leggi "caffenapi-edge-functions" come progetto attivo.

---

## Step 3 — Attiva due servizi Google (3 min)

Adesso devo farti attivare 2 servizi su questo progetto. È come "abilitare 2 funzionalità".

### 3.1 — Attiva Google Calendar API

1. In alto a sinistra, clicca **l'icona del menu** (le 3 righette orizzontali ☰)
2. Si apre un menu lungo → cerca **"APIs & Services"** → al passare del mouse compare un sottomenu → clicca **"Library"**
3. Sei in una pagina con tante card di servizi e una barra di ricerca in alto
4. Nella barra di ricerca scrivi: **`google calendar api`**
5. Clicca sulla card che dice **"Google Calendar API"** (con l'icona del calendario blu)
6. Si apre la pagina del servizio → clicca il bottone blu **ENABLE** (o "ATTIVA")
7. Aspetta ~10 secondi che il bottone diventi grigio e mostri "API enabled" (o "API attivata")

✅ **Calendar attivato.**

### 3.2 — Attiva Google Drive API

1. In alto a sinistra clicca la freccia indietro **←** (oppure clicca di nuovo Library nel menu)
2. Nella barra di ricerca scrivi: **`google drive api`**
3. Clicca sulla card che dice **"Google Drive API"** (icona del triangolo Drive)
4. Clicca **ENABLE**
5. Aspetta ~10 secondi → "API enabled"

✅ **Drive attivato.**

---

## Step 4 — Crea il "Service Account" (3 min)

Questo è l'account tecnico vero e proprio.

1. In alto a sinistra clicca il **menu ☰**
2. Cerca **"IAM & Admin"** → al passare del mouse compare un sottomenu → clicca **"Service Accounts"**
3. La prima volta potrebbe chiederti di confermare qualcosa o di selezionare di nuovo il progetto: se è così, scegli **caffenapi-edge-functions** dalla lista
4. In alto della pagina, clicca **"+ CREATE SERVICE ACCOUNT"** (è un bottone grigio in alto)
5. Si apre una pagina con 3 step. Compila così:

   **Step 1 di 3 — Service account details**:
   - **Service account name**: scrivi `caffenapi-edge`
   - **Service account ID**: si compila da solo (lascia quello che mette automatico)
   - **Service account description**: scrivi `Account tecnico per le edge function di caffenapi` (questo serve solo come promemoria)
   - Clicca **CREATE AND CONTINUE** (bottone blu in basso)

   **Step 2 di 3 — Grant this service account access to project**:
   - **NON DEVI METTERE NULLA** in questa schermata. Lascia tutto vuoto. È volutamente vuoto.
   - Clicca **CONTINUE** (in basso)

   **Step 3 di 3 — Grant users access to this service account**:
   - **Anche qui NON DEVI METTERE NULLA.** Lascia tutto vuoto.
   - Clicca **DONE** (in basso)

6. Adesso vedi la lista degli "Service accounts" (probabilmente solo uno: il `caffenapi-edge` che hai appena creato). C'è una colonna **"Email"** dove vedi un'email lunga tipo:

   ```
   caffenapi-edge@caffenapi-edge-functions-447821.iam.gserviceaccount.com
   ```
   
   **Copia questa email** e mandamela in chat (la userò poi io). Se non vedi tutta l'email, passa col mouse sopra e copia tutto.

✅ **Service account creato.**

---

## Step 5 — Genera la chiave (il file `.json`) (2 min)

Quasi finito! Adesso generiamo il file vero che mi devi mandare.

1. Nella lista dei service account, **clicca sull'email** del `caffenapi-edge` (clicca proprio sul testo dell'email)
2. Sei dentro la pagina del service account. In alto vedi delle tab: **DETAILS**, **PERMISSIONS**, **KEYS**, **METRICS**, **LOGS**
3. Clicca su **KEYS**
4. Vedi una scritta "No keys" e un bottone in alto **"ADD KEY"** → cliccaci sopra
5. Si apre un piccolo menu a tendina → clicca **"Create new key"**
6. Si apre una finestra modale con due opzioni:
   - **JSON** (selezionato di default) ← lascia questo
   - **P12**
7. Clicca il bottone blu **CREATE** in basso
8. Il browser **scarica automaticamente** un file con un nome strano tipo:
   ```
   caffenapi-edge-functions-447821-abc123def456.json
   ```
   
   Lo trovi nella tua cartella **Download** (o dove di solito ti vanno i file scaricati).

✅ **HAI FATTO!** Hai il file. 🎉

---

## Step 6 — Mandami il file in modo sicuro

Adesso mi devi mandare il file. Usa **uno solo** di questi metodi (in ordine di preferenza):

1. **🥇 Signal** (se ce l'abbiamo entrambi): apri Signal, vai in chat con me, clicca l'icona della graffetta 📎, scegli **File**, naviga alla cartella Download, seleziona il file `.json` che si è appena scaricato → invia
2. **🥈 Telegram (chat normale è OK perché Telegram crittografa i file)**: stessa procedura — graffetta → File → seleziona → invia
3. **🥉 AirDrop** se siamo nello stesso ufficio: tasto destro sul file → Share → AirDrop → seleziona il mio Mac
4. **In extremis — Email personale Gmail**: dalla TUA Gmail personale alla MIA Gmail personale (NON quelle aziendali). Allega il file `.json` come allegato normale.

❌ **NON usare**: WhatsApp, email aziendale, Telegram canale pubblico, Slack pubblico, qualsiasi cosa con "Cloud" o "Drive" intermedio.

---

## Step 7 — Cancella il file dopo che ti dico "ricevuto" ✅

Quando io ti rispondo "**ricevuto, grazie!**", tu:

1. Vai nella cartella Download
2. Trova il file `.json` che hai mandato
3. **Sposta nel cestino**
4. **Svuota il cestino** (Cestino → tasto destro → Svuota cestino)
5. Se l'hai mandato per email: vai nella mail inviata, **cancella il messaggio**, poi vai in Cestino email e cancellalo definitivamente
6. Se l'hai mandato per Signal/Telegram: vai nella chat, **cancella il messaggio per entrambi** (long press → Delete for everyone)

Questo è importante perché il file contiene una "password" che non deve restare in giro su nessun dispositivo se non sul mio Mac dove lo userò.

---

## ❓ Cosa fare se ti blocchi su un passaggio

**Non andare avanti a tentoni.** Fermati e mandami uno screenshot di quello che vedi sullo schermo. Ti dico io cosa cliccare. Sono procedure noiose ma non difficili — di solito si bloccano solo perché Google cambia la posizione di un bottone ogni tanto.

**Errori che potrebbero comparire e cosa fare**:

| Cosa vedi | Cosa fare |
|---|---|
| "You need to verify your account" | Verifica con codice SMS, è normale per i nuovi account Google Cloud |
| "Billing account required" | Anche se non costa nulla, Google a volte chiede una carta di credito di "verifica". Inserisci la tua, NON verrai mai addebitata per questo uso. Se sei a disagio, fammi sapere e troviamo un'alternativa. |
| "This project has been deleted" | Probabilmente ti sei loggata con un account diverso. Logout e re-login con quello giusto. |
| "Permission denied" | Il tuo account non ha i permessi per creare progetti — può succedere se per errore stai usando un account aziendale con restrizioni. Fammi sapere, ti dico io cosa fare. |
| Una pagina in inglese che ti chiede "Welcome to Cloud Identity" o "Domain verification" | NON proseguire, fammi screenshot. Probabilmente Google ti sta chiedendo di registrare un'organizzazione che non ti serve. |

---

## Riepilogo veloce

| Step | Cosa fai | Tempo |
|---|---|---|
| 1 | Login su console.cloud.google.com | 1 min |
| 2 | Crea nuovo progetto `caffenapi-edge-functions` | 2 min |
| 3 | Attiva Google Calendar API + Google Drive API | 3 min |
| 4 | Crea Service Account `caffenapi-edge` + mandami la sua email | 3 min |
| 5 | Genera key JSON (download automatico) | 2 min |
| 6 | Mandami il file via Signal/Telegram/AirDrop | 1 min |
| 7 | Cancella il file dopo conferma di ricezione | 1 min |

**Totale: ~13 minuti** ⏱️

---

## Fine PARTE 1. Pausa.

A questo punto mi mandi in chat:
1. **L'email del Service Account** (la stringa lunga che finisce in `.iam.gserviceaccount.com`)
2. **Il file .json** col metodo sicuro
3. Un semplice **"PARTE 1 fatta!"**

Io ti rispondo "ricevuto, grazie!" appena lo tiro giù — **e a quel punto comincia la PARTE 2**, che ti spiego sotto.

⚠️ **Aspetta che io confermi "ricevuto"** prima di passare alla PARTE 2, perché ti servirà l'email del SA che mi hai appena mandato (la dovrai incollare 7 volte) e voglio essere sicuro di avere tutto in mano.

---

# PARTE 2 — Condividere i 7 calendari Google col Service Account (15 min)

Adesso che il Service Account esiste, devi dargli il permesso di leggere e modificare i 7 calendari degli operatori. È sempre clic in fila ma stavolta li fai direttamente sui calendari Google, non sulla console Cloud.

## Setup veloce — apri 7 finestre incognito

Per non doverti loggare/sloggare 7 volte, **prima di iniziare apri 7 finestre Chrome in modalità incognito** (oppure 7 profili Chrome diversi). In ognuna farai login con un Gmail diverso.

**Su Mac**: Chrome → File → New Incognito Window → ripeti 7 volte. Puoi affiancarle.

## Lista dei 7 Gmail su cui dovrai loggarti

| # | Operatore | Gmail |
|---|---|---|
| 1 | Erika Borghese | `fenapicaf2022@gmail.com` |
| 2 | Giorgia Longhi | `fenapitorino@gmail.com` |
| 3 | Glennys De Morla | `iseefenapi1@gmail.com` |
| 4 | Leonardo Ottaiano | `infofenapitorino@gmail.com` |
| 5 | Eliane Do Carmo | `paghefenapi@gmail.com` |
| 6 | Michela Salerno | `inapitorino1@gmail.com` |
| 7 | Dott.ssa Daniela Palillo | `daniela.palillo@torino.fenapipiemonte.org` ⚠️ verifica con Edoardo se ha Calendar attivo |

## Procedura per ogni calendario (ripeti 7 volte)

Per ogni Gmail della lista sopra:

### Step 1 — Login

1. In una finestra incognito (o profilo dedicato), vai su:
   👉 **https://calendar.google.com**
2. Logga col Gmail dell'operatore (ad es. `fenapicaf2022@gmail.com`)

### Step 2 — Apri Impostazioni del calendario

1. Nella **colonna sinistra**, sotto la scritta **"I miei calendari"**, trovi una lista di calendari dell'account
2. Trova quello principale (di solito ha il nome dell'utente o il nome dell'email)
3. **Passa il mouse sopra** il nome → vedrai apparire **3 puntini "⋮"** sulla destra → cliccaci sopra
4. Si apre un menu → clicca **"Impostazioni e condivisione"**

### Step 3 — Aggiungi il Service Account

1. Sei in una pagina con tante opzioni → **scorri verso il basso** fino alla sezione **"Condividi con persone e gruppi specifici"**
2. Clicca il bottone **"+ Aggiungi persone e gruppi"**
3. Si apre una finestrella → nel campo email **incolla** l'email del Service Account che ti ho dato (quella lunga tipo `caffenapi-edge@caffenapi-edge-functions-447821.iam.gserviceaccount.com`)
4. **Sotto** c'è un menu a tendina dei permessi → clicca e scegli **"Apportare modifiche agli eventi"**
   - ⚠️ Attenta: NON scegliere "Vedere solo (libero/occupato)" — è troppo poco
   - ⚠️ NON scegliere "Apportare modifiche e gestire la condivisione" — è troppo
5. Clicca **"Invia"**
6. Verifica che ora vedi l'email del SA listata sotto "Condiviso con" col permesso giusto

### Step 4 — Spunta dalla lista e passa al successivo

Spunta l'operatore appena fatto e logga sul Gmail successivo (in un'altra finestra incognito).

## Lista da spuntare (ti aiuto a non perderti)

- [ ] 1. fenapicaf2022@gmail.com (Erika)
- [ ] 2. fenapitorino@gmail.com (Giorgia)
- [ ] 3. iseefenapi1@gmail.com (Glennys)
- [ ] 4. infofenapitorino@gmail.com (Leonardo)
- [ ] 5. paghefenapi@gmail.com (Eliane)
- [ ] 6. inapitorino1@gmail.com (Michela)
- [ ] 7. (Daniela — solo se Edoardo conferma che ha Calendar)

## Quando hai finito tutti i 7

**Mandami in chat**: `"PARTE 2 fatta — tutti i 7 calendari condivisi"`

Da quel momento Edoardo (o il suo sistema) può fare il resto del lavoro tecnico in autonomia.

---

## ❓ Cosa fare se ti blocchi

### Sulla PARTE 1 (Cloud Console)

| Cosa vedi | Cosa fare |
|---|---|
| "You need to verify your account" | Verifica con codice SMS, è normale per i nuovi account |
| "Billing account required" | Inserisci una carta — NON verrai addebitata, è solo verifica |
| "Permission denied" | Stai usando un account aziendale con restrizioni. Logout e riprova con account personale |
| Pagina inglese strana che chiede "Welcome to Cloud Identity" | Fai screenshot e fermati |

### Sulla PARTE 2 (Calendari)

| Cosa vedi | Cosa fare |
|---|---|
| "Non puoi condividere questo calendario" | Probabilmente sei loggata col profilo sbagliato. Controlla in alto a destra l'avatar |
| Il bottone "+ Aggiungi persone" è grigio | Lo stesso: account sbagliato o calendar di sola lettura |
| Email rifiutata "Invalid email address" | Hai copiato male l'email. Ricontrolla che sia tutta intera, deve finire con `.iam.gserviceaccount.com` |
| Non vedi i 3 puntini accanto al calendario | Devi passare il mouse PROPRIO sopra il nome del calendario, non lo vedi se sei "lontano" |

---

## Riepilogo veloce di tutto

| Step | Cosa fai | Tempo |
|---|---|---|
| 1 | (PARTE 1) Login console.cloud.google.com | 1 min |
| 2 | (PARTE 1) Crea progetto `caffenapi-edge-functions` | 2 min |
| 3 | (PARTE 1) Attiva Calendar + Drive API | 3 min |
| 4 | (PARTE 1) Crea Service Account `caffenapi-edge` | 3 min |
| 5 | (PARTE 1) Genera key JSON | 2 min |
| 6 | (PARTE 1) Mandami file + email del SA | 1 min |
| 7 | (Pausa) Aspetti che io confermi "ricevuto" | 1 min |
| 8 | (PARTE 2) Login + condividi i 7 calendari | 15 min |
| 9 | (PARTE 2) Mi confermi "PARTE 2 fatta" | 1 min |
| 10 | Cancelli il file .json dalla cartella Download | 1 min |

**Totale: ~30 minuti** ⏱️

---

## Grazie!! 🙏

So che è una procedura noiosa ma è un favore enorme — risparmi giorni di coordinamento operatori e mi permetti di chiudere un setup tecnico importante. Chiunque incontri un blocco fa screenshot e me lo manda, ti aiuto al volo. Ci vediamo dall'altra parte! 💪
