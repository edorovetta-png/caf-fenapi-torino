# SEO Audit — Post Brief 005 — fenapipiemonte.org

**Data:** 2026-04-09 (pomeriggio, post-merge brief 005)
**URL:** https://www.fenapipiemonte.org/
**Business type:** Local Service (CAF — AccountingService, Circolo FENAPI Provincia di Torino)
**Audit scope:** 7 subagent paralleli (technical, content, schema, sitemap, performance, GEO/AI, local)

---

## 0. Executive Summary

**SEO Health Score: 80/100** (+6 vs 74 post-001, +18 vs 62 baseline)

Il brief 005 ha consegnato il grosso dell'impatto atteso su Content, Schema-image e struttura LCP, ma **il target di Performance (80–85) non è stato raggiunto**: l'LCP reale è ancora **5.7 s** in lab Lighthouse, perché i render-blocking resources (Google Fonts CSS + `styles.css`) ritardano l'avvio del paint, ben prima che l'AVIF preload possa fare effetto. Le ottimizzazioni immagine sono corrette, ma la next bottleneck è il font-loading chain.

### Evoluzione delle 3 misurazioni

| Data | Score | Delta | Milestone |
|---|---|---|---|
| 2026-04-08 | **62/100** | baseline | Primo audit live, pre-brief |
| 2026-04-09 (mattina) | **74/100** | +12 | Post brief 001 Foundation (canonical, OG, schema, headers) |
| **2026-04-09 (pomeriggio)** | **80/100** | **+6** | **Post brief 002 + 003 + 004 + 005 (questo audit)** |

L'impatto cumulato di brief 002-005 è **+6 punti** sul composito, con picchi molto forti su Content (+11) e Performance (+10, anche se in valore assoluto resta "Needs Improvement"). Il gap col target 85 è dovuto interamente a: (a) LCP bloccato dai font, (b) ImageObject dimensions mismatch sui BlogPosting, (c) WebP preload ridondante, (d) manca FAQPage + llms.txt.

---

## 1. Category Scores

| Categoria | Weight | Baseline (04-08) | Post-001 (04-09 mattina) | Post-005 (04-09 pom.) | Δ vs post-001 |
|---|---|---|---|---|---|
| Technical SEO | 22% | 68 | 83 | **85** | +2 |
| Content Quality | 23% | 70 | 68 | **79** | +11 |
| On-Page SEO | 20% | 74 | 80 | **82** | +2 |
| Schema / Structured Data | 10% | 55 | 82 | **83** | +1 |
| Performance (CWV) | 10% | 60 | 60 | **70** | +10 |
| AI Search Readiness | 10% | 55 | 62 | **69** | +7 |
| Images | 5% | n/a | n/a | **90** | ↑ |
| **Weighted Total** | 100% | **62** | **74** | **80** | **+6** |
| | | | | | |
| Local SEO (reported separately) | — | 62 | 71 | **79** | +8 |
| Sitemap (reported separately) | — | n/a | 95 | **95** | 0 |

---

## 2. Validazione brief 005 — tutte le modifiche live

Verificato via curl + grep sulla production:

| Change | Status |
|---|---|
| `<picture>` con 3 source (AVIF / WebP / PNG fallback) | PASS |
| `fetchpriority="high"` su `<img>` del fallback | PASS |
| `loading="eager"` + `decoding="async"` sull'hero img | PASS |
| `<link rel="preload" as="image">` per AVIF + WebP in `<head>` | PASS |
| og:image → `og-fenapi-torino-1200x630.jpg` su 20 file | PASS (HTTP 200, content-type jpeg, 75 KB) |
| og:image:width/height → 1200×630 | PASS |
| LocalBusiness schema `image` → nuovo OG | PASS |
| Logo alt `"FENAPI"` → `"Logo Circolo FENAPI — Provincia di Torino"` su 20 file | PASS (header + footer) |
| Hero alt descrittivo | PASS (index.html linea 250) |
| services_image alt specifico + lazy + async | PASS (index.html linea 408) |
| `hero_banner.avif` servito da Vercel (60 KB) | PASS (HTTP 200, content-type image/avif) |
| `hero_banner.webp` servito da Vercel (154 KB) | PASS (HTTP 200, content-type image/webp) |

