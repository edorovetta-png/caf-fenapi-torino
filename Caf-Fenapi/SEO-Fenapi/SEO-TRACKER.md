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
| 2026-04-08 | Claude | contenuto | **Eseguito brief 001** in `fenapi/frontend/` su branch `seo/brief-001-foundation`. Applicati tutti i §2–§9: CTA fix (9 file, 36 occorrenze `caffenapi.vercel.app`→`prenotazioni.fenapipiemonte.org`), canonical self-referenziale su 18 pagine HTML, OG/Twitter Card completi su 18 pagine (con `hero_banner.png` 2048×2048 come fallback temporaneo OG image, TODO 7gg per sostituirla con asset 1200×630 dedicato), LocalBusiness schema completo su homepage con `@id`, openingHours, geo, parentOrganization, Service+BreadcrumbList su 8 pagine servizio, BlogPosting+BreadcrumbList su 8 post + Blog+BreadcrumbList su blog index. Creato `vercel.json` con security headers (CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy) + cache `/images/`. Aggiornati `sitemap.xml` (host `www.`, lastmod 2026-04-08 su tutte le URL) e `robots.txt` (sitemap URL `www.`). Titoli pagine servizio arricchiti con "Torino 2026". Check §10 locali passati: 0 residui `caffenapi.vercel.app`, 0 residui apex, 35/35 blocchi JSON-LD parseabili, 21 file modificati, 93 occorrenze `prenotazioni.fenapipiemonte.org`. | `fenapi/frontend/` (21 file), branch `seo/brief-001-foundation` | **TODO aperti**: (1) OG image temporanea `hero_banner.png` 2048×2048 quadrato da sostituire con asset 1200×630 dedicato entro 7gg; (2) Apex redirect è 307 (Vercel default), non 301/308 — SEO preferisce permanent ma è accettato come default piattaforma; (3) Coordinate geo 45.0753, 7.6401 nello schema LocalBusiness sono stima (Nominatim non ha risolto l'indirizzo), da verificare manualmente su Google Maps post-deploy; (4) CSP da testare su preview Vercel per verificare assenza violazioni console | 1) Push branch, verificare preview Vercel: CSP console, OG preview con opengraph.xyz, security headers con curl. 2) Se tutto verde, merge in main per auto-deploy production. 3) Dopo merge: GSC URL Inspection, Rich Results Test live, re-audit `/seo audit` per scoring. 4) Brief 002: chi-siamo/contatti standalone pages. 5) Brief 005: hero WebP + OG image dedicata 1200×630. |
| 2026-04-08 | Claude | brief | Scritto il brief **001 — Foundation** consolidato (canonical + OG + security headers + LocalBusiness schema completo + Service schema per 8 pagine servizio + BreadcrumbList ovunque + Article→BlogPosting + fix CTA `caffenapi.vercel.app`→`prenotazioni.fenapipiemonte.org` in 9 file). Brief totalmente eseguibile in una sessione separata aperta in `fenapi/frontend/`: copre 19 file modificati + 2 creati (`vercel.json`, `og-fenapi-torino.jpg`), 13 sezioni, 10 check di verifica, 6 azioni post-merge. Verificato in advance con grep su `fenapi/frontend/` che i file target esistano e che il count delle occorrenze CTA sia corretto (36 `caffenapi` in 9 file homepage+servizi, 57 `prenotazioni` in 9 file blog). | `briefs/001-foundation-canonical-og-schema-cta.md` | Impatto stimato: 62 → ~78/100. Rischi principali: (1) CSP troppo stretta può rompere la homepage — il brief impone test in Preview deploy prima del merge in production; (2) coordinate geo nel LocalBusiness sono una stima, il brief include un check Nominatim per verificarle; (3) il redirect apex→www va configurato in Vercel dashboard PRIMA del PR altrimenti il canonical diventa incoerente | 1) Utente apre una sessione nuova in `Antigravity/fenapi/` e passa il brief 001 all'agente di implementazione. 2) Dopo merge + deploy, ri-eseguire `/seo audit` e salvare come `audits/2026-04-1X-post-brief-001-audit.md`. 3) Scrivere brief 002 (chi-siamo/contatti standalone pages) e 003 (hero WebP) dopo il merge del 001. |
| 2026-04-08 | Claude | audit | Primo audit completo del sito live eseguito con `/seo audit https://www.fenapipiemonte.org/` (skill claude-seo, inline mode: PSI rate-limited, CWV stimato da asset analysis). Business type rilevato: Local Service CAF. Score **62/100**. Prodotto report + action plan Critical→Low. Dopo l'audit avevo segnalato erroneamente un falso bug NAP "Sagra→Sacra" e una discrepanza orari: **entrambi erano miei errori — il sito è corretto, era il CLAUDE.md a essere impreciso**. Corretto CLAUDE.md §1 (indirizzo) e §4 (orari), rimossa la sezione "Re-scoring" dal report, ridotta a "Note di contesto" neutre. Nessun fix applicato — in attesa di review dell'utente. | `audits/2026-04-08-full-audit-report.md`, `audits/2026-04-08-action-plan.md`, `../CLAUDE.md` (§1 + §4 correzione) | PSI rate-limited (240 QPM) → CWV solo stimato, da rimisurare. Skill claude-seo verificata empiricamente ✅ | 1) Utente legge il report e decide priorità. 2) Primi brief di hotfix (canonical, homepage booking CTA, schema LocalBusiness completo, OG image) per la sessione in `fenapi/`. 3) Ri-eseguire `pagespeed_check.py` fra ~15 min per CWV lab reali. 4) Baseline GSC e GA4 (ancora TODO). |
| 2026-04-08 | Claude | setup | Creazione struttura SEO-Fenapi: cartelle `audits/ briefs/ content/ reports/` (preesistono anche `research/ scripts/`), `SEO-TRACKER.md`, aggiornamento `PROJECT_STATUS.md`. Aggiunte regole di continuità SEO in `../CLAUDE.md` e `../Gemini.md` | `SEO-TRACKER.md`, `content/README.md`, `reports/README.md`, `PROJECT_STATUS.md` (update), `../CLAUDE.md` (sezione 9 + nuova sezione continuità), `../Gemini.md` (regola continuità) | Skill `claude-seo` non ancora verificata empiricamente — si valuta alla prima esecuzione di `/seo audit` | Eseguire primo audit del sito live con `/seo audit` o equivalente, salvare in `audits/2026-04-08-audit.md`. Pull baseline Search Console e GA4 |
| 2026-04-08 | Claude | setup | Creazione iniziale `Caf-Fenapi/`, `CLAUDE.md` con contesto cliente, `Gemini.md`, scaffolding SEO-Fenapi (audits, briefs, research, scripts), `PROJECT_STATUS.md` di SEO-Fenapi | Vedi commit/log filesystem | — | Vedi riga sopra |

