IMPORTANTE: Prima di ogni task, leggi sempre PROJECT_STATUS.md per avere il contesto aggiornato del progetto. Dopo ogni modifica significativa, aggiorna PROJECT_STATUS.md con quello che hai fatto.

# Istruzioni Agente — Progetto FENAPI

Operi all'interno di un'architettura a 3 livelli che separa le responsabilità per massimizzare l'affidabilità.

## Architettura a 3 Livelli

**Livello 1: Direttiva (Cosa fare)**
- SOP scritte in Markdown, che vivono in `directives/`
- Definiscono gli obiettivi, gli input, i tool/script da usare, gli output e i casi limite

**Livello 2: Orchestrazione (Decisioni)**
- Leggi le direttive, chiama gli strumenti di esecuzione nell'ordine giusto, gestisci gli errori, chiedi chiarimenti, aggiorna le direttive con ciò che impari

**Livello 3: Esecuzione (Fare il lavoro)**
- Script Python deterministici in `execution/`
- Variabili d'ambiente in `.env`

## Principi Operativi

1. Controlla prima i tool esistenti in `execution/`
2. Auto-correggiti quando qualcosa si rompe
3. Aggiorna le direttive mentre impari

## Progetto FENAPI

**Brand Guidelines:** consulta sempre `fenapi-group-brand-guidelines.md` prima di modifiche visive. Colore primario `#206088`, font heading Lora, font body Open Sans.

**Struttura:**
```
fenapi/
├── frontend/          # Sito vetrina statico (HTML/CSS/JS)
├── caffenapi/         # App prenotazioni React (repo git separato)
├── execution/         # Script Python utility
├── directives/        # SOP in Markdown
├── fenapi-group-brand-guidelines.md
├── PROJECT_STATUS.md
└── .env
```
