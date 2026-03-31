# [NOME DIRETTIVA]

> **Livello**: 1 — Direttiva  
> **Script associato**: `execution/nome_script.py`  
> **Ultima modifica**: YYYY-MM-DD

---

## Obiettivo

Descrizione chiara e concisa di **cosa** fa questa direttiva e **perché** esiste.

---

## Input

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|-------------|-------------|
| `campo_1` | `str` | ✅ | Descrizione del campo |
| `campo_2` | `int` | ❌ | Descrizione opzionale |

---

## Output

Descrizione dell'output atteso (file generato, risposta API, record DB, ecc.).

- **Formato**: JSON / CSV / Google Sheets / ...
- **Destinazione**: `.tmp/output.json` oppure URL cloud

---

## Script da Usare

```bash
python execution/nome_script.py --input "valore" --output ".tmp/risultato.json"
```

---

## Passi

1. [Passo 1 — descrizione]
2. [Passo 2 — descrizione]
3. [Passo 3 — descrizione]

---

## Casi Limite & Vincoli

- **Rate limit**: es. max 100 richieste/minuto → usa batch endpoint
- **Errori comuni**: es. `401 Unauthorized` → controllare `.env` per le chiavi API
- **Timeout**: es. operazioni >30s → aggiungere retry con backoff

---

## Note & Aggiornamenti

<!-- Aggiorna questa sezione ogni volta che scopri qualcosa di nuovo -->

- YYYY-MM-DD: [cosa hai scoperto / modificato]