---

## Blocker aperti

| Aperto il | Tipo | Descrizione | Impatto | Possibile soluzione |
|---|---|---|---|---|
| 2026-04-08 | accesso esterno | Search Console: l'utente ha accesso ma non c'è ancora un export salvato in `audits/` | Medio — serve per la baseline | Decidere se l'export va fatto manualmente dall'utente (UI Search Console) o via API (richiede credenziali) |
| 2026-04-08 | misura rinviata | PSI API rate-limited durante l'audit (240 QPM) → CWV solo stimato | Basso — stima conservativa già nel report | Ri-eseguire `scripts/pagespeed_check.py` fra ~15 min, allegare output in fondo a `audits/2026-04-08-full-audit-report.md` come sezione "CWV lab update" |
| 2026-04-08 | dato mancante | Conteggio esatto articoli blog in `fenapi/frontend/blog/` non verificato — la sitemap live dichiara 8 articoli blog, da confrontare con i file locali | Basso | Eseguire `ls fenapi/frontend/blog/*.html` all'inizio della prossima sessione |

## Blocker risolti

| Aperto | Risolto | Descrizione | Come è stato risolto |
|---|---|---|---|
| 2026-04-08 | 2026-04-08 | Skill `claude-seo` non verificata empiricamente | Eseguito `/seo audit https://www.fenapipiemonte.org/` con successo. La skill funziona inline (no subagent spawn necessario) e produce report + action plan strutturati. Scripts Python (`fetch_page.py`, `pagespeed_check.py`) sono in `~/.claude/skills/seo/scripts/` e funzionano — unica eccezione il rate-limit PSI. |
| 2026-04-08 | 2026-04-08 | Falso bug NAP: Claude aveva segnalato "Via Sagra" come typo da correggere in "Via Sacra" basandosi su CLAUDE.md §1 | L'utente ha chiarito che **"Via Sagra di San Michele" è il nome vero della via**. Sito, schema, footer e GBP sono corretti. L'errore era nel CLAUDE.md, non nel sito. Corretto CLAUDE.md §1. Lezione: quando sito e documentazione divergono su un dato factual, non assumere che il sito sia sbagliato — chiedere conferma prima di scrivere un "bug in produzione". |
| 2026-04-08 | 2026-04-08 | Orari sito vs CLAUDE.md divergenti | L'orario corretto è quello del sito (Lun–Gio 9–13/14–18 con pausa, Ven 9–12). Corretto CLAUDE.md §4. `openingHoursSpecification` può essere scritto subito senza ulteriori conferme. |

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
