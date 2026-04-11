# PROJECT STATUS — SEO-Fenapi

> Ultimo aggiornamento: 2026-04-11 (**Brief 007 APPLICATO** in `fenapi/frontend/` — FAQPage JSON-LD (4 Q&A ciascuna) inserito dopo BreadcrumbList su tutte e 8 le pagine servizio (modello-730, modello-isee, imu-tasi, unico-pf, red, pensioni, successioni, invalidita). Creato `frontend/llms.txt` (llmstxt.org standard, 54 righe, 6 sezioni: Contatti/Servizi/Istituzionali/Blog/Risorse/Optional). Aggiunto commento `llms.txt` in `robots.txt` preservando direttive esistenti. Validazione JSON-LD locale: tutti 8 file = 3 blocks OK. Nessuna rottura DOM/testi/schema esistenti. **Pending**: commit+push+preview Vercel, Rich Results Test, re-audit SEO post-deploy (`audits/2026-04-XX-post-brief-007-audit.md`), aggiornamento SEO-TRACKER. Target: AI Readiness 58→~72, Schema 85→~92.)
> Ultimo aggiornamento precedente: 2026-04-10 (brief 001–006b tutti in production. **Brief 006b COMPLETATO** — inline critical CSS + CSS non-blocking. **PageSpeed finale post-006+006b**: Desktop Performance **98** (FCP 1.6s, LCP **1.9s** GOOD, CLS 0.072, TBT 70ms); Mobile Performance **~65** mediana (FCP 1.2-3.4s, LCP 4.8-5.8s varianza rete, CLS 0.072-0.089, SI 2.5-3.4s). **Render-blocking resources: ZERO**. CLS residuo 0.072 è font-swap inevitabile con `font-display:swap`, sotto soglia GOOD (≤0.1). **Delta complessivo 006+006b**: Desktop 74→**98** (+24), Mobile 56→**~65** (+9), FCP 5.0s→**1.2s**, LCP desktop 4.8s→**1.9s**. Evoluzione score: 62 baseline → 74 post-001 → 80 post-005 → **TBD post-006b** (in attesa re-audit SEO). **Prossimo step**: Brief 007 — FAQPage schema + llms.txt → re-audit → 008-010.)
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

**Fase corrente: POST-BRIEF 006b, PRE-BRIEF 007** — brief 001–006b tutti in production. Performance desktop eccellente (98), mobile migliorato (~65). Render-blocking: ZERO. Prossimo brief: 007 (FAQPage schema + llms.txt).

### Risultati PageSpeed finali post-brief 006 + 006b (2026-04-10)

| Metrica | Mobile (mediana 3 run) | Desktop | Delta vs pre-006 |
|---|---|---|---|
| Performance Score | **~65** | **98** | Mobile +9, Desktop **+24** |
| FCP | 1.2-3.4s | **1.6s** | FCP 5.0s → **1.2s** (best) |
| LCP | 4.8-5.8s (varianza rete) | **1.9s** (GOOD) | Desktop 4.8s → **1.9s** |
| CLS | 0.072-0.089 | **0.072** | Era 0, ora 0.072 (font-swap) |
| TBT | — | **70ms** | 150ms → **70ms** |
| SI | 2.5-3.4s | — | — |
| Render-blocking resources | **ZERO** | **ZERO** | Erano 2 (styles.css + service-page.css) |

**Note**:
- CLS residuo 0.072 è causato dal font-swap (`font-display:swap`) — inevitabile con Google Fonts non self-hosted. Sotto soglia GOOD (≤0.1), non necessita fix.
- LCP mobile ancora alto (4.8-5.8s) per varianza rete — il rendering è immediato (critical CSS inline), il bottleneck residuo è la latenza di rete per l'immagine hero AVIF. Migliorabile con CDN edge cache o self-hosting font (brief futuri).
- Desktop Performance 98 è eccellente — poco margine di miglioramento residuo.

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
- [x] **Brief 001 — Foundation consolidato** (canonical + OG + security headers + schema LocalBusiness/Service/BreadcrumbList + Article→BlogPosting + fix CTA prenotazioni) → `briefs/001-foundation-canonical-og-schema-cta.md`. Mergiato in production.
- [x] **Brief 002 — Hotfix** → mergiato in production
- [x] **Brief 003 — E-E-A-T YMYL** → mergiato in production
- [x] **Brief 004 — Chi-siamo/Contatti** → mergiato in production
- [x] **Brief 005 — OG image + WebP/AVIF + alt** → mergiato in production (commit `921b5c1`)
- [x] **Brief 006 — Google Fonts non-blocking + font pruning** → mergiato in production (commit `2ca24dc`). Google Fonts non più render-blocking ✓, LCP invariato (bottleneck era styles.css).
- [x] **Brief 006b — Inline Critical CSS** → mergiato in production. Render-blocking ZERO. Desktop Performance 98, LCP 1.9s. Mobile ~65, LCP variabile per rete.

### Cosa NON esiste ancora

- [x] Misura PageSpeed post-brief 006 — LCP invariato (5.7s mobile), bottleneck = `styles.css` render-blocking
- [x] Brief 006b — Inline Critical CSS completato. Desktop 98, Mobile ~65, render-blocking ZERO.
- [x] Misura PageSpeed finale post-006+006b — Desktop LCP 1.9s GOOD, CLS 0.072 (font-swap, sotto soglia)
- [ ] Brief 007 — FAQPage schema + llms.txt
- [ ] Re-audit SEO completo post-006b (target score 83-88, pending)
- [ ] Baseline metrics da Search Console (impressions, click, CTR, posizione media)
- [ ] Baseline metrics da GA4 (sorgenti, landing, bounce, conversioni → prenotazioni)
- [ ] Keyword research per territorio Torino
- [ ] Competitor analysis interna (no citazioni pubbliche, da regola §7.2)
- [ ] Audit blog SEO esistente (8 articoli dichiarati in sitemap)

---

## 5. Prossimi Step

### Priorità immediata

1. **Brief 007 — FAQPage schema + llms.txt** — FAQPage schema sulle 8 pagine servizio (+3 punti AI Overviews) + creazione `llms.txt` (fast win residuo). Atteso impatto: AI Readiness 69 → ~75, score complessivo +3-5 punti.
2. **Re-audit SEO completo post-006b** — aggiornare SEO Health Score con i nuovi dati Performance. Target score 83-88.

### Priorità Alta

4. **Brief 008 — Content YMYL**: outbound gov residui su modello-isee + blog post 730, word count espansione modello-isee.
5. **Brief 009 — Local enrichment**: PagineGialle canonical listing, sameAs schema, review acquisition CTA, 1 city page `/servizi/caf-730-torino.html`.
6. **Brief 010 — Schema polish**: Person url homepage, Service @id, aggregateRating quando reviews esistono.
7. **Baseline Search Console** (`audits/004-baseline-search-console.md`): export ultimi 3-6 mesi.
8. **Baseline GA4** (`audits/005-baseline-ga4.md`): sorgenti, top landing, bounce, conversioni.

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
