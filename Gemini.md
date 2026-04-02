# Istruzioni Agente — Antigravity Workspace

IMPORTANTE: Prima di ogni task, leggi SEMPRE il `PROJECT_STATUS.md` del progetto su cui stai lavorando. Dopo ogni modifica significativa, aggiornalo con quello che hai fatto. Questo file è condiviso con Claude — se non lo aggiorni, l'altro agente lavorerà senza contesto e commetterà errori.

Se il progetto non ha un PROJECT_STATUS.md, crealo con: descrizione, tech stack, struttura cartelle, stato attuale e prossimi step.

## Workspace

Questo workspace contiene più progetti, ognuno nella propria directory.

## Architettura a 3 Livelli

Ogni progetto segue un'architettura a 3 livelli:
1. **Direttive/Specifica** — SOP e documenti di specifica
2. **Orchestrazione** — Decisioni dell'agente AI
3. **Esecuzione** — Codice deterministico (script, Edge Functions)

Principio chiave: spingere la complessità in codice deterministico, non nel ragionamento LLM.
