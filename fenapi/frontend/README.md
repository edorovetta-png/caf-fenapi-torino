# Applicazione Frontend

Questa directory è destinata a contenere l'applicazione web (Next.js), come specificato in `Gemini.md`.

## Setup Next.js
Attualmente `npm`/`npx` non risulta disponibile nell'ambiente in cui il setup è in esecuzione. 
Per inizializzare il progetto Next.js in questa cartella, esegui il seguente comando nel tuo terminale quando avrai installato Node.js:

```bash
npx create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
```

Ricorda di consultare il file `../brand-guidelines.md` per l'uso coerente dei colori e dei font del progetto.
