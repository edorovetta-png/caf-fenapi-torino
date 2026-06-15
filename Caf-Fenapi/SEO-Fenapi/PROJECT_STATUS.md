# PROJECT STATUS — SEO-Fenapi

> Ultimo aggiornamento: 2026-06-15 notte (**Micro-pass 013.1 APPLICATO E IN PRODUZIONE** — chiude le 3 near-miss del re-audit). Commit `0d323e3`, branch `seo/brief-013-1-micropass`, ff su `main`, deploy verificato live (curl, cache-bust). 8 file frontend. **(1) chi-siamo readability RISOLTA** (la regressione del Brief 013): pass di sola leggibilità, periodi spezzati senza toccare contenuto/dati → media frase **25.6 → 9.4 parole**, frasi >18 **70% → ~0%** (target ≤15 / <20% ampiamente centrato). **(2) FAQ floor 134**: portate 12 risposte nel range 134-167 (le 9 a 130-133 del re-audit + 3 emerse applicando il floor stretto: caf-torino ×2, unico-pf ×1) con 1 frase utile ciascuna; ora **36/36 FAQ nel range citabilità 134-167** (era 58%). **(3) modello-730 H2** (top-traffic): 6/7 in forma-domanda answer-first (da 43% a 86%). Gate verdi, zero dati inventati, zero concorrenti, JSON-LD valido su 9/9. Atteso: spinge verso ~88-89. **Next**: re-audit full a 7 agent fra qualche settimana (post ri-crawl Google); quick-win schema/local (sameAs ENFIP, hasMap→Place ID, LocalBusiness caf-torino); Brief 014 security hardening.
> Ultimo aggiornamento precedente: 2026-06-15 sera (**RE-AUDIT MIRATO post-Brief-013 — SEO Health Score 85 → 86/100**). Re-audit sulle 3 categorie toccate dal brief (Content, Schema, AI) + verifica diretta atterraggio; Technical/Performance/Local/Images tenute ai valori del 12/06. **Score 86/100**: Content/E-E-A-T **85** (+4), Schema **97** (+3, target centrato), AI Readiness **85** (+4), On-Page **85** (+1 heading structure); invariate Technical 87, Performance 82, Images 88. Separati: Sitemap **95** (+2, lastmod aggiornati), Local 81 (=). **Atterraggio brief PULITO** (tutti i check meccanici verdi): 6 pagine servizio 902-932 parole, byline 9/9, author @type:Person inline 8/8 blog, dateModified 2026-06-15 8/8, FAQ citabili da 0/36→58% nel range 134-167, H2-domanda da 0%→67%. **Incongruenza unico-pf RISOLTA + verificata**: FAQ ora dice scadenza Modello Redditi PF 31 ott → slitta al 2 nov 2026 (31 ott è sabato — confermato col calendario); "30 novembre" rimosso. **Sotto il target 88-90 per 3 near-miss economici** (micro-pass ~2h = "Brief 013.1"): (1) 🔴 chi-siamo readability PEGGIORATA (25.9 parole/frase, 59% frasi >18 parole — l'espansione ha aggiunto periodi lunghi: unica regressione, va spezzata); (2) ⚠️ 5 risposte FAQ a 131-133 parole, mancano 1-3 parole al floor 134 (pensioni×2, successioni×2, 730×1); (3) ⚠️ modello-730 (top traffic) H2 solo 43% forma-domanda. Report: `audits/2026-06-15-post-brief-013-audit.md`. **Next**: micro-pass 013.1 (chiude a ~88-89), poi quick-win schema/local (sameAs ENFIP, hasMap→Place ID, LocalBusiness caf-torino) + Brief 014 security hardening; re-audit full a 7 agent fra qualche settimana post ri-crawl Google.
> Ultimo aggiornamento precedente: 2026-06-15 (**Brief 013 — Content depth + citability APPLICATO, MERGIATO IN MAIN E IN PRODUZIONE**. Applicato in `fenapi/`, commit `27073a9`, branch `seo/brief-013-content-citability`, fast-forward merge su `main`, Vercel auto-deploy verificato live (curl). 19 file frontend modificati (9 pagine servizio + chi-siamo + 8 blog + sitemap.xml). Tutti i 7 check §9 verdi: (§1) 6 pagine servizio thin a 800+ parole visibili (pensioni 932, successioni 919, invalidita 902, red 907, unico-pf 885, imu-tasi 906), 3 sezioni nuove/pagina (processo/casi tipici/perché) in forma-domanda; (§2) H2 informativi answer-first, ≥5 H2-domanda/pagina; (§3) **tutte le 36 risposte FAQPage** delle 9 pagine servizio nel range 130-175 parole (incl. modello-730, modello-isee, caf-torino, non solo le 6 espanse — il check §9.2 itera su tutte le 9); (§4) byline 9/9 pagine servizio; (§5) author @type:Person inline + dateModified 2026-06-15 su 8/8 blog (datePublished invariato); (§6) outbound .gov 200 OK su caf-torino+chi-siamo; (§7) sitemap lastmod 2026-06-15 su 18 URL. **YMYL**: zero dati fiscali inventati, prosa processuale, rinvii a INPS/AdE per soglie/importi. **Segnalato all'utente**: incongruenza PRE-ESISTENTE su unico-pf (body "30 novembre" vs FAQ "31 ottobre" per scadenza Modello Redditi PF) — non toccata, da chiarire con fonte AdE. Impatto atteso: Content 81→~87, AI 81→~88, Schema 94→~97, **Overall 85→~88-90**. **Next**: re-audit a 1-2 settimane; quick-win schema/local separato (sameAs ENFIP, hasMap→Place ID, LocalBusiness caf-torino); Brief 014 security hardening.)
> Ultimo aggiornamento precedente: 2026-06-12 sera (**Brief 013 SCRITTO — Content depth + citability**, `briefs/013-content-depth-citability.md`, NON ancora applicato). Chiude i finding C1+H1+H2+H3+H5+H8 dell'audit odierno: espansione 6 pagine servizio thin a 800+ parole (pensioni/successioni/invalidita/red/unico-pf/imu-tasi, 408-450 parole live), 36 risposte FAQ da ~62 a 134-167 parole (pattern: 2° paragrafo con entità+dato concreto+CTA), 12 H2 informativi riscritti in forma-domanda (tabella di conversione inclusa, verificati live — gli H2-domanda esistenti sono solo CTA finali), bylines visibili "A cura di Michela Salerno" su 9 pagine servizio (pattern preso dai blog, link a chi-siamo#michela-salerno, test 320px obbligatorio), author `@type:Person` inline su 8 blog post (oggi `@id`-only verificato), `dateModified` aggiornato (oggi tutti fermi a 2026-03-30 = pattern batch flaggato), outbound gov su caf-torino+chi-siamo, sitemap lastmod per le pagine toccate (chiude anche i 12 stale). Fuori scope esplicito: sameAs ENFIP/hasMap/LocalBusiness caf-torino (quick-win separato), security hardening (Brief 014), aggregateRating sync (azione utente). Vincolo §0 rafforzato: ~3.000 parole nuove YMYL → ogni dato fiscale va verificato su fonte istituzionale prima del publish, frasi ≤18 parole. Impatto atteso: Content 81→~87, AI 81→~88, Schema 94→~97, **Overall 85→~88-90**. Effort 3-4h in sessione separata su `fenapi/`, branch `seo/brief-013-content-citability`. **Next**: applicare il brief in `fenapi/`.
> Ultimo aggiornamento precedente: 2026-06-12 (**RE-AUDIT SEO COMPLETO a 7 subagent — SEO Health Score 85/100**). Audit completo eseguito sul sito live (technical, content, schema, sitemap, performance, geo, local) + verifiche dirette di riconciliazione. **Score 85/100** (media pesata 7 categorie core): Technical **87** (era 91; calo da hreflang riclassificato High su language switcher live + HSTS no-preload + CSP unsafe-inline), Content/E-E-A-T **81** (+2), On-Page **84** (−1), Schema **94** (era 95/97; BlogPosting author @id-only + knowsAbout mismatch), Performance **82** (=, lab/no field data), AI Readiness **81** (+2), Images **88** (−2). Separati: Local **81** (GBP ora confermato gestito, ma NAP pollution ENFIP nel sameAs), Sitemap **93** (lastmod stale). **LETTURA: NON è regressione** — nulla è rotto in produzione; il calo da 87 (full audit post-010) / 89 (verifica targeted post-012) è dovuto a (1) riclassificazione gap pre-esistenti ora che il language switcher IT/ES/EN/PT è live senza hreflang, (2) due gap noti mai chiusi (author @id-only, sameAs ENFIP). **Correzioni ai report agent**: canonical su modello-730 è PRESENTE (falso positivo technical agent); caf-torino HA schema (Service+Breadcrumb+FAQ, manca solo LocalBusiness). **3 Critical**: C1 6/9 pagine servizio thin <450 parole (pensioni/successioni/invalidita/red/unico-pf/imu-tasi — Brief 013 prioritario); C2 rimuovere sameAs ENFIP (paginegialle/paginebianche → entità diversa tel 011 7999991); C3 verificare/sincronizzare aggregateRating 4.5/91 hardcoded vs GBP live. Report: `audits/2026-06-12-audit.md`. **Next**: Brief 013 (content depth + citability: espandere 6 pagine servizio a 800+ parole, FAQ a 134-167 parole, H2 in forma-domanda, bylines visibili, author inline) — stimato porta a ~88-90.
> Ultimo aggiornamento precedente: 2026-04-14 sera (**Brief 011+012 MERGIATI IN MAIN E IN PRODUZIONE**. Commit `fd3f5f3` su branch `seo/brief-011-012-final-polish`, fast-forward merge su `main`, Vercel auto-deploy completato e verificato live. **Brief 011 schema micro-fix**: caf-torino.html Service con termsOfService+availableLanguage (coerenza con altre 8 pagine), BreadcrumbList item 3 con URL completo, 8 blog post con publisher BlogPosting espanso inline (`@type: Organization` + `name` + `logo.url`) risolvendo warning Rich Results Test. **Brief 012 sitemap hygiene**: rimossi `<changefreq>` e `<priority>` da 21 URL (Google li ignora), preservati `<loc>` e `<lastmod>`, payload -40% (-42 righe). 10 file modificati, 60 inserzioni, 52 cancellazioni. Verifica live: sitemap 21 loc / 0 deprecated, caf-torino termsOfService presente, blog publisher con logo inline. **Score atteso**: Schema 95→97, Sitemap 90→95, overall 87→~89. **Next**: Brief 013 content citability, Brief 014 security hardening.
> Ultimo aggiornamento precedente: 2026-04-14 (**Re-audit SEO post-brief-010 COMPLETATO**. 7 subagent paralleli. **SEO Health Score: 86 → 87/100** (+1 vs post-007, **+25 vs baseline 62**). Breakdown: Technical 85→**91** (+6), Content 74→**79** (+5), On-Page 82→**85** (+3), Schema 93→**95** (+2), Performance 70→**82** (+12), AI Readiness 73→**79** (+6), Images 90 stable, Local 79→**82** (+3, capped da GBP), Sitemap 95→**90** (-5 tag deprecati). Evoluzione: 62 baseline → 74 post-001 → 80 post-005 → 86 post-007 → **87 post-010**. **Verifica atterraggio brief 010**: 9/9 Service `@id` ✅, Person `url` ✅, Person `image` ✅, `aggregateRating 4.5/91` ✅ (applicati in estensione del brief scritto), 8/9 `termsOfService`+`availableLanguage` (caf-torino manca). **Difetti**: (1) BlogPosting publisher inline `name`+`logo` ❌ NOT LANDED su tutti 8 post (mantengono solo `@id` ref), (2) caf-torino.html Service manca `termsOfService`+`availableLanguage`, (3) caf-torino.html BreadcrumbList item 3 manca `item` URL. **Target score raggiunto parzialmente** (target brief era ~92-95, effettivo 87): gap principale = Mobile LCP 4.8-5.8s variabile rete + GBP listing non verificato. **Gap critici**: (a) Place ID GBP `ChIJB1Bz2pJsiEcROjAcJPkoeVk` in sameAs + aggregateRating 4.5/91 — da verificare che risolva a scheda GBP reale gestita (altrimenti aggregateRating va rimosso/ancorato via itemReviewed); (b) PagineGialle NAP pollution (ENFIP tel 011 7999991) ancora in sameAs. Report completo: `audits/2026-04-14-post-brief-010-final-audit.md`. **Next**: 1) Verificare GBP listing (azione utente). 2) Brief 011 micro-fix schema (caf-torino + publisher inline). 3) Brief 012 sitemap hygiene (rm deprecated tags). 4) Brief 013 content citability (passage 134-167w + H2 in forma-domanda). 5) Brief 014 security hardening (HSTS preload + CSP nonce).
> Ultimo aggiornamento precedente: 2026-04-14 (**Brief 010 MERGIATO IN MAIN E IN PRODUZIONE**. Commit `ffcdf66` su branch `seo/brief-010-schema-polish`, fast-forward merge su `main`, Vercel auto-deploy completato e verificato live. **Schema polish applicato**: Person image+url in index.html (prima mancanti) + image in chi-siamo.html, tag `<img>` visibile nella sezione Michela (400x400 JPG 20KB, circolare, float right), Service `@id` univoco su tutte e 9 le pagine servizio (modello-730, modello-isee, imu-tasi, red, pensioni, unico-pf, successioni, invalidita, caf-torino), **aggregateRating 4.5/91** aggiunto al LocalBusiness (dati GBP reali). Foto `images/michela-salerno.jpg` creata (400x400 JPG q85 progressivo, 20KB). 12 file modificati, 20 inserzioni, 1 file nuovo. Target: rich result eligibility, entity graph consolidation, star rating in SERP. **Next**: re-audit SEO cumulativo post 007+008+009+010 (target ~92-95).
> Ultimo aggiornamento precedente: 2026-04-13 sera (**Brief 009 MERGIATO IN MAIN E IN PRODUZIONE**. Commit `afa4ae4` su branch `seo/brief-009-local-seo`, fast-forward merge su `main`, Vercel auto-deploy completato. **sameAs arricchito** in LocalBusiness: da 3 a 7 URL (aggiunta Facebook Torino, PagineGialle, PagineBianche, GuidaMonaci — tutti NAP-matched, tutti 200 OK). **City page** `/servizi/caf-torino.html` creata con Service+BreadcrumbList+FAQPage schema, areaServed City Torino+Wikidata, 5 sezioni contenuto unico (chi siamo, servizi con internal links, mappa, orari, perche sceglierci). **Sitemap** e **llms.txt** aggiornati. **Internal link** da homepage. **NON applicati** (azioni manuali): GBP non esiste come listing Maps (da creare), CTA recensione in contatti.html (serve PLACE_ID post-GBP). **Next**: creare GBP, re-audit SEO post-009 (target ~90), brief 010 (schema polish).
> Ultimo aggiornamento precedente: 2026-04-13 (**Brief 008 MERGIATO IN MAIN E IN PRODUZIONE**. Commit `c6afd8e` su branch `seo/brief-008-outbound-gov`, fast-forward merge su `main`, Vercel auto-deploy completato e verificato live. **Outbound link .gov.it aggiunti** su 5 pagine servizio (modello-isee, imu-tasi, red, pensioni, invalidita) e 8 blog post. Totale 20 nuovi outbound link verso inps.it, agenziaentrate.gov.it, salute.gov.it, comune.torino.it, finanze.gov.it. Tutti con `target="_blank" rel="noopener noreferrer"`, ancore descrittive, posizionamento FENAPI adiacente. 14 URL unici, tutti verificati 200 OK. Nessuna modifica a layout/schema/CSS/sitemap. **Target impact**: Content/E-E-A-T 66 → **~74** (+8), overall +3-5 punti. **Next**: re-audit SEO post-008 (target ~90), brief 009 (local enrichment), brief 010 (schema polish).
> Ultimo aggiornamento precedente: 2026-04-11 sera (**Brief 007 MERGIATO IN MAIN E IN PRODUZIONE**. Re-audit post-007 eseguito. Score complessivo ~80 → ~86 (+6). AI Search Readiness 58 → ~73 (+15). Schema 85 → ~93 (+8).
> Ultimo aggiornamento precedente: 2026-04-11 (Brief 007 applicato, pending commit+deploy)
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
- [x] **Brief 007 — FAQPage schema + llms.txt** → mergiato in production (commit `299c18b`, merge `4a24541`). 8/8 pagine servizio con FAQPage, llms.txt live. AI Readiness 58→~73, Schema 85→~93.
- [x] **Brief 008 — Outbound link .gov.it YMYL** → mergiato in production (commit `c6afd8e`). 20 outbound link istituzionali su 13 file HTML. Target E-E-A-T 66→~74.
- [x] **Brief 009 — Local SEO sameAs + city page** → mergiato in production (commit `afa4ae4`). sameAs 3→7 URL, city page `/servizi/caf-torino.html` con Service+BreadcrumbList+FAQPage, sitemap+llms.txt aggiornati.
- [x] **Brief 009 follow-up — GBP Place ID + review CTA** → mergiato in production (commit `20c266e`). sameAs 7→8 URL (aggiunto GBP), review CTA in contatti.html.
- [x] **Brief 010 — Schema polish** → mergiato in production (commit `ffcdf66`). Person image+url, Service @id su 9 pagine, aggregateRating 4.5/91, foto Michela 400x400 JPG 20KB.
- [x] **Brief 011+012 — Schema microfix + Sitemap hygiene** → mergiati in production (commit `fd3f5f3`). caf-torino termsOfService/availableLanguage/breadcrumb item, 8 blog post publisher inline, sitemap rimossi changefreq+priority.
- [x] **Brief 013 — Content depth + citability** → applicato, mergiato in production (commit `27073a9`, 2026-06-15). 6 pagine servizio a 800+ parole, 36 FAQ a 130-175 parole, H2 forma-domanda, byline 9/9, author Person inline + dateModified su 8 blog, outbound .gov caf-torino/chi-siamo, sitemap lastmod 18 URL. Tutti i check §9 verdi.

### Cosa NON esiste ancora

- [x] Misura PageSpeed post-brief 006 — LCP invariato (5.7s mobile), bottleneck = `styles.css` render-blocking
- [x] Brief 006b — Inline Critical CSS completato. Desktop 98, Mobile ~65, render-blocking ZERO.
- [x] Misura PageSpeed finale post-006+006b — Desktop LCP 1.9s GOOD, CLS 0.072 (font-swap, sotto soglia)
- [x] Brief 007 — FAQPage schema + llms.txt — completato e in produzione (2026-04-11)
- [x] Brief 008 — Outbound link .gov.it YMYL — completato e in produzione (2026-04-13, commit `c6afd8e`)
- [x] Brief 009 — Local SEO sameAs + city page — completato e in produzione (2026-04-13, commit `afa4ae4` + `20c266e`)
- [x] Brief 010 — Schema polish — completato e in produzione (2026-04-14, commit `ffcdf66`)
- [x] **Re-audit SEO completo post 007-012** (2026-06-12) — 7 subagent paralleli. **SEO Health Score 85/100** (Technical 87, Content 81, On-Page 84, Schema 94, Performance 82, AI 81, Images 88; Local 81, Sitemap 93). Report `audits/2026-06-12-audit.md`. Plateau stabile, no regressione; tetto vincolato da profondità contenuti (Brief 013) + fix off-site GBP.
- [ ] Baseline metrics da Search Console (impressions, click, CTR, posizione media)
- [ ] Baseline metrics da GA4 (sorgenti, landing, bounce, conversioni → prenotazioni)
- [ ] Keyword research per territorio Torino
- [ ] Competitor analysis interna (no citazioni pubbliche, da regola §7.2)
- [ ] Audit blog SEO esistente (8 articoli dichiarati in sitemap)

---

## 5. Prossimi Step

### Priorità immediata

1. **Re-audit SEO completo post-008** — aggiornare SEO Health Score con le migliorie Content/E-E-A-T post brief 007+008. Target score ~90.
2. **Rich Results Test manuale** via GSC sulle 8 pagine servizio (FAQPage dal brief 007).

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
