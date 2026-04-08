# CLAUDE.md — Caf-Fenapi (contesto condiviso)

Questo file fornisce il contesto comune a tutti i progetti che lavorano con/per il **Circolo FENAPI — Sede Provinciale di Torino**. Vale come "carta d'identità" del cliente e come insieme di vincoli da rispettare in qualsiasi sotto-progetto (SEO-Fenapi e futuri).

Per lo stato operativo specifico di ogni sotto-progetto leggi il suo `PROJECT_STATUS.md`. Questo file invece descrive *cosa è il cliente e cosa non si tocca*, non *cosa stiamo facendo adesso*.

> **REGOLA PRIMARIA**: prima di ogni task leggi il `PROJECT_STATUS.md` del sotto-progetto su cui stai lavorando, e aggiornalo dopo modifiche significative. Vale anche per Gemini (vedi `Gemini.md`).

---

## 1. Identità del cliente

- **Nome ufficiale**: Circolo FENAPI — Sede Provinciale di Torino
- **Tipo**: Centro di Assistenza Fiscale (CAF) + patronato
- **Territorio**: Torino e provincia
- **Indirizzo sede**: Via Sacra di San Michele 53, 10141 Torino
- **Stakeholder interno**: la madre dell'utente lavora in sede, è il riferimento operativo

## 2. Servizi offerti

Modello 730, ISEE, IMU, pratiche pensionistiche, invalidità civile, successioni, bonus famiglie, dichiarazione redditi per dipendenti.

## 3. Target di clientela

- **Primario**: pensionati e persone vicine alla pensione (dichiarazioni 730, ISEE, calcoli pensione, invalidità, successioni)
- **Secondario**: lavoratori dipendenti adulti (dichiarazione redditi, bonus famiglie, IMU)
- **Terziario**: nuclei familiari per ISEE e bonus

Tono di comunicazione: chiaro, rassicurante, non gergale. Il pubblico include persone anziane e poco digitalizzate.

## 4. Orari di apertura

| Giorno | Orario |
|---|---|
| Lunedì–Giovedì | 9:00–18:00 |
| Venerdì | 9:00–12:00 (Michela fino alle 16:30) |

## 5. Asset digitali esistenti

