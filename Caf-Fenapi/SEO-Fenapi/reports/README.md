# reports/

Report periodici di **avanzamento** del progetto SEO. Snapshot in un dato momento, datati.

## Differenza con `audits/`

- **`audits/`** = analisi tecnica del sito (cosa c'è, cosa manca, cosa è rotto). Snapshot dello *stato del sito*.
- **`reports/`** = avanzamento del *lavoro SEO* (cosa è stato fatto, cosa ha portato, KPI rispetto al baseline). Snapshot del *progetto*.

Un audit risponde a "com'è il sito oggi?". Un report risponde a "cos'abbiamo fatto e cosa ha funzionato?".

## Cosa va qui

- Report mensili / trimestrali di avanzamento (KPI, click, posizioni, conversioni, brief applicati, contenuti pubblicati)
- Confronti before/after dopo l'applicazione di un brief importante
- Report di fine ciclo (es. "primi 3 mesi di SEO", "anno 2026")
- Sintesi presentabili alla titolare (la madre dell'utente) — niente gergo SEO, focus su risultati concreti

## Cosa NON va qui

- Audit tecnici → `../audits/`
- Brief / contenuti / research → cartelle dedicate
- Numeri grezzi senza interpretazione → meglio in `../audits/`

## Naming

`YYYY-MM-report-<scope>.md` per i ricorrenti, es:
- `2026-05-report-mensile.md`
- `2026-Q2-report-trimestrale.md`
- `2026-04-08-baseline-iniziale.md`

## Struttura tipica

```markdown
# Report [periodo]

**Periodo coperto**: YYYY-MM-DD → YYYY-MM-DD
**Generato**: YYYY-MM-DD
**Confronto con**: report precedente / baseline iniziale

## Sintesi (per la titolare, niente gergo)
3-5 punti chiari con risultati concreti.

## KPI principali
| Metrica | Periodo precedente | Periodo corrente | Variazione |
|---|---|---|---|
| Click organici (Search Console) | ... | ... | ... |
| Impressions | ... | ... | ... |
| CTR medio | ... | ... | ... |
| Posizione media | ... | ... | ... |
| Conversioni → prenotazioni | ... | ... | ... |
| Top landing page | ... | ... | ... |

## Lavoro completato nel periodo
- Brief applicati: lista con link a `../briefs/NNN-...md`
- Contenuti pubblicati: lista con link a `../content/NNN-...md`
- Audit eseguiti: lista con link a `../audits/NNN-...md`

## Cosa ha funzionato
...

## Cosa non ha funzionato / da rivedere
...

## Prossimo periodo: focus
...
```
