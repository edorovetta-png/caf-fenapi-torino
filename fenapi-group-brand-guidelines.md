# FENAPI Group — Brand Guidelines
> Documento di riferimento per la generazione e modifica automatica di contenuti visivi e testuali del sito www.fenapigroup.it
> Versione dedotta dall'analisi del sito (CSS, struttura, contenuti) — Marzo 2026

---

## 1. Identità del Brand

### 1.1 Nome e Payoff
- **Nome principale:** FENAPI Group
- **Nome esteso:** Federazione Nazionale Autonoma Piccoli Imprenditori – FENAPI
- **Payoff implicito:** "Un mondo di servizi"
- **Tagline editoriale ricorrente:** "Più valore alla persona, più futuro per l'impresa"

### 1.2 Posizionamento
FENAPI Group è un'organizzazione professionale di categoria **senza fini di lucro**, nata nel 1992, che rappresenta piccoli imprenditori (artigianato, commercio, pesca, agricoltura, piccola industria, servizi) in tutta Italia e in 13 stati esteri. È il punto di riferimento per associazioni datoriali, professionisti e sindacati. Il tono è **istituzionale ma accessibile**, autorevole ma non distante.

### 1.3 Valori chiave (da comunicare sempre)
- Tutela e rappresentanza della piccola impresa
- Libertà, giustizia sociale, partecipazione
- Innovazione e capacità di precorrere i tempi
- Radicamento territoriale con visione nazionale
- Solidarietà e spirito di sacrificio (heritage narrativo)

---

## 2. Palette Colori

### 2.1 Colori primari (usare per CTA, titoli di sezione, highlight)

| Token | Hex | Uso |
|---|---|---|
| `primary` | `#206088` | Colore principale brand: link, bottoni, icone, accenti |
| `primary-hover` | `#256f9d` | Hover di link e bottoni primari |
| `primary-dark` | `#1b5173` | Stato attivo/pressed dei bottoni primari |
| `primary-darker` | `#16435f` | Scale-2: sezioni scure primarie |
| `primary-darkest` | `#11344a` | Ombre profonde, bordi |

### 2.2 Colori secondari (supporto, varianti)

| Token | Hex | Uso |
|---|---|---|
| `secondary` | `#2c79ac` | Secondo colore brand: link header-top, sottosezioni |
| `secondary-hover` | `#3187c0` | Hover del secondario |
| `secondary-dark` | `#276b98` | Stato attivo secondario |
| `tertiary` | `#3a95cf` | Terzo colore: accenti chiari, bordi popup menu |
| `tertiary-hover` | `#4fa0d4` | Hover del terziario |
| `accent-legacy` | `#005d82` | Page-top background, footer ribbon, breadcrumb bg |

### 2.3 Colori neutri

| Token | Hex | Uso |
|---|---|---|
| `dark` | `#2e353e` | Testi su sfondi scuri, sezioni dark |
| `dark-medium` | `#383f48` | Quaternary: icone, sezioni neutre scure |
| `text-dark` | `#1d2127` | Titoli H1–H6 su sfondo bianco |
| `text-body` | `#707070` | Testo body, didascalie, testo secondario |
| `text-muted` | `#999` | Header contatti, nav secondaria, placeholder |
| `text-light` | `#b7b7b7` | Testo nel footer su sfondo scuro |
| `text-footer-dark` | `#32373c` | Sfondo footer principale |
| `white` | `#ffffff` | Sfondo principale pagine, card |
| `bg-light` | `#fafafa` | Sfondi hover menu, strip header-top |
| `border-light` | `#ededed` | Divisori, bordi header |
| `border-medium` | `#ccc` | Input, search form |

### 2.4 Colori di stato / funzionali

| Token | Hex | Uso |
|---|---|---|
| `success` | `#62b959` | Badge "sticky", etichette verdi |
| `success-alt` | `#63ba59` | Tip/label verdi menu |
| `error` | `#e27c7c` | Badge "onsale", errori |
| `wishlist` | `#e36159` | Wishlist WooCommerce |
| `quickview` | `#2baab1` | Bottoni quickview |

---

## 3. Tipografia

### 3.1 Font family

| Ruolo | Font | Fallback |
|---|---|---|
| **Primario (tutto il sito)** | `Open Sans` | `sans-serif` |
| **Decorativo / alternativo** | `Shadows Into Light` | `cursive` |

> `Open Sans` è il font di default per body, heading, menu e interfaccia. Usarlo sempre come base.  
> `Shadows Into Light` appare solo in contesti emozionali (ribbon footer, em nei titoli hero, citazioni stilizzate, intro). **Non usarlo per testi informativi o UI.**

### 3.2 Scala tipografica (desktop)

