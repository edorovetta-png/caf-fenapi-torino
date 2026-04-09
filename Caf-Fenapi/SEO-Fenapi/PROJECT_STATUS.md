# PROJECT STATUS — SEO-Fenapi

> Ultimo aggiornamento: 2026-04-08 (brief 001 Foundation **applicato** in `fenapi/frontend/` su branch `seo/brief-001-foundation`. 21 file modificati, 35 JSON-LD validati localmente, check §10 passati. In attesa di push+preview Vercel+merge. OG image usa fallback temporaneo `hero_banner.png` — TODO 7gg per sostituirla con asset 1200×630 dedicato.)
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

**Fase corrente: POST-AUDIT, PRE-FIX** — primo audit completo prodotto, in attesa che l'utente legga e decida le priorità prima di qualsiasi brief di hotfix.

### Riepilogo audit 2026-04-08

- **SEO Health Score**: **62/100**
- **Business type rilevato**: Local Service (CAF)
- **Punteggi per categoria** (vedi report completo):
  - Technical SEO: 68
  - Content Quality (E-E-A-T): 66
  - On-Page SEO: 74
  - Schema / Structured Data: 55
  - Performance (CWV stimato): 72 — PSI rate-limited, da rimisurare
  - AI Search Readiness: 58
  - Images: 70
- **Issue più gravi (Critical/High)**:
  1. Nessun `<link rel="canonical">` su nessuna pagina + mismatch `www.` vs apex nella sitemap
  2. Schema `LocalBusiness` minimale — mancano `openingHoursSpecification`, `geo`, `image`, `postalCode`, `addressRegion`, `priceRange`, `sameAs`
  3. Booking CTA homepage punta a `caffenapi.vercel.app` invece del canonico `prenotazioni.fenapipiemonte.org` (il blog è già corretto)
  4. Mancano `og:image`, `og:url`, `og:locale`, `twitter:card` ovunque
  5. Pagine servizio senza schema; blog con `Article` ma senza `image` + `dateModified`; nessun `BreadcrumbList`
  6. Security headers mancanti (solo HSTS presente)

### Cosa esiste già

- [x] Cartella creata in `Antigravity/Caf-Fenapi/SEO-Fenapi/`
- [x] Struttura `audits/ research/ briefs/ scripts/ content/ reports/` con README di scope
- [x] `CLAUDE.md` e `Gemini.md` di parent (`Caf-Fenapi/`) con contesto consolidato del cliente
- [x] Vincoli di non-rottura documentati in `../CLAUDE.md` sezione 8
- [x] Indirizzo sede registrato in `../CLAUDE.md` §1 (Via Sacra di San Michele 53, 10141 Torino) — usato come oracolo di confronto col sito live
- [x] Google Business Profile registrato in `../CLAUDE.md` §5, aggiornamenti 2026-04-08 (accesso Gestore, categoria, duplicato rimosso)
- [x] Skill `claude-seo` registrata come toolkit principale e **verificata empiricamente** col primo audit
- [x] `SEO-TRACKER.md` creato come file di continuità tra sessioni
- [x] Regola di continuità SEO documentata in `../CLAUDE.md` e in `../Gemini.md`
- [x] **Audit tecnico + contenuto + schema + performance iniziale del sito live** → `audits/2026-04-08-full-audit-report.md`
- [x] **Action plan prioritizzato Critical→Low** → `audits/2026-04-08-action-plan.md`
- [x] **Brief 001 — Foundation consolidato** (canonical + OG + security headers + schema LocalBusiness/Service/BreadcrumbList + Article→BlogPosting + fix CTA prenotazioni) → `briefs/001-foundation-canonical-og-schema-cta.md`. Eseguibile in una sessione aperta in `fenapi/frontend/`. Expected impact: 62 → ~78/100.

### Cosa NON esiste ancora

- [ ] Decisione dell'utente sulle priorità post-audit (in corso)
- [ ] Primo brief di hotfix (vedi sezione "Prossimi Step" sotto per l'ordine proposto)
- [ ] Baseline metrics da Search Console (impressions, click, CTR, posizione media)
- [ ] Baseline metrics da GA4 (sorgenti, landing, bounce, conversioni → prenotazioni)
- [ ] Misura CWV lab reale via PSI (rinviata per rate-limit)
- [ ] Keyword research per territorio Torino
- [ ] Competitor analysis interna (no citazioni pubbliche, da regola §7.2)
- [ ] Audit blog SEO esistente (8 articoli dichiarati in sitemap)

---

## 5. Prossimi Step

### Priorità immediata — In attesa dell'utente

0. **L'utente legge `audits/2026-04-08-full-audit-report.md` + `audits/2026-04-08-action-plan.md`** e decide quali issue diventano brief di hotfix. Non applicare nessun fix prima di questo passaggio.

### Priorità Alta — Subito dopo la review dell'utente

Ordine di attacco suggerito (impatto/sforzo):

1. **`briefs/001-foundation-canonical-og-security.md`** — pacchetto "fondamenta": `<link rel="canonical">` self-referenziale su tutte le pagine, risoluzione www-vs-apex (scegliere host canonico + 301), OG metadata completi (`og:image` 1200×630, `og:url`, `og:locale`, `og:site_name`, `twitter:card`), security headers in `vercel.json`/`vercel.ts`. **Sforzo**: ~2-3 h. **Impatto**: alto (tocca tutte le pagine, abilita indicizzazione pulita e condivisioni social).
2. **`briefs/002-schema-localbusiness-service-breadcrumb.md`** — pacchetto schema: upgrade `LocalBusiness` homepage con `openingHoursSpecification` (9–13/14–18 Lun–Gio, 9–12 Ven), `geo`, `image`, `postalCode`, `addressRegion`, `priceRange`, `sameAs`, `foundingDate` 1992, `areaServed` Torino; aggiunta `Service` schema su ognuna delle 8 pagine servizio; `BreadcrumbList` ovunque; aggiunta `image` + `dateModified` + `BlogPosting` sui blog post. **Sforzo**: ~3 h. **Impatto**: alto (sblocca rich results, coerenza entità con GBP).
3. **`briefs/003-homepage-booking-cta.md`** — microfix: sostituire `caffenapi.vercel.app` con `prenotazioni.fenapipiemonte.org` sulla homepage mantenendo gli UTM. **Sforzo**: 15 min. **Impatto**: medio (coerenza brand + conversion tracking).
4. **`briefs/004-chi-siamo-contatti-pages.md`** — promuovere `#chi-siamo` e `#contatti` da ancore della homepage a pagine standalone indicizzabili. **Sforzo**: ~2 h. **Impatto**: alto per query local ("contatti CAF Torino", "chi è FENAPI Torino") + apre lo spazio per bio autore credenziali (leva E-E-A-T YMYL).
5. **`briefs/005-hero-image-webp.md`** — conversione `hero_banner.png` → WebP/AVIF con `<picture>`, `fetchpriority="high"`. **Sforzo**: ~1 h. **Impatto**: medio (LCP mobile).
6. **Baseline Search Console** (`audits/004-baseline-search-console.md`): export ultimi 3-6 mesi (query, click, impressions, CTR, posizione media). Top 50 query, top 50 landing, query con CTR basso ma posizione decente (= quick wins).
7. **Baseline GA4** (`audits/005-baseline-ga4.md`): sorgenti, top landing, bounce, conversioni verso `prenotazioni.fenapipiemonte.org`.
8. **Ri-misura CWV lab** via `scripts/pagespeed_check.py` — la prima run è stata rate-limited. Allegare output al report.

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
