# DEBUG REPORT — Audit Completo

> Data audit: 2026-03-30
> Tutti i 28 problemi identificati sono stati risolti.

---

## Riepilogo

| Stato | Conteggio |
|-------|-----------|
| Risolti | 28/28 |
| Non risolti | 0 |

---

## Dettaglio Problemi

| # | Priorita | Problema | Stato | Commit/Note |
|---|----------|---------|-------|-------------|
| 1 | P0 | URL Lovable → Vercel (41 occorrenze in 11 file) | RISOLTO | Batch 1 — main repo |
| 2 | P1 | Brand caffenapi non allineato (font/colori diversi) | RISOLTO | Batch B — Open Sans + HSL da #206088/#2c79ac |
| 3 | P1 | Repo git annidato senza config | RISOLTO | Batch 1 — caffenapi/ aggiunto a .gitignore |
| 4 | P1 | Race condition create-appointment (no transazione) | RISOLTO | Batch C — UNIQUE INDEX su (operator_id, date, time) |
| 5 | P1 | HTML injection nelle email | RISOLTO | Batch 2 — escapeHtml() su tutti i campi utente |
| 6 | P1 | UUID operatore hardcoded e duplicato | RISOLTO | Batch 2 — env var FRIDAY_OPERATOR_ID |
| 7 | P2 | Orari venerdi non allineati sito/app | RISOLTO | Batch C — sito: 9-12, app: server controlla per operatore |
| 8 | P2 | Nessun contatto nell'app prenotazioni | RISOLTO | Batch B — footer con tel, email, indirizzo, orari |
| 9 | P2 | React Query key collision admin-categories | RISOLTO | Batch 3 — 3 query key distinte |
| 10 | P2 | Non-null assertion AdminLogin | RISOLTO | Batch 3 — null-check esplicito |
| 11 | P2 | Nessuna validazione weekend server-side | RISOLTO | Batch 4 — reject weekend in create-appointment |
| 12 | P2 | Route admin senza auth guard | RISOLTO | Batch C — ProtectedRoute con spinner + redirect |
| 13 | P2 | Contenuto ISEE datato (2022/2024) | RISOLTO | Batch 5 — aggiornato a 2024/2026 |
| 14 | P2 | Bottone CTA invisibile (dark-on-dark) | RISOLTO | Batch 4 — rimosso inline style override |
| 15 | P2 | Footer inconsistente tra pagine servizi | RISOLTO | Batch 5 — modello-730 allineato alle altre |
| 16 | P3 | Google Maps embed place ID invalido | RISOLTO | Batch 6 — URL basato su query indirizzo |
| 17 | P3 | URL footer inconsistenti + HTTP links | RISOLTO | Batch 6 — allineati a fenapigroup.it, HTTPS |
| 18 | P3 | rel="noopener noreferrer" mancante | RISOLTO | Batch 5 — aggiunto a tutti i target="_blank" |
| 19 | P2 | Naming "CAF FENAPI" vs "Circolo FENAPI" | RISOLTO | Batch B — "Circolo FENAPI" ovunque (tranne nome legale S.r.l.) |
| 20 | P3 | Variabili Supabase non validate nel client | RISOLTO | Batch A — throw Error se mancanti |
| 21 | P3 | Email non inviata per prenotazioni admin | RISOLTO | Batch D — AdminBookingDialog chiama send-booking-email |
| 22 | P3 | NavLink.tsx dead code | RISOLTO | Batch A — file rimosso |
| 23 | P3 | Path hardcoded in generate_service_pages.py | RISOLTO | Batch 7 — Path relativo con __file__ |
| 24 | P3 | Open Graph mancante pagine servizi | RISOLTO | Batch D — og:title, og:description, og:type |
| 25 | P3 | Header top bar mancante pagine servizi | RISOLTO | Batch D — header-top con tel/email/social |
| 26 | P3 | VITE_SUPABASE_PROJECT_ID mai usato | RISOLTO | Batch A — rimosso da .env |
| 27 | P3 | Backend FastAPI non utilizzato | RISOLTO | Batch A — intera cartella backend/ rimossa |
| 28 | P3 | Ternario ridondante script.js | RISOLTO | Batch 7 — semplificato a '+' |
