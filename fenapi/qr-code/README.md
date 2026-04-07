# QR Code — Tracking Provenienza Prenotazioni

## File

- **`qr-prenotazioni-negozio.png`** — QR da stampare ed esporre **fuori dal negozio**.
  Formato: PNG 1060×1060 px, colore `#11344a` su sfondo bianco, error correction M (15%), border 4 moduli.
  Pronto per stampa fino a ~A4.

## URL codificato

```
https://prenotazioni.fenapipiemonte.org/?utm_source=qr_negozio&utm_medium=offline&utm_campaign=vetrina_torino
```

I parametri `utm_*` vengono catturati al primo atterraggio dall'hook
`useUtmTracking` (in `caffenapi/src/hooks/useUtmTracking.ts`), salvati in
`sessionStorage`, e allegati al payload di `create-appointment` quando l'utente
conferma. Vengono persistiti nelle colonne `appointments.utm_source/medium/campaign`
(migration `20260407120000_add_appointment_source_tracking.sql`).

## Sistema di tracking

| Origine | utm_source | Come |
|---|---|---|
| QR fuori dal negozio | `qr_negozio` | Codificato in questo PNG |
| Sito vetrina (Google → fenapipiemonte.org → CTA) | `sito` | Appeso ai CTA in `frontend/**/*.html` |
| Accesso diretto / link condiviso senza UTM | `null` → "Diretto / Sconosciuto" | Fallback nella dashboard Analytics |

## Sostituzione del QR esistente

Il vecchio QR è statico (URL nudo senza UTM). Continuerà a funzionare per
sempre — la differenza è solo che le sue scansioni risulteranno come
"Diretto / Sconosciuto" nella dashboard.

Quando vuoi avere il tracking pulito:
1. Stampa `qr-prenotazioni-negozio.png` a buona qualità.
2. Sostituisci fisicamente il QR esposto in negozio.
3. Da quel momento ogni nuova scansione sarà taggata `qr_negozio`.

## Rigenerare il PNG

Se serve cambiare colore/dimensione:

```bash
python3 -c "
import qrcode
url = 'https://prenotazioni.fenapipiemonte.org/?utm_source=qr_negozio&utm_medium=offline&utm_campaign=vetrina_torino'
qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=20, border=4)
qr.add_data(url); qr.make(fit=True)
qr.make_image(fill_color='#11344a', back_color='white').save('qr-prenotazioni-negozio.png')
"
```

Dipendenza: `pip3 install --user 'qrcode[pil]'`