Brief 005 è strutturalmente 100% corretto in production.

---

## 3. Technical SEO — 85/100 (+2)

**Strengths**
- robots.txt + sitemap puliti e dichiarati
- Security headers (HSTS, CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy) tutti presenti (brief 001)
- Canonical su homepage corretto, no noindex, no catene redirect
- Strutturato come SSR statico, zero render-blocking JS (GA async), INP-friendly

**Issues**

| Severità | Issue | Fix |
|---|---|---|
| **Medium** | **Dual preload AVIF+WebP**: il browser pre-scarica entrambi ignorando `<source type>` del `<picture>` (il `<link rel="preload">` non rispetta il matching). La preload WebP è ridondante su browser moderni che supportano AVIF e spreca uno slot high-priority. | Rimuovere `<link rel="preload" ... hero_banner.webp>` dal `<head>` di `index.html`, lasciare solo AVIF. Il `<picture>` fallback gestisce comunque i browser senza AVIF. |
| Low | X-Frame-Options + CSP frame-ancestors non consolidati (X-Frame fa ancora lavoro reale perché CSP non ha frame-ancestors) | Futuro cleanup header — aggiungere `frame-ancestors 'self'` a CSP |
| Low | IndexNow non implementato | Aggiungere `/[key].txt` + ping post-deploy via Vercel hook |
| Low | Sitemap `lastmod` delle pagine servizio è 2026-04-08 mentre brief 005 le ha modificate il 2026-04-09 | Bump lastmod al 2026-04-09 sulle 18 pagine toccate da brief 005 |
| Low | Favicon è PNG (non SVG/ICO) | Non-blocking, nice-to-have |

---

## 4. Content Quality / E-E-A-T — 79/100 (+11)

**Il delta più grande dell'audit.** Il cumulato brief 002+003+004 ha consolidato l'E-E-A-T con byline visibili, Person schema stabile, chi-siamo.html dedicata, outbound links Agenzia Entrate su modello-730.

### Breakdown E-E-A-T

| Fattore | Peso | Score | Weighted |
|---|---|---|---|
| Experience | 20% | 72 | 14.4 |
| Expertise | 25% | 80 | 20.0 |
| Authoritativeness | 25% | 78 | 19.5 |
| Trustworthiness | 30% | 83 | 24.9 |
| **Totale** | | | **78.8** |

**Strengths**
- Byline visibile + machine-readable con `<time datetime>` su 8 blog post
- Person schema Michela Salerno con `@id` stabile, referenziato da `author` su tutti i BlogPosting e da AboutPage su chi-siamo
- Profondità tecnica su modello-730.html (precompilato, visto conformità, 730 rettificativo/integrativo 25 ottobre, checklist documenti)
- Profondità tecnica su modello-isee.html (6 tipi ISEE, ISEE Corrente 2 mesi, 25% soglia, D.P.C.M. 159/2013)
- Blog post citano correttamente IRPEF 3-scaglioni + 33% secondo scaglione
- Hedging YMYL ben calibrato ("Per conferma sull'effettiva applicazione, il Circolo FENAPI verifica la normativa aggiornata")
- Contatti coerenti e multi-channel, Privacy+Cookie linkati ovunque
- "Il servizio è gratuito" come trust signal esplicito sull'ISEE
- Alt text brief 005 tutti confermati live e di qualità

**Gaps**

| Severità | Issue | Dove |
|---|---|---|
| **High** | **modello-isee.html ha ZERO outbound link a fonti primarie** (Agenzia Entrate, INPS, D.P.C.M. 159/2013) mentre modello-730.html ne ha 2. Gap residuo da brief 003. | Aggiungere link contestuali alla sezione "Tipi di ISEE" + "ISEE Corrente" |
| High | Blog post `modello-730-2026-scadenze-novita.html` ha ZERO outbound link governativi (solo la pagina servizio corrispondente) | Aggiungere 1 link contestuale (es. "vedi precompilato su Agenzia Entrate") |
| Medium | Nessuna foto dell'autrice Michela Salerno (né su chi-siamo, né in byline) → Experience signal incompleto | Aggiungere foto con `image` in Person schema |
| Medium | modello-isee.html borderline word count (~750 vs 800 min); descrizioni ISEE tipi in grid frammentate | Espandere a 900 parole con esempi d'uso per tipo |
| Low | Email `fenapitorino@gmail.com` (Gmail invece di domain) | Migrare a `info@fenapipiemonte.org` quando possibile |
| Low | Una claim IRPEF nel 730 blog post ("dal 35% al 33%") va riverificata per applicabilità 2026 | Aggiungere nota "Legge di Bilancio 2026" linkata |