| Elemento | Font | Weight | Size | Line-height | Color |
|---|---|---|---|---|---|
| `h1` | Open Sans | 400 | 36px | 44px | `#1d2127` |
| `h1.big` | Open Sans | 400 | 58px | 54px | `#1d2127` |
| `h1.small` | Open Sans | 600 | 30px | 42px | `#1d2127` |
| `h2` | Open Sans | 300 | 30px | 40px | `#1d2127` |
| `h3` | Open Sans | 400 | 25px | 32px | `#1d2127` |
| `h4` | Open Sans | 400 | 20px | 27px | `#1d2127` |
| `h5` | Open Sans | 600 | 14px | 18px | `#1d2127` |
| `h6` | Open Sans | 400 | 14px | 18px | `#1d2127` |
| Body | Open Sans | 400 | 14px | 22px | `#707070` |
| Nav menu | Open Sans | 700 | 12px | 20px | `#444` |
| Logo text | Open Sans | 700 | 40px | 48px | `#0088cc` |

### 3.3 Scala tipografica (mobile < 480px)
Ridurre i font di circa il 7% rispetto al desktop. Body scende a 13px / 20px.

### 3.4 Regole tipografiche
- I titoli (`h1`–`h6`) sono sempre in `#1d2127` su sfondo bianco.
- Il testo body è sempre `#707070`.
- I **link** nel corpo del testo usano `#206088` con hover `#256f9d`.
- I testi su **sfondi colorati** (primary, secondary, footer) usano `#ffffff`.
- L'elemento `em` all'interno di headline speciali usa `Shadows Into Light` in `#206088`.
- Non usare mai `Shadows Into Light` in uppercase o per testi lunghi.

---

## 4. Logo

### 4.1 Versioni

| Versione | File | Contesto |
|---|---|---|
| Logo principale (header interno pagine) | `/wp-content/uploads/2024/06/logo_fenapigroup_login.png` | Header su sfondo bianco |
| Logo footer | `/wp-content/uploads/2017/01/logo_footer-1.png` | Footer su sfondo scuro |
| Logo FENAPI storico (1992–2017) | `/wp-content/uploads/2017/06/logo_fenapi_2018.png` | Solo uso editoriale/storico |
| Logo icona/favicon | `/wp-content/uploads/2017/06/logo_fenapi1.png` | Timeline, thumbnail |

### 4.2 Regole d'uso del logo
- Su sfondo bianco o chiaro: usare la versione standard con sfondo trasparente.
- Su sfondo scuro (footer `#32373c`): usare la versione footer.
- Non modificare le proporzioni del logo.
- Non sovrapporre il logo a immagini fotografiche complesse senza overlay scuro.
- Clearspace minimo: almeno l'altezza della lettera "F" su ogni lato.

---

## 5. Componenti UI

### 5.1 Bottoni

**Bottone primario (CTA principale)**
```
Background:  #206088
Border:      #206088
Text:        #ffffff
Hover bg:    #1b5173
Hover border: #1b5173
Border-radius: coerente con tema (generalmente 3–4px)
```

**Bottone outline primario**
```
Background:  transparent
Border:      #206088
Text:        #206088
Hover bg:    #1b5173
Hover text:  #ffffff
```

**Bottone secondario**
```
Background:  #2c79ac
Border:      #2c79ac
Text:        #ffffff
Hover bg:    #276b98
```

> Le CTA principali del sito sono "Vai alla Piattaforma", "Accedi o Registrati!", "Clicca Quì". Il tono è diretto e imperativo. Usare verbi d'azione.

### 5.2 Link
- Default: `#206088`
- Hover: `#256f9d`
- Active: `#1b5173`
- Nel footer: `#ffffff` (hover `#ffffff`)
- Nell'header-top: `#2c79ac` (hover `#3a95cf`)

### 5.3 Header

**Topbar (`.header-top`)**
- Background: `#fafafa`
- Testo: `#707070`
- Link: `#2c79ac` → hover `#3a95cf`
- Border-bottom: `1px solid #ededed`
- Contenuto: telefono, email di contatto

**Main header (`.header-main`)**
- Background: `#ffffff`
- Border-top: `5px solid #ededed`
- Navigation: Open Sans 700 12px `#444`, hover background `#206088` text `#fff`
- Active item: `#206088` text, no background

**Sticky header**
- Background: `rgba(255,255,255,0.8)` (scrollando)
- Comportamento: il logo si mantiene, il menu diventa sticky

### 5.4 Footer

**Footer main (`.footer-main`)**
- Background: `#32373c`
- Testo: `#b7b7b7`
- Link: `#ffffff` (hover `#ffffff`)
- Titoli widget: `#ffffff`
- Divisori: `rgba(183,183,183,0.3)`

