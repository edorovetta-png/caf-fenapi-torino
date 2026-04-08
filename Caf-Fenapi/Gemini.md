# Gemini.md — Caf-Fenapi (istruzioni agente)

> **Per il contesto cliente, brand, vincoli di non-rottura e regole di contenuto leggi `CLAUDE.md` in questa stessa cartella.** Quel file è la fonte di verità condivisa: vale identico per Claude e per Gemini. Questo file aggiunge solo le istruzioni operative specifiche per agenti.

---

## Regola primaria

Prima di ogni task leggi SEMPRE il `PROJECT_STATUS.md` del sotto-progetto su cui stai lavorando. Dopo ogni modifica significativa, aggiornalo con quello che hai fatto.

`PROJECT_STATUS.md` è condiviso tra Claude e Gemini: se non lo aggiorni, l'altro agente lavorerà senza contesto e commetterà errori.

Se manca, crealo con: descrizione, tech stack, struttura cartelle, stato attuale, prossimi step.

## Architettura a 3 livelli (eredità da Antigravity)

Ogni sotto-progetto in `Caf-Fenapi/` segue, dove applicabile, l'architettura a 3 livelli del workspace:

1. **Direttive / Specifica** — SOP, brief, requisiti in Markdown
2. **Orchestrazione** — Decisioni dell'agente AI (te o Claude)
3. **Esecuzione** — Codice deterministico (script Python, edge function, ecc.)

Principio: spingere la complessità in codice deterministico, non nel ragionamento LLM.

## Regole specifiche per Caf-Fenapi

1. **Non modificare mai file fuori da `Caf-Fenapi/`** senza richiesta esplicita. In particolare:
   - `fenapi/` è il sito reale in produzione
   - `fenapi/caffenapi/` è gestito via Lovable, repo separato
   - `PensionIQ/` è uno strumento operativo della sede
2. **Puoi leggere** liberamente `fenapi/`, `PensionIQ/` e qualsiasi altra cartella in `Antigravity/` per estrarre contesto.
3. **Vincoli di non-rottura**: vedi sezione 8 di `CLAUDE.md`. Lista corta: app prenotazioni, sync Google Calendar, redirect, struttura URL del sito vetrina.
4. **Regole di contenuto**: vedi sezione 7 di `CLAUDE.md`. In sintesi: mai consigli fai-da-te, mai concorrenti, mai dati fiscali inventati, sempre CTA verso `prenotazioni.fenapipiemonte.org`.
5. **Brief e modifiche al sito**: i brief SEO vivono in `Caf-Fenapi/SEO-Fenapi/briefs/`. L'applicazione delle modifiche al sito vero avviene in una sessione separata aperta in `fenapi/`, mai cross-project automatizzata.
6. **Regola di continuità SEO** (vincolante quando lavori in `SEO-Fenapi/`):
   - **All'inizio della sessione** leggi SEMPRE sia `SEO-Fenapi/PROJECT_STATUS.md` sia `SEO-Fenapi/SEO-TRACKER.md`. Senza questi due file la sessione parte cieca.
   - **Salva ogni output nella cartella giusta**:
     - Audit → `SEO-Fenapi/audits/YYYY-MM-DD-audit.md`
     - Brief → `SEO-Fenapi/briefs/NNN-titolo-kebab.md`
     - Contenuti nuovi → `SEO-Fenapi/content/NNN-titolo-kebab.md`
     - Report di avanzamento → `SEO-Fenapi/reports/YYYY-MM-...md`
   - **A fine sessione** aggiorna entrambi i file: `PROJECT_STATUS.md` (stato + prossimi step) e `SEO-TRACKER.md` (nuova riga in cima alla tabella attività con data, agente "Gemini", tipo, cosa fatto, output, problemi, prossimi step). Aggiorna anche "Blocker aperti/risolti" e "Decisioni strategiche" se applicabile.
   - Senza questo passaggio Claude (o un'altra istanza di Gemini) lavorerà alla cieca nella sessione successiva. È **igiene del progetto**, non opzionale. Vedi anche `CLAUDE.md` sezione 9.1 per la versione completa di questa regola.

## Convenzioni

- **Lingua dei contenuti**: italiano
- **Lingua del codice e dei commenti tecnici**: inglese o italiano, indifferente, ma coerente nel singolo file
- **Date nei file**: sempre formato `YYYY-MM-DD` per ordinabilità
- **Naming brief**: `NNN-titolo-kebab-case.md` (es. `001-homepage-meta-tags.md`) per ordinamento naturale