### AI Citation Readiness: 74/100
- Strutture fact-unit quotabili, H2 topic-first, tabelle numeriche citabili
- Gap: ISEE service page senza outbound, blog post senza outbound

---

## 5. Schema / Structured Data — 83/100 (+1)

**Brief 005 ha aggiornato `image` su LocalBusiness** e sui 8 BlogPosting al nuovo OG asset. Nessuna regressione.

### Blocks detected

| Page | Blocks | Tipi |
|---|---|---|
| index.html | 2 | LocalBusiness+AccountingService, Person |
| servizi/*.html (8) | 2 cad. | Service, BreadcrumbList |
| blog/*.html (8) | 2 cad. | BlogPosting, BreadcrumbList |
| blog/index.html | 2 | Blog, BreadcrumbList |
| chi-siamo.html | 3 | AboutPage, Person, BreadcrumbList |
| contatti.html | 2 | ContactPage, BreadcrumbList |

**Totale: 35+ blocchi JSON-LD, tutti parseano cleanly, zero errori di sintassi.**

Google Rich Results eligibility:
- LocalBusiness: eligible (all required present)
- BreadcrumbList: eligible ovunque
- BlogPosting: eligible (headline/image/author/datePublished)
- Person: entity reference corretto
- Nessun tipo deprecato (niente HowTo, niente SpecialAnnouncement)

**Issues**

| Severità | Issue | Fix |
|---|---|---|
| **Medium** | **ImageObject dimensions mismatch**: tutti i BlogPosting dichiarano `"width": 2048, "height": 2048` per `og-fenapi-torino-1200x630.jpg` (il sed del brief 005 ha aggiornato l'URL ma non le dimensioni). L'immagine reale è 1200×630. Non blocca Rich Results ma è inaccurato. | Sed globale su 8 blog post: `"width": 2048, "height": 2048` → `"width": 1200, "height": 630` nel contesto ImageObject di BlogPosting |
| Low | Person schema su homepage non ha `url` (null) — chi-siamo.html ha `url: "https://www.fenapipiemonte.org/chi-siamo.html#michela-salerno"` | Aggiungere `url` anche al blocco Person su index.html |
| Low | Service `@id` assente sui blocchi Service delle 8 pagine servizio | Aggiungere `"@id": "https://www.fenapipiemonte.org/servizi/modello-730.html#service"` |

### Fix rapido per +1-2 punti (→ 84-85)
Correggere l'ImageObject dimensions mismatch (sed in 8 file) + aggiungere `url` su Person homepage.

---

## 6. Performance / CWV — 70/100 (+10)

**Measurement method:** Lighthouse CLI lab data (mobile preset, default throttling). PSI public API rate-limited durante l'audit.

### Metriche

| Metrica | Valore | Status |
|---|---|---|
| Performance Score | **70/100** | +10 vs 60 baseline |
| **LCP** | **5,687 ms (5.7 s)** | **POOR** (>4.0 s) |
| FCP | 3.3 s | Needs Improvement |
| CLS | 0 | GOOD |
| TBT | 170 ms | GOOD (INP proxy) |
| TTFB | 20 ms | GOOD |
| Speed Index | 3.3 s | — |

### LCP element = hero AVIF (confermato)
```
<img src="https://www.fenapipiemonte.org/images/hero_banner.avif"
     fetchpriority="high" loading="eager" width="1920" height="1080" ...>
```

Brief 005 è **strutturalmente corretto**: il browser serve AVIF, il preload parte, il fetchpriority è high, le dimensioni esplicite azzerano CLS. Ma l'LCP è comunque a 5.7 s.

### Root cause: render-blocking CSS

| Resource | Blocking | Savings potenziali |
|---|---|---|
| `fonts.googleapis.com` (Lora + Open Sans CSS import) | ~787 ms | Alto |
| `styles.css` (non inlineato critical path) | ~160 ms | Medio |
| **Combinato** | **~2,210 ms** | metricSavings Lighthouse = 3,200 ms |

Il browser non può dipingere l'LCP finché la CSS chain non si risolve. Il preload AVIF è corretto ma aspetta che il CSS parsing finisca.

### Raccomandazioni prioritarie (per brief futuro)

1. **Google Fonts non-blocking** (saving ~800 ms, high impact)
   - Opzione A: self-host Lora + Open Sans + `font-display: swap`
   - Opzione B: pattern `<link media="print" onload="this.media='all'">` per async load
   - Opzione C: `<link rel="preconnect">` già presente, ma va aggiunto `<link rel="preload" as="style">` per la stylesheet Google Fonts
2. **Critical CSS inline** (saving ~160 ms)
   - Estrarre CSS above-the-fold in `<style>` inline nel `<head>`
   - Caricare `styles.css` completo in async
3. **Unused JS** (65 KiB)
   - Audit + tree-shake o defer script non-critici
4. CLS già a 0 — brief 005 ha consegnato questo punto

**Brief suggerito**: "Brief 007 — Critical CSS + Google Fonts non-blocking" — saving LCP atteso: 5.7s → ~2.0s, score Performance atteso 70 → 85-90.

---

## 7. AI Search Readiness / GEO — 69/100 (+7)

### Breakdown

| Dimension | Peso | Score |
|---|---|---|
| Citability | 25% | 68 |
| Structural Readability | 20% | 72 |
| Multi-Modal Content | 15% | 60 |
| Authority & Brand Signals | 20% | 74 |
| Technical Accessibility | 20% | 70 |

### Platform scores
- Google AIO: 66/100 — bloccato da assenza FAQPage
- ChatGPT: 72/100 — Person schema + byline aiutano
- Perplexity: 74/100 — outbound gov + struttura OK
- Bing Copilot: 64/100 — no FAQPage, ContactPage aiuta

### Strengths post brief 003/004/005
- Person schema Michela Salerno stabile + referenziato
- Byline visibile + machine-readable
- Outbound agenziaentrate.gov.it su modello-730
- AboutPage + ContactPage schema
- Nuova OG card brandizzata → migliora social sharing quando snippet vengono condivisi da ChatGPT/Perplexity (indirect citation signal)
- Brand name "Circolo FENAPI" consistente

### Gaps critici

| Severità | Gap | Impatto |
|---|---|---|
| **High** | **llms.txt mancante** (404) | Blocca discoverability LLM-native, #1 fix mancante |
| **High** | **FAQPage schema inesistente** su tutte le pagine | Blocca Google AIO + Bing Copilot snippet extraction |
| Medium | Passages non answer-first (definitional prima, risposta dopo) | Degrada snippet selection AI Overviews |
| Medium | Blog post senza outbound gov | Passage authority ridotta |
| Low | robots.txt usa wildcard senza explicit allowlist per GPTBot/PerplexityBot/ClaudeBot | Missed trust signal |
| Low | No Wikipedia entity, no Reddit/YouTube brand presence | Gap off-site |

### Top-5 prioritized
1. **llms.txt** (effort: 1 file, impact: alto)
2. **FAQPage schema** su 3 blog post top + 8 pagine servizio (brief 006 candidate)
3. **Answer-first rewrites** sezioni principali (editorial)
4. **Outbound gov** su blog post modello-730
5. **Explicit robots.txt allow-list** per AI crawlers

---

## 8. Local SEO — 79/100 (+8)

### Breakdown

| Dimension | Peso | Score |
|---|---|---|
| GBP Signals | 25% | 72 |
| Reviews & Reputation | 20% | 45 |
| Local On-Page SEO | 20% | 88 |
| NAP Consistency & Citations | 15% | 72 |
| Local Schema Markup | 10% | 92 |
| Local Link & Authority | 10% | 55 |

**Driver del delta +8**: unified NAP (brief 002), contatti.html dedicata con Maps embed (brief 004), GBP category fix "Sindacato" → "Servizio di assistenza fiscale" (2026-04-08, fuori-brief ma highest-leverage dell'intero ciclo).

### NAP Consistency (check)
- "Via Sagra di San Michele" coerente su 20 file HTML + schema + footer ✓
- Zero residui "Via Sagra S. Michele" (pre-brief-002) ✓
- Minor: virgola dopo "53" inconsistente chi-siamo body vs footer
- Minor: phone display format varia (`+393517091611` vs `+39 351 709 1611` vs `351 709 1611`)

### LocalBusiness schema completeness: 85-90%
- PASS: @type, name, address, telephone, url, geo (6 decimali), openingHours, priceRange, areaServed, @id
- **MISSING**: `aggregateRating`, `sameAs` (GBP Place URL + Facebook), `hasMap`

### Issues critici

| Severità | Issue |
|---|---|
| **Critical** | Reporting del subagent: `servizi.html` → 404. Se era indicizzato va redirect 301 ad asset esistente. **Da verificare** se è falso positivo (l'index non ha un file `servizi.html` diretto, solo `servizi/*.html`). |
| **Critical** | PagineGialle: nessun listing per Circolo FENAPI. L'entry ENFIP alla stessa via con telefono diverso è **citation pollution risk**. |
| High | Nessuna review raccolta → no `aggregateRating` → no rich snippet stars in SERP locale |
| High | `sameAs` assente nel LocalBusiness schema (no GBP Place URL, no Facebook) |
| Medium | Nessuna pagina servizio city-keyed (`/caf-torino.html`, `/730-torino.html`) — #1 fattore organico locale per Whitespark 2026 |
| Medium | `areaServed` non include "Regione Piemonte" (chi-siamo.html lo dice nel body) |
| Low | Formato telefono non standardizzato |
| Low | Hours Venerdì Michela 16:30 non esprimibile in GBP standard hours |

### Raccomandazioni top-5
1. Verificare `servizi.html` 404 (falso positivo o bug reale?)
2. Creare listing PagineGialle canonico per Circolo FENAPI
3. Avviare campagna review acquisition (CTA su contatti.html + post-appuntamento)
4. Aggiungere `sameAs` al LocalBusiness (GBP Place URL + Facebook)
5. Creare 1-2 service page city-keyed (es. `/servizi/caf-730-torino.html`)

---

## 9. Sitemap — 95/100 (invariato)

Tutti i check passano:
- HTTP 200 + content-type application/xml ✓
- XML well-formed ✓
- 20 URL totali (1 home + 2 brief 004 + 8 servizi + 1 blog index + 8 blog post) ✓
- Tutti host `www.`, zero apex ✓
- lastmod presente su 20/20 ✓
- robots.txt punta a `www.` sitemap ✓
- 7/7 URL spot-checked → HTTP 200 ✓

**Nota info**: `priority`/`changefreq` ancora presenti (ignorati da Google, rimovibili in prossimo ciclo). Brief 005 non ha modificato il sitemap → lastmod delle 18 pagine touched dal brief resta 2026-04-08 (issue Low segnalata in Technical §3).

---

## 10. Action Plan Prioritizzato

### Critical (fix immediato)
1. **Verificare `servizi.html` 404** segnalato dal subagent local — se falso positivo chiudere, altrimenti redirect 301
2. **Fix ImageObject dimensions mismatch** sui 8 BlogPosting: 2048×2048 → 1200×630 (sed single-line per file, +1-2 punti Schema)
3. **Rimuovere WebP preload ridondante** da index.html `<head>` (evita slot high-priority sprecato)

### High (entro 1 settimana)
4. **Brief 006 candidate — Critical CSS + Google Fonts non-blocking**: saving LCP atteso 5.7s → ~2.0s, +15 punti Performance
5. **Brief 006 (secondario) — FAQPage schema** su 3 blog post top + 8 servizi, +3 punti AI Overviews
6. **llms.txt** da aggiungere (1 file, +2 punti GEO)
7. **modello-isee.html outbound**: aggiungere link contestuale ad Agenzia Entrate + INPS + D.P.C.M. 159/2013 (gap residuo brief 003)
8. **modello-730 blog post outbound**: aggiungere link contestuale gov
9. **PagineGialle listing** canonico per Circolo FENAPI (rimuovi confusione ENFIP)
10. **Review acquisition campaign**: CTA su contatti.html, goal 3-5 review entro 30 giorni

### Medium (entro 1 mese)
11. Person schema `url` su homepage
12. `sameAs` su LocalBusiness (GBP Place URL + Facebook)
13. Sitemap `lastmod` bump al 2026-04-09 sulle 18 pagine toccate da brief 005
14. `changefreq`/`priority` cleanup dal sitemap
15. Phone display standardizzato `+39 351 709 1611`
16. `areaServed` allargato a "Regione Piemonte"
17. modello-isee.html word count → ~900 (espandere sezioni ISEE tipi)
18. Foto Michela Salerno su chi-siamo.html + Person.image
19. Service `@id` sui 8 Service blocks

### Low (backlog)
20. IndexNow implementation
21. Favicon SVG
22. Email domain (@fenapipiemonte.org invece di Gmail)
23. X-Frame-Options + CSP frame-ancestors consolidamento
24. City-keyed service pages (fattore #1 organico locale)
25. Explicit robots.txt allow-list AI crawlers
26. Answer-first paragraph rewrites su sezioni principali

---

## 11. Brief suggeriti per il prossimo ciclo

| # | Titolo | Focus | Expected delta |
|---|---|---|---|
| **006** | **Performance: Critical CSS + Google Fonts non-blocking** | LCP 5.7→~2.0s, self-host fonts o font-display swap, critical CSS inline | **+6-8 punti totali**, Performance 70→85-90 |
| 007 | FAQPage schema + llms.txt + explicit AI crawler allowlist | 3 blog post + 8 servizi, FAQPage 3-5 Q&A/pagina | +3-4 punti AI, +2 punti Schema |
| 008 | Content YMYL completamento outbound | modello-isee + blog post gov links, word count isee | +2 punti Content |
| 009 | Local enrichment | PagineGialle listing, sameAs schema, review campaign setup, 1 city page | +3 punti Local |
| 010 | Schema polish | ImageObject dims fix (CRITICAL fast win), Person url, Service @id, aggregateRating | +2 punti Schema |

**Score target post-006+007+008+009+010**: ~88-90/100.

---

## 12. Limitations

- **PSI public API rate-limited** durante questo audit → metriche CWV da Lighthouse CLI lab (non field). Da ri-misurare con PSI production in ~15 minuti o dopo 24h.
- **CrUX field data**: non disponibile (sito sotto soglia traffic per CrUX aggregate).
- **DataForSEO / GSC API / GA4 API**: non invocate in questo audit (credenziali non disponibili o non verificate).
- **GBP dashboard live data**: review count, rating, photo count, Q&A, completeness non accessibili senza autenticazione Manager.
- **Proximity factor** (~55% varianza ranking local pack per Search Atlas ML): out of control, non ottimizzabile.
- **servizi.html 404**: segnalato dal subagent local ma non confermato cross-check — da verificare manualmente se è un falso positivo (il repo ha solo `servizi/*.html`, non `servizi.html`).

---

## 13. Conclusione

Brief 005 è **strutturalmente corretto e 100% live in production**. Tutti i deliverable sono verificabili: OG image 75 KB 1200×630 brandizzata, hero AVIF 60 KB + WebP 154 KB in `<picture>` con preload, alt text audit completato su 20 file, LocalBusiness + BlogPosting image aggiornate. Lo score sale da 74 a **80/100 (+6)**.

Il gap col target 85 è dovuto a **una bottleneck non anticipata dal brief**: il render-blocking del CSS Google Fonts impedisce all'AVIF preload di effettivamente abbattere l'LCP. Il brief è stato tecnicamente corretto sul suo scope, ma il problema Performance si è rivelato più multi-layer di quanto l'audit 2026-04-09 mattina avesse previsto.

**Prossimo step strategico**: brief 006 dedicato al font-loading chain + critical CSS. Quel singolo intervento dovrebbe portare l'LCP sotto 2.5s e lo score composito sopra 85.

In parallelo, 3 "fast wins" da chiudere in pochi minuti: (1) ImageObject dimensions sed sui blog post, (2) rimozione WebP preload ridondante, (3) llms.txt. Combinati valgono ~+3 punti con effort minimo.
