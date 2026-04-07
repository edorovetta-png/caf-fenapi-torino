# Istruzioni per [Nome Collega] — creazione Service Account Google

> Ciao! 🙋‍♀️  
> Mi serve il tuo aiuto per ~15 minuti per creare un account tecnico (un "Service Account") sulla console Google Cloud. Sembra complicato ma sono solo clic in fila — ti guido passo per passo. Alla fine il tuo browser scaricherà automaticamente UN file `.json` e tu me lo mandi (usando il metodo che ti dico più sotto).
>
> **Cosa NON ti serve sapere**: niente di programmazione. Mai. È tutto cliccare bottoni in pagine web.
>
> **Cosa TI serve avere**:
> - Un account Google (puoi usare quello tuo personale, NON deve essere quello aziendale)
> - 15 minuti senza interruzioni
> - Un browser (Chrome o Firefox)

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

## Grazie!! 🙏

Quando hai finito, mandami in chat:
1. **L'email del Service Account** (la stringa lunga che finisce in `.iam.gserviceaccount.com`)
2. **Il file .json** col metodo sicuro
3. Un semplice **"fatto!"**

Ti rispondo "ricevuto, grazie!" appena lo tiro giù e da quel momento puoi cancellare tutto.

Se ti blocchi su qualunque passo, **fermati e mandami uno screenshot**. Non improvvisare per non rischiare di fare guai. Ci vediamo dall'altra parte! 💪
