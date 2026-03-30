#!/usr/bin/env python3
"""
Genera le pagine servizi rimanenti per CAF FENAPI Torino.
Execution layer script — deterministic page generation.
"""

import os

SERVIZI_DIR = "/Users/edoardorovetta/Desktop/Antigravity/frontend/servizi"

# Template components
def header_html(title_short):
    return f'''<header class="header-main" id="headerMain"><div class="container">
    <a href="../index.html" class="logo"><div class="logo-icon">CF</div><div class="logo-text"><strong>CAF FENAPI</strong><span>Sede Provinciale di Torino</span></div></a>
    <button class="nav-toggle" id="navToggle" aria-label="Apri menu"><span></span><span></span><span></span></button>
    <div class="nav-wrapper" id="navWrapper"><nav class="nav-main"><a href="../index.html">Home</a><a href="../index.html#servizi" class="active">Servizi</a><a href="../index.html#chi-siamo">Chi Siamo</a><a href="../index.html#il-gruppo">Il Gruppo</a><a href="../index.html#contatti">Contatti</a></nav>
    <div class="header-cta"><a href="https://caffenapi.lovable.app/" target="_blank" rel="noopener noreferrer" class="btn-appointment"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Prenota</a></div></div>
  </div></header>'''

FLOATING = '''<div class="floating-cta" id="floatingCta"><a href="https://caffenapi.lovable.app/" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><span class="cta-text-full">Prenota un Appuntamento</span><span class="cta-text-short">Prenota</span></a></div>
  <button class="scroll-top" id="scrollTop" aria-label="Torna su"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg></button>'''

FOOTER = '''<div class="footer-ribbon"><p>Pi&ugrave; valore alla persona, pi&ugrave; futuro per l\'impresa</p></div>
  <footer class="footer-main"><div class="container"><div class="footer-grid">
    <div class="footer-col footer-logo-section"><div class="footer-logo-text"><div class="logo-mark">CF</div><span class="logo-name">CAF FENAPI Torino</span></div><p>Centro di Assistenza Fiscale. Sede provinciale di Torino.</p></div>
    <div class="footer-col"><h5>Servizi</h5><a href="modello-730.html">Modello 730</a><a href="modello-isee.html">Modello ISEE</a><a href="imu-tasi.html">IMU / TASI</a><a href="red.html">Dichiarazione RED</a><a href="unico-pf.html">UNICO PF</a></div>
    <div class="footer-col"><h5>Altro</h5><a href="pensioni.html">Pensioni</a><a href="invalidita.html">Invalidit&agrave; Civile</a><a href="successioni.html">Successioni</a><a href="../index.html#chi-siamo">Chi Siamo</a></div>
    <div class="footer-col"><h5>Sede di Torino</h5><a href="https://maps.google.com/?q=Via+Sagra+S.+Michele+53+10141+Torino" target="_blank">Via Sagra S. Michele, 53<br>10141 Torino TO</a><a href="tel:+393517091611">Tel: 351 709 1611</a><a href="mailto:fenapitorino@gmail.com">fenapitorino@gmail.com</a></div>
  </div></div></footer>
  <div class="footer-bottom"><div class="container"><p>&copy; 2026 CAF FENAPI &mdash; Sede Provinciale di Torino.</p><div><a href="https://www.fenapigroup.it/centro-privacy/" target="_blank">Privacy</a> | <a href="https://www.fenapigroup.it/centro-privacy/informativa-sui-cookie/" target="_blank">Cookie</a></div></div></div>'''

def sidebar_html(nav_items, cta_title="Hai bisogno di assistenza?"):
    nav_links = "\n".join([f'        <a href="#{k}">{v}</a>' for k,v in nav_items])
    return f'''<aside class="service-sidebar">
      <div class="sidebar-nav"><h4>In questa pagina</h4>
{nav_links}
      </div>
      <div class="sidebar-cta"><h4>{cta_title}</h4><p>Prenota un appuntamento presso la nostra sede di Torino.</p>
        <a href="https://caffenapi.lovable.app/" target="_blank" rel="noopener noreferrer" class="btn-sidebar-cta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Prenota Appuntamento</a>
        <div class="sidebar-contact"><p><strong>Telefono:</strong> <a href="tel:+393517091611">351 709 1611</a></p><p><strong>Email:</strong> <a href="mailto:fenapitorino@gmail.com">fenapitorino@gmail.com</a></p></div>
      </div>
    </aside>'''

