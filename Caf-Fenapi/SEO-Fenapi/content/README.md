# content/

Contenuti **nuovi** prodotti per il sito vetrina: pagine servizi, articoli blog, landing locali, FAQ, copy.

## Workflow

1. Un brief in `../briefs/` o un audit in `../audits/` identifica un gap di contenuto (es. "manca pagina servizio per pratiche INPS Torino").
2. Si scrive qui il contenuto in Markdown, già rifinito, pronto per essere convertito in HTML nella struttura `fenapi/frontend/`.
3. **Conversione e pubblicazione** avvengono in una sessione separata aperta in `Antigravity/fenapi/`. Si dice all'agente: "pubblica il contenuto `../Caf-Fenapi/SEO-Fenapi/content/NNN-...md` come pagina servizio / articolo blog".
4. L'agente in `fenapi/` crea il file HTML, lo aggancia alla navigazione, aggiorna il blog index se serve, aggiorna `fenapi/PROJECT_STATUS.md`.
5. Si aggiorna lo stato del contenuto qui (draft / ready / published) e si registra in `../SEO-TRACKER.md`.

## Cosa va qui

- Bozze articoli blog (in attesa di pubblicazione)
- Bozze pagine servizio nuove
- Copy per landing locali (es. "CAF Torino quartiere X")
- Microcopy / FAQ riutilizzabili

## Cosa NON va qui

- Brief che descrivono *come* modificare contenuti esistenti → `../briefs/`
- Audit di contenuti esistenti → `../audits/`
- Keyword research → `../research/`

## Struttura di un contenuto

```markdown
# [Titolo H1]

**Tipo**: blog-article | service-page | landing-locale | faq
**Stato**: draft | ready | published | archived
**Creato**: YYYY-MM-DD
**Aggiornato**: YYYY-MM-DD
**Target keyword primaria**: "..."
**Target secondarie**: "...", "..."
**Search intent**: informazionale | transazionale | navigazionale
**Pagina di destinazione in fenapi/**: percorso previsto (es. `frontend/blog/2026-04-pratiche-inps-torino.html`)
**Brief origine**: `../briefs/NNN-...md` se applicabile

---

## Meta tag previsti

- **<title>**: ...
- **<meta description>**: ...
- **Open Graph image**: ...
- **Schema.org**: Article | Service | LocalBusiness | FAQPage

---

## Corpo del contenuto

[Markdown completo, già scritto rispettando le regole di contenuto in `../../CLAUDE.md` sezione 7]

---

## CTA finale

Link a https://prenotazioni.fenapipiemonte.org (obbligatorio, regola 5 di sezione 7)

## Note di pubblicazione

- Internal link da/verso queste pagine esistenti: ...
- Immagini necessarie: ...
- Eventuale aggiornamento sitemap: ...
```

## Naming

`NNN-titolo-kebab-case.md` con numerazione progressiva.

## Vincoli

Tutti i contenuti devono rispettare le **regole di contenuto** in `../../CLAUDE.md` sezione 7: mai consigli fai-da-te, mai concorrenti, mai dati fiscali inventati, sempre CTA verso `prenotazioni.fenapipiemonte.org`, italiano formale-accessibile.
