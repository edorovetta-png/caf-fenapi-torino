# Istruzioni Agente — Antigravity Workspace

Root workspace per progetti multipli. Ogni progetto ha la sua directory con istruzioni specifiche.

## Progetti

- **`fenapi/`** — Sito web e sistema prenotazioni per Circolo FENAPI Torino. Vedi `fenapi/Gemini.md`.

## Architettura a 3 Livelli

Ogni progetto segue un'architettura a 3 livelli:
1. **Direttive** — SOP in Markdown (`directives/`)
2. **Orchestrazione** — Decisioni dell'agente AI
3. **Esecuzione** — Script Python deterministici (`execution/`)

Principio chiave: spingere la complessità in codice deterministico, non nel ragionamento LLM.