**Footer bottom (`.footer-bottom`)**
- Background: `#206088`
- Testo: `#ffffff`
- Copyright text: bianco

**Footer ribbon**
- Background: `#005d82`
- Font: `Shadows Into Light`
- Testo: `#ffffff`

### 5.5 Navigazione menu principale
- Font: Open Sans 700 12px uppercase (classe `.mega-menu`)
- Colore default: `#444`
- Stato hover: background `#206088`, testo `#ffffff`
- Stato active: testo `#206088`, background trasparente
- Popup wide: border-top `#08c` (heritage), background `#ffffff`
- Popup narrow: background `#206088`, testo `#ffffff`

### 5.6 Cards / Post preview
- Titolo post: `#206088`
- Data (giorno): `#206088`
- Data (mese) background badge: `#206088`
- Testo corpo: `#707070`
- Immagine formato: `450 x 231px` (rapporto ~1.95:1)

### 5.7 Sezioni a colore pieno
Quando si usa una sezione colorata di sfondo, rispettare queste combinazioni:

| Classe sezione | BG | Testo | Heading |
|---|---|---|---|
| `section-primary` | `#206088` | `#e6e6e6` | `#ffffff` |
| `section-secondary` | `#2c79ac` | `#e6e6e6` | `#ffffff` |
| `section-tertiary` | `#3a95cf` | `#e6e6e6` | `#ffffff` |
| `section-dark` | `#2e353e` | `#e6e6e6` | `#ffffff` |
| `section-light` | `#ffffff` | `#5e5e5e` | `#707070` |

### 5.8 Page top / Breadcrumb
- Background: `#005d82`
- Border-top: `5px solid #384045`
- Border-bottom: `5px solid #ccc`
- Testo e link breadcrumb: `#ffffff`
- Titolo pagina: `#ffffff`, font Open Sans
- Sottotitolo: `#e6e6e6`

---

## 6. Immagini e fotografia

### 6.1 Stile fotografico osservato
- Fotografie di eventi istituzionali (convegni, tavoli tecnici, cerimonie)
- Riprese con persone in contesti formali (sale conferenze, istituzioni)
- Grafiche con loghi e brand su sfondi neutri o colorati (primary/secondary)
- Nessun elemento decorativo astratto: lo stile è documentaristico e istituzionale

### 6.2 Formato immagini news/post
- Thumbnail: `450 x 231px` (ratio ~16:7)
- Hero/slider: `1920 x 1080px`
- Slide rettangolare: `1500 x 1500px` o `2000 x 1000px`

### 6.3 Overlay e trattamenti
- Quando si sovrappone testo a immagini scure: usare sfondo `rgba(0,0,0,0.4)` minimo
- Evitare immagini con colori dominanti in conflitto con `#206088` o `#2c79ac`

---

## 7. Tono di Voce

### 7.1 Caratteristiche
- **Istituzionale ma non burocratico**: il linguaggio è chiaro, diretto, senza tecnicismi eccessivi
- **Autorevole**: FENAPI parla da una posizione di rappresentanza consolidata (dal 1992)
- **Empatico verso la piccola impresa**: la narrativa esalta il coraggio dei piccoli imprenditori
- **Pragmatico**: focus sui servizi concreti, non su promesse vaghe
- **Patriottico ma non retorico**: rispetto per le istituzioni, difesa del Made in Italy

### 7.2 Esempi di headline del sito
- "Più valore alla persona, più futuro per l'impresa"
- "Un mondo di servizi"
- "Il rafforzamento del sistema FENAPI per le imprese italiane"
- "Connettendo il futuro"
- "Adesso… Impresa"
- "Sistema Italia e Sussidiarietà"

### 7.3 Pattern linguistici ricorrenti
- Titoli di sezione in **grassetto con accenti emozionali** (es. `**FENAPI GROUP** è la naturale evoluzione...`)
- Lista dei servizi con descrizione breve + link "Per maggiori informazioni »"
- Notizie con data in evidenza (giorno + mese in badge colorato)
- Headline convegni in **MAIUSCOLO** nel titolo dell'articolo
- Citazioni di figure come "Carmelo Satta" e "Cateno De Luca" come anchor di credibilità

### 7.4 Cosa evitare
- Linguaggio commerciale aggressivo o salesy
- Superlative non supportate da dati
- Tono informale o colloquiale (no emoji, no slang)
- Colorazioni fuori palette (no verde brillante, no arancio, no rosa)

---

## 8. Struttura pagine tipo

