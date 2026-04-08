# PROJECT STATUS — SEO-Fenapi

> Ultimo aggiornamento: 2026-04-08 (aggiunte cartelle `content/` e `reports/`, creato `SEO-TRACKER.md` per continuità tra sessioni, registrata regola di continuità SEO in `../CLAUDE.md` e `../Gemini.md`)
> File condiviso tra Claude e Gemini. Leggilo prima di ogni task, aggiornalo dopo modifiche significative.
>
> **Continuità sessioni**: oltre a questo file, leggi e aggiorna SEMPRE anche `SEO-TRACKER.md` in questa stessa cartella. Il PROJECT_STATUS descrive lo *stato*, il TRACKER traccia *cosa è stato fatto sessione per sessione*.

---

## 1. Descrizione del Progetto

**SEO-Fenapi** è il workspace di analisi, strategia e produzione brief per migliorare la SEO del sito vetrina del **Circolo FENAPI — Sede Provinciale di Torino** (`https://www.fenapipiemonte.org/`).

### Scope

Questo progetto **NON modifica direttamente il sito**. Produce:

- **Audit tecnici e di contenuto** del sito live
- **Keyword research e analisi competitor** per il territorio di Torino
- **Brief di ottimizzazione** strutturati, da applicare poi manualmente in `fenapi/frontend/`
- **Script di analisi read-only** che estraggono dati dal sito senza modificarlo

L'implementazione delle modifiche al sito avviene in una sessione Claude/Gemini separata aperta nella cartella `fenapi/`, partendo dal brief prodotto qui. Questa separazione è una scelta esplicita per **non rischiare di rompere il sito in produzione, l'app prenotazioni, i redirect o la sync Google Calendar**.

Per il contesto cliente (servizi, target, brand, vincoli, regole di contenuto) vedi `../CLAUDE.md`.

---

## 2. Tech Stack

| Componente | Tecnologia |
|---|---|
| Audit / brief / research | Markdown |
| Toolkit principale | Skill **`claude-seo`** ([github.com/AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo)) — comandi `/seo *` in Claude Code per audit, keyword research, analisi tecnica |
| Script di analisi | Python 3 (crawler locale, estrazione meta, structured data, internal linking) per esigenze non coperte dalla skill |
| Fonti dati esterne | Google Search Console, Google Analytics 4 (`G-YNHWG87MSQ`), Google Business Profile (gestito dalla titolare), eventuali tool SEO terzi |
| Formato dati esportati | CSV / JSON in `audits/` o `research/` |

Non c'è build, non c'è deploy, non c'è database. È un workspace di analisi.

---

## 3. Struttura delle Cartelle

```
Caf-Fenapi/SEO-Fenapi/
├── PROJECT_STATUS.md          # Stato operativo del sotto-progetto (questo file)
├── SEO-TRACKER.md             # Continuità tra sessioni: log attività, blocker, decisioni
├── audits/                    # Output di audit (tecnici, contenuto, baseline) — formato YYYY-MM-DD-audit.md
│   └── README.md
├── briefs/                    # Brief di ottimizzazione numerati (NNN-titolo-kebab.md)
│   └── README.md
├── content/                   # Contenuti nuovi: pagine servizi, articoli blog, landing locali
│   └── README.md
├── reports/                   # Report periodici di avanzamento (mensili/trimestrali, KPI, before/after)
│   └── README.md
├── research/                  # Keyword research, competitor analysis, persona, SERP
│   └── README.md
└── scripts/                   # Script di analisi read-only (Python)
    └── README.md
```

> **Nota cartelle**: la struttura "ufficiale" richiesta dall'utente è `audits/ briefs/ content/ reports/`. Le cartelle `research/` e `scripts/` esistono dalla creazione iniziale del progetto e sono state mantenute perché complementari (research separa la fase di analisi strategica dai brief operativi; scripts contiene tool read-only riutilizzabili). Se in futuro si decide di consolidare, vanno svuotate prima di rimuoverle e l'eventuale contenuto migra in `audits/` o `research/`.

---

## 4. Stato Attuale

**Fase corrente: PRE-AUDIT** (progetto appena creato, nessuna analisi prodotta)

### Cosa esiste già

- [x] Cartella creata in `Antigravity/Caf-Fenapi/SEO-Fenapi/`
- [x] Struttura `audits/ research/ briefs/ scripts/` con README di scope per ognuna
- [x] `CLAUDE.md` e `Gemini.md` di parent (`Caf-Fenapi/`) con contesto consolidato del cliente
- [x] Vincoli di non-rottura documentati in `../CLAUDE.md` sezione 8
- [x] Indirizzo sede registrato in `../CLAUDE.md` sezione 1 (Via Sacra di San Michele 53, 10141 Torino) — utile per local SEO e structured data LocalBusiness
- [x] Google Business Profile registrato in `../CLAUDE.md` sezione 5, con nota "gestito dalla titolare"
- [x] Skill `claude-seo` registrata come toolkit principale in `../CLAUDE.md` sezione 9 e in questo file (sezione 2)
- [x] Cartelle `content/` e `reports/` create con README di scope
- [x] `SEO-TRACKER.md` creato come file di continuità tra sessioni (log attività, blocker, decisioni strategiche)
- [x] Regola di continuità SEO documentata in `../CLAUDE.md` (nuova sezione) e in `../Gemini.md` (sezione "Regole specifiche per Caf-Fenapi")