| Asset | URL / Path | Note |
|---|---|---|
| Sito vetrina | https://www.fenapipiemonte.org/ | HTML statico, vive in `Antigravity/fenapi/frontend/` |
| App prenotazioni | https://prenotazioni.fenapipiemonte.org | Alias di `caffenapi.vercel.app`, repo separato `github.com/edorovetta-png/caffenapi` |
| Backend prenotazioni | Supabase `patzvzdxsglsbfqymgtz` | Provisionato da Lovable, accesso admin limitato |
| Analytics | Google Analytics 4: `G-YNHWG87MSQ` | Embedded in tutte le pagine del sito vetrina |
| Search Console | fenapipiemonte.org | Accesso disponibile (utente) |
| DNS | Aruba | |
| Hosting sito vetrina | Vercel | Auto-deploy dal push del repo `caf-fenapi-torino` (Antigravity) |
| Blog SEO | `fenapi/frontend/blog/` | Articoli pubblicati con Schema.org Article (conteggio aggiornato in `SEO-Fenapi/PROJECT_STATUS.md`) |
| Google Business Profile | Profilo locale "Circolo FENAPI Torino" | Gestito direttamente dalla titolare (madre dell'utente), non dall'utente — per modifiche/post passare da lei |

## 6. Brand

- **Colore primario**: `#206088`
- **Accento oro**: `#C4A052`
- **Font titoli**: Lora (serif)
- **Font body**: Open Sans
- **Font decorativo**: Shadows Into Light
- **Design system**: "Refined Editorial" v2 — vive in `fenapi/frontend/styles.css`
- **Brand guidelines complete**: `fenapi/fenapi-group-brand-guidelines.md`

Prima di qualsiasi modifica visiva, consultare le brand guidelines.

## 7. Regole di contenuto (vincolanti per qualsiasi testo pubblicato)

Queste regole si applicano a TUTTI i contenuti destinati al sito, blog, meta description, snippet, social, materiali stampati. Sono ereditate dal `CLAUDE.md` di `fenapi/`.

1. **Mai suggerire pratiche fiscali in autonomia**. L'utente deve sempre essere indirizzato al CAF.
2. **Mai menzionare concorrenti**: altri CAF, commercialisti, app online, software fiscali.
3. **Sempre posizionare il Circolo FENAPI come punto di riferimento territoriale**.
4. **Mai inventare dati fiscali**: scadenze, aliquote, soglie, requisiti vanno verificati online prima di pubblicarli. Se un dato non è verificabile con certezza scrivere "in via di definizione" o rinviare al sito Agenzia delle Entrate. Meglio vago che sbagliato.
5. **Ogni contenuto deve avere CTA verso `prenotazioni.fenapipiemonte.org`**.
6. **Lingua**: italiano. Registro formale ma accessibile.

## 8. Vincoli di non-rottura — IMPORTANTE

I seguenti elementi NON devono essere alterati senza una richiesta esplicita dell'utente, perché sono in produzione e funzionanti:

| Elemento | Perché non toccarlo |
|---|---|
| `fenapi/caffenapi/` (app prenotazioni) | Repo separato gestito via Lovable, sync Google Calendar attiva, modifiche sbagliate bloccano operatori in sede |
| Edge Functions Supabase su `patzvzdxsglsbfqymgtz` | Provisionate da Lovable, accesso admin limitato, contengono pipeline email + Calendar + Drive |
| Sottodominio `prenotazioni.fenapipiemonte.org` e relativi DNS/redirect | Configurazione Aruba + Vercel funzionante |
| Sync Google Calendar degli operatori | Service account credentials non in mano all'utente, rottura = sede senza calendario |
| Pipeline UTM tracking parziale | Codice presente ma "dormiente" dopo rollback del 2026-04-07, non rimuovere |
| Layout/struttura URL del sito vetrina | Ogni cambio di URL rischia di rompere link esterni e ranking SEO esistente — sempre con redirect 301 |

## 9. Sotto-progetti attuali in `Caf-Fenapi/`

| Cartella | Cosa fa | Modalità di lavoro |
|---|---|---|
| `SEO-Fenapi/` | Analisi SEO + strategia + brief + contenuti per `fenapipiemonte.org` | Read-only su `fenapi/frontend/`. Produce brief che vengono poi applicati manualmente in `fenapi/`. **Struttura**: `audits/` (output di ogni `/seo audit`, formato `YYYY-MM-DD-audit.md`), `briefs/` (brief di ottimizzazione numerati), `content/` (pagine servizi e articoli blog nuovi), `reports/` (report periodici di avanzamento). **File di continuità**: `PROJECT_STATUS.md` (stato sotto-progetto) + `SEO-TRACKER.md` (log attività sessione per sessione). **Toolkit principale**: skill **`claude-seo`** ([github.com/AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo)) — comandi `/seo *` in Claude Code per audit, keyword research, analisi tecnica |

### 9.1 Regola di continuità SEO

> **Vincolante per Claude e Gemini.** Vale ogni volta che si lavora in `Caf-Fenapi/SEO-Fenapi/`.

Qualsiasi agente (Claude o Gemini) che lavora in `SEO-Fenapi/` **DEVE**:

1. **All'inizio della sessione** leggere sia `SEO-Fenapi/PROJECT_STATUS.md` sia `SEO-Fenapi/SEO-TRACKER.md`. Senza questi due file la sessione parte cieca e duplicherà o contraddirà lavoro già fatto.
2. **Salvare l'output del lavoro nella cartella giusta**:
   - Audit (output di `/seo audit` o equivalenti) → `SEO-Fenapi/audits/YYYY-MM-DD-audit.md`
   - Brief di ottimizzazione → `SEO-Fenapi/briefs/NNN-titolo-kebab.md`
   - Contenuti nuovi (pagine servizi, articoli blog) → `SEO-Fenapi/content/NNN-titolo-kebab.md`
   - Report di avanzamento → `SEO-Fenapi/reports/YYYY-MM-...md`
3. **A fine sessione** aggiornare entrambi i file:
   - `PROJECT_STATUS.md` → stato attuale, cosa è stato completato, prossimi step
   - `SEO-TRACKER.md` → nuova riga in cima alla tabella attività con data, agente, tipo, cosa fatto, output, problemi, prossimi step. Aggiornare anche "Blocker aperti/risolti" e "Decisioni strategiche" se applicabile.

Senza questo passaggio, la sessione successiva non avrà contesto e l'altro agente lavorerà al buio. Questa è una regola di **igiene del progetto**, non un'opzione.

## 10. Progetti correlati FUORI da `Caf-Fenapi/`

Vivono in `Antigravity/` allo stesso livello (per ragioni storiche, non sono stati spostati per evitare di rompere link/deploy):

- `fenapi/` — sito vetrina + app prenotazioni del Circolo
- `PensionIQ/` — piattaforma per il calcolo pensionistico (usata come strumento operativo dal CAF)

Quando lavori in `Caf-Fenapi/` puoi e dovresti **leggere** questi progetti per estrarre contesto. Non scriverci dentro a meno che non sia il task esplicito.
