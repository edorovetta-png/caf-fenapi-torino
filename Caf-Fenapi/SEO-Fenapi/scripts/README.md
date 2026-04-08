# scripts/

Script di analisi **read-only** per estrarre dati dal sito vetrina o da fonti esterne.

## Regola assoluta

Gli script qui dentro **NON devono mai modificare file fuori da `Caf-Fenapi/SEO-Fenapi/`**. In particolare, mai scrittura su:

- `fenapi/frontend/` (sito vero)
- `fenapi/caffenapi/` (app prenotazioni)
- Qualsiasi altra cartella di `Antigravity/`

Se uno script ha bisogno di applicare modifiche al sito, allora la modifica si formalizza come brief in `../briefs/` e si applica manualmente in una sessione `fenapi/`.

## Cosa va qui

- Crawler locali (legge file in `fenapi/frontend/` o fa fetch del sito live)
- Estrattori di meta tag, structured data, internal linking
- Parser di export CSV da Search Console / GA4
- Generatori di report che scrivono in `../audits/` o `../research/`
- Tool di confronto tra snapshot temporali (es. ranking nel tempo)

## Cosa NON va qui

- Script one-shot che usi una sola volta → fallo direttamente in chat con Claude/Gemini, non c'è bisogno di committare codice
- Script che modificano il sito → vedi regola assoluta sopra

## Convenzioni

- Linguaggio: Python 3 (coerente con `fenapi/execution/`)
- Output: in `../audits/` o `../research/` con nome datato
- Dipendenze: dichiarate in `requirements.txt` qui dentro se servono librerie non standard (per ora vuoto)
- Path: relativi a `Caf-Fenapi/SEO-Fenapi/`, non assoluti
