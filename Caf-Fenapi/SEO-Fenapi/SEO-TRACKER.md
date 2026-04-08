# SEO-TRACKER — SEO-Fenapi

> File di **continuità** tra sessioni e tra agenti (Claude / Gemini). Da leggere prima di iniziare e aggiornare a fine sessione, sempre.
> Usato insieme a `PROJECT_STATUS.md`: il PROJECT_STATUS descrive lo *stato* del sotto-progetto, questo file descrive *ciò che è stato fatto sessione per sessione*.

---

## Come usare questo file

Ogni sessione di lavoro deve aggiungere **una nuova riga** alla tabella sotto, in cima (più recente in alto). I campi:

- **Data**: `YYYY-MM-DD`
- **Agente**: Claude / Gemini / utente
- **Tipo**: `audit` | `brief` | `contenuto` | `report` | `research` | `setup` | `altro`
- **Cosa è stato fatto**: 1-3 righe sintetiche
- **Output**: file prodotti (con path relativo a `SEO-Fenapi/`)
- **Problemi trovati**: blocker, dati mancanti, dipendenze esterne (vedi anche sezione "Blocker aperti" sotto)
- **Prossimi step**: cosa la prossima sessione dovrebbe affrontare

Quando un blocker viene risolto, **muovilo dalla sezione "Blocker aperti" a "Blocker risolti"** con la data di risoluzione.

---

## Tabella attività (più recente in alto)

| Data | Agente | Tipo | Cosa è stato fatto | Output | Problemi | Prossimi step |
|---|---|---|---|---|---|---|
| 2026-04-08 | Claude | setup | Creazione struttura SEO-Fenapi: cartelle `audits/ briefs/ content/ reports/` (preesistono anche `research/ scripts/`), `SEO-TRACKER.md`, aggiornamento `PROJECT_STATUS.md`. Aggiunte regole di continuità SEO in `../CLAUDE.md` e `../Gemini.md` | `SEO-TRACKER.md`, `content/README.md`, `reports/README.md`, `PROJECT_STATUS.md` (update), `../CLAUDE.md` (sezione 9 + nuova sezione continuità), `../Gemini.md` (regola continuità) | Skill `claude-seo` non ancora verificata empiricamente — si valuta alla prima esecuzione di `/seo audit` | Eseguire primo audit del sito live con `/seo audit` o equivalente, salvare in `audits/2026-04-08-audit.md`. Pull baseline Search Console e GA4 |
| 2026-04-08 | Claude | setup | Creazione iniziale `Caf-Fenapi/`, `CLAUDE.md` con contesto cliente, `Gemini.md`, scaffolding SEO-Fenapi (audits, briefs, research, scripts), `PROJECT_STATUS.md` di SEO-Fenapi | Vedi commit/log filesystem | — | Vedi riga sopra |

---

## Blocker aperti

| Aperto il | Tipo | Descrizione | Impatto | Possibile soluzione |
|---|---|---|---|---|
| 2026-04-08 | dato mancante | Conteggio esatto articoli blog in `fenapi/frontend/blog/` non verificato in questa sessione | Basso — il numero serve solo per il `PROJECT_STATUS.md`, non blocca audit | Eseguire `ls fenapi/frontend/blog/*.html` o equivalente all'inizio della prossima sessione |
| 2026-04-08 | dipendenza tool | Skill `claude-seo` ancora da testare empiricamente — i comandi `/seo *` non sono stati ancora invocati | Medio — è il toolkit principale dichiarato | Eseguire `/seo` senza argomenti per vedere l'help, oppure `/seo audit` direttamente sul dominio fenapipiemonte.org |
| 2026-04-08 | accesso esterno | Search Console: l'utente ha accesso ma non c'è ancora un export salvato in `audits/` | Medio — serve per la baseline | Decidere se l'export va fatto manualmente dall'utente (UI Search Console) o via API (richiede credenziali) |

## Blocker risolti

| Aperto | Risolto | Descrizione | Come è stato risolto |
|---|---|---|---|
| — | — | — | — |

---

## Decisioni strategiche prese (con data)

Decisioni che hanno effetto su come si lavora qui dentro. Da non confondere con i task: queste sono *scelte* che cambiano il modo di operare.

| Data | Decisione | Razionale |
|---|---|---|
| 2026-04-08 | SEO-Fenapi è **read-only su `fenapi/frontend/`**. Le modifiche al sito vero le applica una sessione separata in `fenapi/`. | Sicurezza: non rischiare di rompere sito, app prenotazioni, sync Calendar. Vedi `../CLAUDE.md` sezione 8. |
| 2026-04-08 | Toolkit principale = skill **`claude-seo`** ([repo](https://github.com/AgriciDaniel/claude-seo)). Script Python in `scripts/` solo per esigenze non coperte. | Standardizzazione, evita reinventare crawler/audit già esistenti. |
| 2026-04-08 | Google Business Profile è gestito **dalla titolare**, non dall'agente. Eventuali raccomandazioni su GBP vanno formulate come istruzioni per lei. | Accessi non in mano all'utente. |
| 2026-04-08 | Caf-Fenapi vive nel repo **monorepo `caf-fenapi-torino`** (l'attuale repo Antigravity). No nuovo repo separato. | Coerenza con il setup esistente, zero overhead. |

---

## Contesto rapido (per chi entra a freddo)

Se è la prima volta che apri questo file in una nuova sessione, leggi nell'ordine:

1. `PROJECT_STATUS.md` (in questa stessa cartella) — stato operativo del sotto-progetto
2. `../CLAUDE.md` — contesto cliente, brand, vincoli di non-rottura, regole di contenuto
3. Questo file — cosa è stato fatto sessione per sessione
4. Solo poi inizia il task richiesto dall'utente

Se sei Gemini: leggi anche `../Gemini.md` per le istruzioni operative specifiche.