def content_cta(title, text):
    return f'''<div class="content-cta fade-in">
        <h3>{title}</h3>
        <p>{text}</p>
        <div class="content-cta-actions">
          <a href="https://caffenapi.lovable.app/" target="_blank" rel="noopener noreferrer" class="btn-hero-primary"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Prenota un Appuntamento</a>
          <a href="tel:+393517091611" class="btn-hero-secondary" style="color:var(--primary)!important;border-color:var(--primary);">Chiama: 351 709 1611</a>
        </div>
      </div>'''

def make_page(filename, title, meta_desc, subtitle, breadcrumb_name, nav_items, content_sections, cta_title, cta_text):
    sections_html = "\n\n".join(content_sections)
    page = f'''<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} &mdash; CAF FENAPI Torino</title>
  <meta name="description" content="{meta_desc}">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23206088'/><text x='50%25' y='55%25' text-anchor='middle' dy='.35em' font-family='sans-serif' font-weight='800' font-size='44' fill='white'>CF</text></svg>">
  <link rel="stylesheet" href="../styles.css">
  <link rel="stylesheet" href="../service-page.css">
</head>
<body>
  {FLOATING}
  {header_html(title)}

  <section class="page-hero"><div class="container">
    <div class="breadcrumb"><a href="../index.html">Home</a> <span>/</span> <a href="../index.html#servizi">Servizi</a> <span>/</span> <strong>{breadcrumb_name}</strong></div>
    <h1>{title}</h1>
    <p class="page-hero-subtitle">{subtitle}</p>
  </div></section>

  <main class="service-page"><div class="container"><div class="service-layout">
    {sidebar_html(nav_items)}
    <div class="service-content">
      {sections_html}
      {content_cta(cta_title, cta_text)}
    </div>
  </div></div></main>

  {FOOTER}
  <script src="../script.js"></script>
</body>
</html>'''
    filepath = os.path.join(SERVIZI_DIR, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(page)
    print(f"✅ Creata: {filename}")

# ── IMU / TASI ──────────────────────────────────────────────────────────
make_page(
    "imu-tasi.html",
    "IMU / TASI",
    "Calcolo e assistenza IMU e TASI presso il CAF FENAPI di Torino. Supporto per imposte comunali sugli immobili.",
    "Calcolo e assistenza per le imposte comunali sugli immobili",
    "IMU / TASI",
    [("cos-e","Cos'&egrave; l'IMU"), ("chi-paga","Chi deve pagare"), ("calcolo","Come si calcola"), ("scadenze","Scadenze"), ("documenti","Documenti necessari")],
    [
        '''<section id="cos-e" class="content-section fade-in">
        <h2>Cos'&egrave; l'IMU</h2>
        <p>L'IMU (Imposta Municipale Unica) &egrave; l'imposta comunale dovuta dai possessori di immobili, aree fabbricabili e terreni agricoli. A partire dal 2020, la TASI &egrave; stata abolita e incorporata nella nuova IMU.</p>
        <p>Il CAF FENAPI di Torino offre assistenza completa per il calcolo dell'IMU, la compilazione dei modelli F24 per il versamento e la verifica delle eventuali esenzioni spettanti.</p>
        <div class="info-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <div><strong>Esenzione abitazione principale</strong><p>L'abitazione principale e le relative pertinenze (una per categoria C/2, C/6 e C/7) sono esenti dall'IMU, salvo le categorie catastali A/1, A/8 e A/9 (immobili di lusso).</p></div>
        </div>
      </section>''',
        '''<section id="chi-paga" class="content-section fade-in">
        <h2>Chi deve pagare l'IMU</h2>
        <ul class="feature-list">
          <li>Proprietari di fabbricati, aree fabbricabili e terreni</li>
          <li>Titolari di diritto reale di usufrutto, uso, abitazione, enfiteusi, superficie</li>
          <li>Concessionari di aree demaniali</li>
          <li>Locatari per gli immobili concessi in locazione finanziaria</li>
        </ul>
      </section>''',
        '''<section id="calcolo" class="content-section fade-in">
        <h2>Come si calcola</h2>
        <p>La base imponibile dell'IMU si ottiene rivalutando la rendita catastale del 5% e moltiplicandola per il coefficiente relativo alla categoria catastale dell'immobile. All'importo cos&igrave; ottenuto si applica l'aliquota deliberata dal Comune.</p>
        <p>Il nostro team pu&ograve; assistervi nel calcolo preciso dell'IMU dovuta, verificando le aliquote comunali aggiornate e le eventuali riduzioni spettanti.</p>
      </section>''',
        '''<section id="scadenze" class="content-section fade-in">
        <h2>Scadenze</h2>
        <ul class="feature-list">
          <li><strong>Acconto:</strong> 16 giugno (o primo giorno lavorativo successivo)</li>
          <li><strong>Saldo:</strong> 16 dicembre (o primo giorno lavorativo successivo)</li>
          <li>&Egrave; possibile versare l'imposta in un'unica soluzione entro il 16 giugno</li>
        </ul>
      </section>''',
        '''<section id="documenti" class="content-section fade-in">
        <h2>Documenti necessari</h2>
        <ul class="doc-list">
          <li>Visure catastali degli immobili posseduti</li>
          <li>Atti di compravendita, donazione o successione</li>
          <li>F24 dei versamenti IMU dell'anno precedente</li>
          <li>Eventuali contratti di locazione</li>
          <li>Delibere comunali sulle aliquote (verificate dal CAF)</li>
        </ul>
      </section>'''
    ],
    "Hai bisogno di calcolare l'IMU?",
    "Prenota un appuntamento presso la nostra sede di Torino per il calcolo preciso dell'IMU sui tuoi immobili."
)

# ── RED ─────────────────────────────────────────────────────────────────
make_page(
    "red.html",
    "Dichiarazione RED",
    "Compilazione della dichiarazione RED presso il CAF FENAPI di Torino per pensionati con prestazioni legate al reddito.",
    "Dichiarazione reddituale per pensionati con prestazioni collegate al reddito",
    "Dichiarazione RED",
    [("cos-e","Cos'&egrave; il RED"), ("chi-deve","Chi deve presentarlo"), ("informazioni","Informazioni richieste"), ("documenti","Documenti necessari")],
    [
        '''<section id="cos-e" class="content-section fade-in">
        <h2>Cos'&egrave; la Dichiarazione RED</h2>
        <p>Il modello RED &egrave; una dichiarazione reddituale che l'INPS richiede annualmente ai pensionati che percepiscono prestazioni collegate al reddito (integrazione al minimo, maggiorazioni sociali, trattamenti di famiglia, ecc.).</p>
        <p>I pensionati obbligati alla compilazione del RED sono coloro che non hanno presentato la dichiarazione dei redditi (modello 730 o UNICO) o che hanno redditi non dichiarabili fiscalmente ma rilevanti ai fini delle prestazioni previdenziali.</p>
      </section>''',
        '''<section id="chi-deve" class="content-section fade-in">
        <h2>Chi deve presentare il RED</h2>
        <ul class="feature-list">
          <li>Pensionati che percepiscono prestazioni legate al reddito e non presentano la dichiarazione dei redditi</li>
          <li>Pensionati con redditi non dichiarabili fiscalmente (rendite INAIL, pensioni di guerra, rendite vitalizie)</li>
          <li>Pensionati con redditi erogati da organismi esteri</li>
          <li>Pensionati residenti all'estero</li>
        </ul>
        <div class="info-box info-box-warning">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <div><strong>Attenzione</strong><p>La mancata presentazione del RED pu&ograve; comportare la sospensione o la revoca delle prestazioni collegate al reddito.</p></div>
        </div>
      </section>''',
        '''<section id="informazioni" class="content-section fade-in">
        <h2>Informazioni richieste</h2>
        <p>La dichiarazione RED richiede informazioni sui redditi del pensionato e, se previsto, del coniuge e degli altri componenti del nucleo familiare rilevanti ai fini della prestazione.</p>
        <ul class="feature-list">
          <li>Redditi da lavoro dipendente e autonomo</li>
          <li>Redditi da fabbricati</li>
          <li>Redditi da pensione (italiana ed estera)</li>
          <li>Rendite vitalizie e rendite INAIL</li>
          <li>Pensioni di guerra e assimilate</li>
          <li>Redditi da capitale e da partecipazione</li>
        </ul>
      </section>''',
        '''<section id="documenti" class="content-section fade-in">
        <h2>Documenti necessari</h2>
        <ul class="doc-list">
          <li>Documento di identit&agrave; e codice fiscale</li>
          <li>Lettera INPS di richiesta del RED</li>
          <li>Certificazione Unica (CU) relativa a pensioni e altri redditi</li>
          <li>Documentazione attestante eventuali redditi non fiscali</li>
          <li>Dati del coniuge (se richiesti)</li>
        </ul>
      </section>'''
    ],
    "Devi presentare il RED?",
    "Il CAF FENAPI di Torino ti assiste nella compilazione e trasmissione della dichiarazione RED."
)

# ── UNICO PF ────────────────────────────────────────────────────────────
make_page(
    "unico-pf.html",
    "UNICO PF",
    "Modello Redditi Persone Fisiche (ex UNICO) presso il CAF FENAPI di Torino per titolari di partita IVA e autonomi.",
    "Modello Redditi PF per titolari di partita IVA, liberi professionisti e lavoratori autonomi",
    "UNICO PF",
    [("cos-e","Cos'&egrave; il Modello Redditi PF"), ("chi-deve","Chi deve utilizzarlo"), ("differenze","Differenze con il 730"), ("documenti","Documenti necessari")],
    [
        '''<section id="cos-e" class="content-section fade-in">
        <h2>Cos'&egrave; il Modello Redditi PF</h2>
        <p>Il Modello Redditi Persone Fisiche (ex Modello UNICO) &egrave; la dichiarazione dei redditi utilizzata dai contribuenti che non possono o non vogliono utilizzare il Modello 730. &Egrave; obbligatorio per i titolari di partita IVA, i liberi professionisti e i lavoratori autonomi.</p>
        <p>Il CAF FENAPI di Torino offre assistenza qualificata nella compilazione e trasmissione telematica del Modello Redditi PF.</p>
      </section>''',
        '''<section id="chi-deve" class="content-section fade-in">
        <h2>Chi deve utilizzare il Modello Redditi PF</h2>
        <ul class="feature-list">
          <li>Titolari di partita IVA (artigiani, commercianti, liberi professionisti)</li>
          <li>Lavoratori autonomi con redditi di lavoro autonomo abituale</li>
          <li>Contribuenti con redditi d'impresa</li>
          <li>Contribuenti con redditi di partecipazione in societ&agrave; di persone</li>
          <li>Chi ha percepito plusvalenze da cessione di partecipazioni qualificate</li>
          <li>Contribuenti non residenti in Italia</li>
          <li>Chi deve presentare dichiarazioni per conto di contribuenti deceduti</li>
        </ul>
      </section>''',
        '''<section id="differenze" class="content-section fade-in">
        <h2>Differenze con il Modello 730</h2>
        <p>A differenza del 730, il Modello Redditi PF:</p>
        <ul class="feature-list">
          <li>Pu&ograve; essere utilizzato da tutti i contribuenti (non solo dipendenti e pensionati)</li>
          <li>Non prevede il rimborso automatico in busta paga &mdash; il rimborso avviene tramite l'Agenzia delle Entrate</li>
          <li>Permette di dichiarare redditi d'impresa e di lavoro autonomo con partita IVA</li>
          <li>Ha scadenza diversa: generalmente il 30 novembre dell'anno successivo</li>
        </ul>
      </section>''',
        '''<section id="documenti" class="content-section fade-in">
        <h2>Documenti necessari</h2>
        <ul class="doc-list">
          <li>Documento di identit&agrave; e codice fiscale</li>
          <li>Dichiarazione dei redditi dell'anno precedente</li>
          <li>Certificazioni Uniche (CU) ricevute</li>
          <li>Registri IVA e contabilit&agrave;</li>
          <li>F24 versati nell'anno di riferimento</li>
          <li>Documentazione spese detraibili e deducibili</li>
          <li>Visure catastali per immobili posseduti</li>
          <li>Estratti conto bancari per redditi da capitale</li>
        </ul>
      </section>'''
    ],
    "Hai bisogno di presentare il Modello Redditi?",
    "Prenota un appuntamento presso la nostra sede di Torino per la compilazione del Modello Redditi PF."
)

# ── PENSIONI ──────────────────────────────────────────────────────────
make_page(
    "pensioni.html",
    "Pensioni",
    "Assistenza previdenziale completa presso CAF FENAPI Torino: domande di pensione, ricostituzione, supplementi e ricorsi tramite il Patronato INAPI.",
    "Assistenza previdenziale completa tramite il Patronato INAPI",
    "Pensioni",
    [("servizi","I nostri servizi"), ("tipi","Tipologie di pensione"), ("previdenziale","Interventi previdenziali"), ("documenti","Documenti necessari")],
    [
        '''<section id="servizi" class="content-section fade-in">
        <h2>Assistenza pensionistica</h2>
        <p>Tramite il <strong>Patronato INAPI</strong>, il CAF FENAPI di Torino offre assistenza previdenziale completa. I nostri operatori qualificati vi supportano in tutte le fasi: dalla verifica della posizione contributiva alla presentazione della domanda, fino all'eventuale ricorso.</p>
        <div class="info-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <div><strong>Servizio gratuito</strong><p>L'assistenza previdenziale tramite il Patronato INAPI &egrave; interamente gratuita per il cittadino.</p></div>
        </div>
      </section>''',
        '''<section id="tipi" class="content-section fade-in">
        <h2>Tipologie di pensione</h2>
        <div class="service-detail-grid">
          <div class="service-detail-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><div><strong>Pensione di vecchiaia</strong><p>Per chi ha raggiunto i requisiti di et&agrave; e contribuzione previsti dalla legge.</p></div></div>
          <div class="service-detail-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><div><strong>Pensione anticipata</strong><p>Per chi ha maturato i requisiti contributivi indipendentemente dall'et&agrave; anagrafica.</p></div></div>
          <div class="service-detail-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg><div><strong>Pensione ai superstiti</strong><p>Reversibilit&agrave; o indiretta per i familiari del pensionato o assicurato deceduto.</p></div></div>
          <div class="service-detail-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg><div><strong>Pensione di inabilit&agrave;</strong><p>Per chi ha una permanente incapacit&agrave; lavorativa assoluta.</p></div></div>
          <div class="service-detail-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg><div><strong>Assegno di invalidit&agrave;</strong><p>Per chi ha una riduzione della capacit&agrave; lavorativa superiore a 2/3.</p></div></div>
          <div class="service-detail-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><div><strong>Pensioni supplementari</strong><p>Ricostituzioni, supplementi e integrazioni delle prestazioni pensionistiche.</p></div></div>
        </div>
      </section>''',
        '''<section id="previdenziale" class="content-section fade-in">
        <h2>Interventi in materia previdenziale</h2>
        <p>Il Patronato INAPI assiste i cittadini per:</p>
        <ul class="feature-list">
          <li>Domande di pensione (vecchiaia, anticipata, inabilit&agrave;, superstiti)</li>
          <li>Ricostituzioni pensioni per contributi pregressi</li>
          <li>Ricongiunzioni e totalizzazioni contributive</li>
          <li>Riscatto periodi assicurativi (laurea, servizio militare, ecc.)</li>
          <li>Autorizzazione versamenti volontari</li>
          <li>Accredito contributi figurativi</li>
          <li>Assegni al nucleo familiare</li>
          <li>Indennit&agrave; di disoccupazione (NASpI)</li>
          <li>Indennit&agrave; di maternit&agrave;</li>
          <li>Ricorsi amministrativi e giudiziari</li>
        </ul>
      </section>''',
        '''<section id="documenti" class="content-section fade-in">
        <h2>Documenti necessari</h2>
        <ul class="doc-list">
          <li>Documento di identit&agrave; e codice fiscale</li>
          <li>Estratto conto contributivo INPS</li>
          <li>Certificazione Unica (CU)</li>
          <li>Eventuali certificati di servizio militare</li>
          <li>Certificato di laurea (per riscatto)</li>
          <li>Stato di famiglia</li>
          <li>Eventuale certificazione di invalidit&agrave;</li>
        </ul>
      </section>'''
    ],
    "Hai domande sulla tua pensione?",
    "Il Patronato INAPI presso la nostra sede di Torino ti offre consulenza previdenziale gratuita e qualificata."
)

# ── INVALIDITA' CIVILE ─────────────────────────────────────────────────
make_page(
    "invalidita.html",
    "Invalidit&agrave; Civile",
    "Assistenza per invalidità civile, accompagnamento e indennità presso il CAF FENAPI di Torino tramite il Patronato INAPI.",
    "Riconoscimento dell'invalidit&agrave; civile, accompagnamento e indennit&agrave; di frequenza",
    "Invalidit&agrave; Civile",
    [("cos-e","Cos'&egrave; l'invalidit&agrave; civile"), ("prestazioni","Prestazioni previste"), ("procedura","Come presentare domanda"), ("documenti","Documenti necessari")],
    [
        '''<section id="cos-e" class="content-section fade-in">
        <h2>Cos'&egrave; l'invalidit&agrave; civile</h2>
        <p>L'invalidit&agrave; civile &egrave; la condizione riconosciuta ai cittadini affetti da minorazioni congenite o acquisite che comportano una riduzione della capacit&agrave; lavorativa o, per i minori e gli ultrasessantacinquenni, difficolt&agrave; persistenti a svolgere le funzioni e i compiti propri dell'et&agrave;.</p>
        <p>Il CAF FENAPI di Torino, tramite il <strong>Patronato INAPI</strong>, assiste i cittadini nell'intero percorso: dalla presentazione della domanda all'eventuale ricorso.</p>
      </section>''',
        '''<section id="prestazioni" class="content-section fade-in">
        <h2>Prestazioni previste</h2>
        <div class="service-detail-grid">
          <div class="service-detail-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg><div><strong>Pensione di invalidit&agrave; civile</strong><p>Per cittadini con invalidit&agrave; riconosciuta dal 74% al 99%.</p></div></div>
          <div class="service-detail-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg><div><strong>Indennit&agrave; di accompagnamento</strong><p>Per invalidi totali (100%) non in grado di deambulare o compiere gli atti quotidiani.</p></div></div>
          <div class="service-detail-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><div><strong>Indennit&agrave; di frequenza</strong><p>Per minori con difficolt&agrave; persistenti che frequentano centri di riabilitazione o scuole.</p></div></div>
          <div class="service-detail-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg><div><strong>Pensione ciechi e sordomuti</strong><p>Prestazioni specifiche per cittadini con cecit&agrave; o sordit&agrave; riconosciuta.</p></div></div>
        </div>
      </section>''',
        '''<section id="procedura" class="content-section fade-in">
        <h2>Come presentare domanda</h2>
        <p>La procedura per il riconoscimento dell'invalidit&agrave; civile si articola in questi passaggi:</p>
        <ul class="feature-list">
          <li><strong>Certificato medico introduttivo:</strong> il medico curante compila e trasmette telematicamente il certificato all'INPS</li>
          <li><strong>Domanda di accertamento:</strong> viene presentata telematicamente dal Patronato INAPI entro 90 giorni dal certificato</li>
          <li><strong>Visita medica:</strong> la Commissione ASL/INPS convoca il richiedente per la visita di accertamento</li>
          <li><strong>Verbale:</strong> viene notificato l'esito dell'accertamento con la percentuale di invalidit&agrave; riconosciuta</li>
          <li><strong>Eventuali ricorsi:</strong> in caso di esito non favorevole, il Patronato pu&ograve; assistere nel ricorso</li>
        </ul>
      </section>''',
        '''<section id="documenti" class="content-section fade-in">
        <h2>Documenti necessari</h2>
        <ul class="doc-list">
          <li>Documento di identit&agrave; e codice fiscale</li>
          <li>Certificato medico introduttivo (rilasciato dal medico curante)</li>
          <li>Cartelle cliniche e documentazione sanitaria</li>
          <li>Eventuali verbali di invalidit&agrave; precedenti</li>
          <li>Certificati di specialisti</li>
          <li>Eventuali provvedimenti di ricovero</li>
        </ul>
      </section>'''
    ],
    "Hai bisogno di assistenza per l'invalidit&agrave; civile?",
    "Il Patronato INAPI presso la sede di Torino ti accompagna in tutto il percorso di riconoscimento."
)

# ── SUCCESSIONI ──────────────────────────────────────────────────────────
make_page(
    "successioni.html",
    "Successioni",
    "Dichiarazioni di successione e volture catastali presso il CAF FENAPI di Torino. Assistenza completa per pratiche ereditarie.",
    "Dichiarazioni di successione, volture catastali e pratiche ereditarie",
    "Successioni",
    [("cos-e","Cos'&egrave; la dichiarazione"), ("obbligati","Chi deve presentarla"), ("termini","Termini e scadenze"), ("documenti","Documenti necessari")],
    [
        '''<section id="cos-e" class="content-section fade-in">
        <h2>Cos'&egrave; la dichiarazione di successione</h2>
        <p>La dichiarazione di successione &egrave; un adempimento obbligatorio di natura fiscale che gli eredi devono presentare all'Agenzia delle Entrate entro 12 mesi dalla data di apertura della successione (generalmente la data del decesso).</p>
        <p>Il CAF FENAPI di Torino assiste gli eredi nella compilazione e trasmissione telematica della dichiarazione, nel calcolo delle imposte dovute e nella presentazione delle volture catastali.</p>
      </section>''',
        '''<section id="obbligati" class="content-section fade-in">
        <h2>Chi deve presentare la dichiarazione</h2>
        <ul class="feature-list">
          <li>Eredi e legatari (o loro rappresentanti legali)</li>
          <li>Immessi nel possesso dei beni in caso di assenza del defunto</li>
          <li>Amministratori dell'eredit&agrave;</li>
          <li>Curatori delle eredit&agrave; giacenti</li>
          <li>Esecutori testamentari</li>
          <li>Trust e relativi trustee</li>
        </ul>
        <div class="info-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <div><strong>Esonero</strong><p>La dichiarazione non &egrave; obbligatoria se l'eredit&agrave; &egrave; devoluta al coniuge e ai parenti in linea retta e l'attivo ereditario non supera 100.000 euro e non comprende immobili o diritti reali immobiliari.</p></div>
        </div>
      </section>''',
        '''<section id="termini" class="content-section fade-in">
        <h2>Termini e scadenze</h2>
        <ul class="feature-list">
          <li>La dichiarazione va presentata entro <strong>12 mesi</strong> dalla data del decesso</li>
          <li>Le volture catastali devono essere presentate entro <strong>30 giorni</strong> dalla dichiarazione</li>
          <li>In caso di ritardo si applicano sanzioni e interessi</li>
        </ul>
      </section>''',
        '''<section id="documenti" class="content-section fade-in">
        <h2>Documenti necessari</h2>
        <ul class="doc-list">
          <li>Certificato di morte</li>
          <li>Stato di famiglia del defunto e degli eredi</li>
          <li>Codice fiscale del defunto e di tutti gli eredi</li>
          <li>Documenti di identit&agrave; degli eredi</li>
          <li>Eventuale testamento</li>
          <li>Atto di rinuncia all'eredit&agrave; (se presente)</li>
          <li>Visure catastali degli immobili del defunto</li>
          <li>Atti di provenienza degli immobili (compravendita, donazione, successione precedente)</li>
          <li>Estratti conto bancari e postali alla data del decesso e fino alla data di dichiarazione</li>
          <li>Certificati titoli, fondi, polizze vita</li>
          <li>Documentazione relativa a debiti del defunto</li>
          <li>Spese funebri sostenute</li>
          <li>Spese mediche degli ultimi 6 mesi di vita</li>
        </ul>
      </section>'''
    ],
    "Devi presentare una dichiarazione di successione?",
    "Il CAF FENAPI di Torino ti assiste nella compilazione della dichiarazione e nelle volture catastali."
)

print("\n✅ Tutte le pagine servizi sono state create con successo!")