### Cosa NON esiste ancora

- [ ] Audit tecnico iniziale del sito live
- [ ] Baseline metrics da Search Console (impressions, click, CTR, posizione media)
- [ ] Baseline metrics da GA4 (sorgenti traffico, landing page top, bounce, conversioni → prenotazioni)
- [ ] Keyword research per territorio Torino
- [ ] Competitor analysis (CAF concorrenti su Torino — solo per analisi interna, MAI menzionati nei contenuti pubblici)
- [ ] Audit on-page: title, meta description, H1, structured data, internal linking
- [ ] Audit tecnico: Core Web Vitals, sitemap, robots.txt, mobile, indexability
- [ ] Audit blog SEO esistente (8 articoli in `fenapi/frontend/blog/`)

---

## 5. Prossimi Step

### Priorità Alta — Setup e baseline

1. **Verificare il link Vercel del sito vetrina**: capire qual è il progetto Vercel di produzione che serve `fenapipiemonte.org`, per sapere dove guardare logs/analytics di deploy senza toccarlo. Solo lettura.
2. **Audit tecnico iniziale del sito live** (`audits/001-audit-tecnico-iniziale.md`): crawl read-only, estrazione di tutti i meta tag, structured data presenti, status code, redirect chain, sitemap, robots.txt, hreflang (se presente), Core Web Vitals via PageSpeed Insights.
3. **Baseline Search Console** (`audits/002-baseline-search-console.md`): export ultimi 3-6 mesi di query, click, impressions, CTR, posizione media. Top 50 query, top 50 landing page, query con CTR basso ma posizione decente (= quick wins).
4. **Baseline GA4** (`audits/003-baseline-ga4.md`): sorgenti di traffico, top landing page, bounce rate, conversioni verso `prenotazioni.fenapipiemonte.org` (UTM `utm_source=sito` già taggati).

### Priorità Media — Strategia

5. **Persona e intenti di ricerca** (`research/001-persona-intenti.md`): formalizzare pensionati/lavoratori/famiglie come segmenti, mappare intenti di ricerca tipici per ognuno.
6. **Keyword research territoriale** (`research/002-keyword-research-torino.md`): keyword "CAF Torino", "730 Torino", "ISEE Torino", varianti con quartieri, long-tail informazionali (es. "come fare ISEE 2026 Torino"). Categorizzazione per intent.
7. **Audit on-page del sito esistente** (`audits/004-audit-on-page.md`): per ogni pagina servizio + homepage + blog, valutare title/meta/H1/structured data contro le keyword target identificate.
8. **Audit blog esistente** (`audits/005-audit-blog.md`): valutare i 8 articoli pubblicati in termini di profondità, freshness, internal linking, opportunità di miglioramento.

### Priorità Bassa — Esecuzione iterativa

9. **Brief di ottimizzazione iterativi** in `briefs/`, in ordine di impatto stimato. Ogni brief è autosufficiente, applicabile in una sessione Claude in `fenapi/`, contiene: pagine coinvolte, modifiche puntuali (titoli, meta, H1, internal link, structured data, contenuti), motivazione SEO, expected impact.
10. **Scripts di analisi** in `scripts/` solo quando un'analisi va ripetuta (es. crawl mensile). Se serve una sola volta, fallo direttamente in chat.

---

## 6. Vincoli di non-rottura — IMPORTANTE

Riportati per comodità, fonte completa in `../CLAUDE.md` sezione 8.

| Cosa | Perché |
|---|---|
| Non modificare URL esistenti del sito vetrina | Rompe link esterni e ranking SEO esistente — sempre con redirect 301 e solo se strettamente necessario |
| Non toccare `prenotazioni.fenapipiemonte.org` né i suoi DNS/redirect | Rompe l'app di prenotazione e la sync Calendar |
| Non toccare `fenapi/caffenapi/` | Repo separato, gestito via Lovable |
| Non rimuovere il codice UTM tracking dormiente | È in stand-by dopo rollback 2026-04-07, da riattivare in futuro |
| Non rimuovere structured data esistenti senza sostituzione | Sono già indicizzati |
| Le regole di contenuto valgono anche per i meta tag e gli snippet generati | Sezione 7 di `../CLAUDE.md` |

---

## 7. Glossario (per non confondere progetti)

- **fenapi/** (in Antigravity, fuori da Caf-Fenapi) = il sito reale + app prenotazioni
- **Caf-Fenapi/** = cartella ombrello per progetti CAF futuri (questo workspace)
- **SEO-Fenapi/** = questo progetto, analisi SEO read-only
- **Circolo FENAPI** = il cliente, sede di Torino
- **fenapipiemonte.org** = il dominio del sito vetrina
- **prenotazioni.fenapipiemonte.org** = sottodominio app prenotazioni (NON toccare)