### 8.1 Homepage
1. **Hero / Slider** (full-width, immagine evento + testo welcome)
2. **Piattaforma E-learning** (box con logo e CTA)
3. **Feed notizie** (griglia 3 colonne, post con badge data)
4. **CTA Associazione** (sfondo colorato, testo invito + bottone "Accedi o Registrati!")
5. **Servizi del gruppo** (grid con titolo servizio + descrizione breve + link)
6. **Counter statistici** (Utenti, Sedi CAF, Sedi Patronato, Sedi CAA)
7. **Contatti** (sezione divisa in colonne: professionalità + supporto tecnico)

### 8.2 Pagine servizio (Patronato, CAF, CAA, ecc.)
1. **Breadcrumb** su page-top `#005d82`
2. **Titolo H1** della sezione
3. **Testo descrittivo** con bold su termini chiave
4. **Lista dei servizi erogati**
5. **Link a siti dedicati degli enti**

---

## 9. Entità del Gruppo (logotipi e colori per ciascuna)

I seguenti enti appartengono al gruppo FENAPI e hanno identità visive separate ma coerenti con la palette principale:

| Ente | Descrizione | Sito |
|---|---|---|
| **Patronato INAPI** | Assistenza previdenziale e sociale | inapi.it |
| **CAF FENAPI** | Assistenza fiscale dipendenti e pensionati | caf.fenapi.it |
| **CAF Impresa FENAPI** | Assistenza fiscale imprese | cafimpresa.fenapi.it |
| **CAA FENAPI** | Assistenza agricola | — |
| **Siamo Impresa PMI** | Unione manifatturiero | — |
| **CIPALF** | Politiche attive per il lavoro | — |
| **Fondo Conoscenza** | Fondo interprofessionale formazione | fondoconoscenza.it |
| **ENFIP** | Istruzione professionale | enfip.it |

> Quando si genera contenuto per uno degli enti, usare il logo dell'ente specifico ma mantenere la palette cromatica primaria `#206088` come colore di coerenza di sistema.

---

## 10. Social Media

### 10.1 Canali attivi
- **Facebook:** facebook.com/fenapigroup
- **Twitter/X:** twitter.com/FENAPI_Group

### 10.2 Tono per i social
- Stesso tono istituzionale del sito
- Notizie di attualità, eventi, aggiornamenti normativi
- Post di servizio pubblico (scadenze fiscali, novità legislative)
- No contenuti promozionali puri; focus su utilità per l'associato

---

## 11. Contatti e Informazioni Legali

```
Ragione sociale: FENAPI
Codice fiscale: 97138130584
Sede legale: Corso d'Italia, 39 – 00198 Roma (RM), Italia
Telefono: +39 06 98960300
Email: info@fenapigroup.it
Orari: Lunedì–Venerdì, 10:00–13:30 e 15:00–18:00
```

---

## 12. Quick Reference per Antigravity / AI Content Generation

Quando generi o modifichi contenuti per fenapigroup.it, rispetta queste regole sintetiche:

```yaml
brand:
  name: "FENAPI Group"
  tagline: "Un mondo di servizi"
  tone: istituzionale, autorevole, pragmatico, italiano

colors:
  primary: "#206088"
  primary_hover: "#256f9d"
  secondary: "#2c79ac"
  tertiary: "#3a95cf"
  text_heading: "#1d2127"
  text_body: "#707070"
  background: "#ffffff"
  footer_bg: "#32373c"
  footer_accent: "#206088"

typography:
  body_font: "Open Sans"
  decorative_font: "Shadows Into Light"  # solo uso editoriale/emotivo
  body_size: "14px"
  body_weight: 400
  body_line_height: "22px"
  heading_h1: "36px / 44px / weight 400"
  heading_h2: "30px / 40px / weight 300"
  heading_h3: "25px / 32px / weight 400"
  heading_h4: "20px / 27px / weight 400"
  nav_font: "Open Sans 700 12px uppercase"

buttons:
  primary_bg: "#206088"
  primary_text: "#ffffff"
  primary_hover_bg: "#1b5173"
  cta_style: "diretto e imperativo (es. 'Vai alla Piattaforma', 'Scopri di più')"

images:
  news_thumbnail: "450x231px"
  hero_slider: "1920x1080px"
  style: "fotografico istituzionale, eventi, persone in contesto formale"

language: italiano
audience: piccoli imprenditori, lavoratori autonomi, associati, intermediari fiscali
do_not_use:
  - emoji nel body text
  - tono commerciale aggressivo
  - font non in palette
  - colori non in palette
  - immagini astratte o decorative senza contenuto informativo
```

---

*Documento generato da analisi automatica del sito web fenapigroup.it — CSS skin_1.css, theme_1.css, struttura HTML, contenuti editoriali. Aggiornare a ogni restyling significativo del sito.*
