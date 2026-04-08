# briefs/

Brief di modifica SEO pronti da applicare al sito vetrina (`fenapi/frontend/`).

## Workflow

1. Un audit (`../audits/`) o una research (`../research/`) identifica un'opportunità.
2. Si crea qui un brief auto-sufficiente con tutto quanto serve per applicarlo.
3. **L'applicazione avviene in una sessione separata** aperta in `Antigravity/fenapi/`. Si dice all'agente: "applica il brief `../Caf-Fenapi/SEO-Fenapi/briefs/NNN-...md`".
4. L'agente legge il brief, applica le modifiche in `fenapi/frontend/`, aggiorna `fenapi/PROJECT_STATUS.md`, committa nel repo.
5. Si aggiorna lo stato del brief qui (vedi sezione "Stato" sotto) — fatto / parziale / annullato.

Questa separazione è una scelta di sicurezza: SEO-Fenapi non scrive mai direttamente sul sito. Vincoli di non-rottura in `../../CLAUDE.md` sezione 8.

## Struttura di un brief

Ogni brief deve contenere:

```markdown
# Brief NNN — <titolo>

**Stato**: draft | ready | in-progress | done | cancelled
**Creato**: YYYY-MM-DD
**Aggiornato**: YYYY-MM-DD
**Origine**: `../audits/NNN-...md` o `../research/NNN-...md`
**Impatto stimato**: alto / medio / basso
**Effort stimato**: S / M / L

## Obiettivo SEO
Una frase: cosa vogliamo ottenere e perché.

## Pagine coinvolte
Lista esatta di file in `fenapi/frontend/...` da modificare.

## Modifiche puntuali
Per ogni file: cosa cambiare, dove (selettore o riga), come.
Esempio: vecchio title → nuovo title, vecchia meta → nuova meta.

## Vincoli
Cosa NON cambiare. Redirect da impostare se gli URL cambiano (di norma NON cambiarli).
Regole di contenuto da rispettare (`../../CLAUDE.md` sezione 7).

## Verifica post-applicazione
Come capire che ha funzionato: re-crawl, validatore Schema.org, PageSpeed, eccetera.

## Note di sicurezza
Eventuali rischi specifici (es. "questa pagina ha link entranti da Google, occhio all'URL").
```

## Naming

`NNN-titolo-kebab-case.md` con numerazione progressiva.

## Cosa NON va qui

- Generic notes / TODO → tienili nel `PROJECT_STATUS.md`
- Audit / research → cartelle dedicate
