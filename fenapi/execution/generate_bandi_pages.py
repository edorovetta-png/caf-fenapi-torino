#!/usr/bin/env python3
"""Genera frontend/bandi/index.html e frontend/bandi/<categoria>.html a partire dal template di frontend/enfip.html.
Uso: python execution/generate_bandi_pages.py   (da lanciare dopo ogni modifica a enfip.html o alle categorie)"""
import re, json, os
from urllib.parse import quote

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend")
SITE = "https://www.fenapipiemonte.org"
TODAY = "2026-09-09"

CATS = [
  dict(slug="agricoltura", nome="Agricoltura", breve="Corsi finanziati per aziende agricole e zootecniche (CSR Piemonte / FEASR).",
       titolo_pagina="Bandi Agricoltura — corsi finanziati per aziende agricole",
       intro="Percorsi formativi finanziati con i contributi del Complemento Regionale per lo Sviluppo Rurale (CSR Piemonte / Fondo FEASR) e i bandi della Regione Piemonte, rivolti a imprenditori agricoli, coadiuvanti, dipendenti del settore agricolo e zootecnico, giovani e nuovi agricoltori, microimprese delle zone rurali.",
       anchor="enfip.html#agricoltura",
       icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22V12"/><path d="M12 12c0-4 3-7 7-7 0 4-3 7-7 7z"/><path d="M12 16c0-4-3-7-7-7 0 4 3 7 7 7z"/></svg>'),
  dict(slug="ficp", nome="FICP — Lingue e Comunicazione", breve="Buoni Formazione Regione Piemonte: inglese, comunicazione, vendita.",
       titolo_pagina="Bandi FICP — corsi di lingue e comunicazione con Buoni Formazione",
       intro="Corsi finanziati dalla Regione Piemonte tramite la misura FICP (Formazione Individuale Continua e Permanente): inglese per tutti i livelli (A1–C1), comunicazione analogica e non verbale, comunicazione per vendere e persuasione etica. Con i Buoni Formazione il 70% della quota è a carico della Regione, con gratuità totale nei casi previsti.",
       anchor="enfip.html#ficp",
       icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>'),
  dict(slug="apprendisti", nome="Apprendisti", breve="Formazione per l'apprendistato di I e II livello e di ricollocazione.",
       titolo_pagina="Bandi Apprendisti — formazione per l'apprendistato",
       intro="Formazione prevista per gli apprendisti: apprendistato di I livello (titolo di studio, 15–25 anni), di II livello professionalizzante (18–29 anni) e apprendistato di ricollocazione per lavoratori in mobilità o disoccupazione.",
       anchor="enfip.html#apprendistato",
       icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>'),
  dict(slug="sicurezza", nome="Sicurezza", breve="Corsi e aggiornamenti D.Lgs. 81/2008: lavoratori, RSPP, RLS, preposti, macchine.",
       titolo_pagina="Bandi Sicurezza sul lavoro — corsi e aggiornamenti D.Lgs. 81/2008",
       intro="Corsi di formazione e aggiornamento in materia di salute e sicurezza sul lavoro conformi al D.Lgs. 81/2008 e agli Accordi Stato-Regioni: formazione generale e specifica lavoratori (rischio basso, medio, alto), RSPP datore di lavoro, RLS, preposti e dirigenti, abilitazioni per macchine e attrezzature.",
       anchor="enfip.html#sicurezza",
       icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>'),
  dict(slug="fitosanitari", nome="Patentini Fitosanitari", breve="Rilascio e rinnovo del patentino fitosanitari (PAN) — sede di Acqui Terme.",
       titolo_pagina="Bandi Patentino Fitosanitari — rilascio e rinnovo (Acqui Terme)",
       intro="Corsi per il rilascio e il rinnovo dell'abilitazione all'acquisto, all'utilizzo e alla vendita dei prodotti fitosanitari (patentino PAN). I corsi si svolgono esclusivamente nella sede di Acqui Terme.",
       anchor="enfip.html#fitosanitari",
       icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M15 8h3M15 12h3M6 17h12"/></svg>'),
  dict(slug="fondo-conoscenza", nome="Fondo Conoscenza", breve="Formazione aziendale a costo zero finanziata dal Fondo Paritetico Interprofessionale.",
       titolo_pagina="Bandi Fondo Conoscenza — formazione aziendale finanziata",
       intro="Piani formativi aziendali finanziati da Fondo Conoscenza, il Fondo Paritetico Interprofessionale promosso da FENAPI e CIU: corsi obbligatori e su misura per le imprese aderenti, senza costi di adesione. ENFIP Piemonte segue analisi dei fabbisogni, presentazione del piano e rendicontazione.",
       anchor="enfip.html#fondo-conoscenza",
       icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>'),
]

src = open(os.path.join(BASE, "enfip.html"), encoding="utf-8").read()

# ---- pezzi del template --------------------------------------------------
head_top = src[: src.index("  <meta charset")]                       # GA
i_css = src.index("  <!-- Critical CSS")
i_css_end = src.index("</noscript>", src.index('service-page.css" media="print"')) + len("</noscript>")
critical = src[i_css:i_css_end]
i_body = src.index("<body>") + len("<body>")
i_hero = src.index("  <!-- Page Hero -->")
header = src[i_body:i_hero]
i_footer = src.index("  <!-- Footer -->")
footer = src[i_footer:]

def relativize(html):
    """Le pagine stanno in bandi/: i link relativi al root vanno prefissati con ../"""
    def fix(m):
        attr, url = m.group(1), m.group(2)
        if url.startswith(("http", "mailto:", "tel:", "#", "../", "data:")):
            return m.group(0)
        return '%s="../%s"' % (attr, url)
    return re.sub(r'\b(href|src)="([^"]+)"', fix, html)

critical_rel = relativize(critical)
header_rel = relativize(header)
footer_rel = relativize(footer)
# nav: nessuna voce attiva tranne "Il Gruppo" (già così in enfip.html)

CONTACT_CTA = '''          <div class="sidebar-cta">
            <h4>Informazioni e iscrizioni</h4>
            <p>Per iscriverti a un corso o ricevere la modulistica contatta la segreteria ENFIP.</p>
            <a href="mailto:info@enfip.eu?subject=Richiesta%20informazioni%20bandi%20ENFIP" class="btn-sidebar-cta">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Scrivi a ENFIP
            </a>
            <div class="sidebar-contact">
              <p><strong>Telefono:</strong> <a href="tel:+39011799999">011 799999</a> (int. 1)</p>
              <p><strong>Email:</strong> <a href="mailto:info@enfip.eu">info@enfip.eu</a></p>
              <p><strong>Facebook:</strong> <a href="https://www.facebook.com/enfip/" target="_blank" rel="noopener noreferrer">ENFIP Piemonte</a></p>
            </div>
          </div>
'''

ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>'

def sidebar_nav(active=None):
    items = ['<a href="index.html"%s>Tutte le categorie</a>' % (' class="active"' if active is None else '')]
    for c in CATS:
        items.append('<a href="%s.html"%s>%s</a>' % (c["slug"], ' class="active"' if active == c["slug"] else '', c["nome"]))
    items.append('<a href="../enfip.html">&larr; Torna a ENFIP Piemonte</a>')
    return '''          <div class="sidebar-nav">
            <h4>Bandi per categoria</h4>
            %s
          </div>
''' % "\n            ".join(items)

LIGHTBOX = '''  <div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Locandina">
    <button class="lightbox-close" type="button" aria-label="Chiudi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    <img src="" alt="">
  </div>
'''

def head(title, desc, url, og_alt, schema_blocks):
    return head_top + '''  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>%(title)s</title>
  <meta name="description" content="%(desc)s">
  <meta name="author" content="ENFIP Piemonte">

  <!-- Canonical -->
  <link rel="canonical" href="%(url)s">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Circolo FENAPI Torino">
  <meta property="og:locale" content="it_IT">
  <meta property="og:url" content="%(url)s">
  <meta property="og:title" content="%(title)s">
  <meta property="og:description" content="%(desc)s">
  <meta property="og:image" content="%(site)s/images/og-fenapi-torino-1200x630.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="%(og_alt)s">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="%(title)s">
  <meta name="twitter:description" content="%(desc)s">
  <meta name="twitter:image" content="%(site)s/images/og-fenapi-torino-1200x630.jpg">

  <link rel="icon" type="image/png" href="../images/logo-fenapi.png">

  <!-- Google Fonts (non-blocking) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Open+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Shadows+Into+Light&display=swap">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Open+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Shadows+Into+Light&display=swap" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Open+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Shadows+Into+Light&display=swap"></noscript>

''' % dict(title=title, desc=desc, url=url, og_alt=og_alt, site=SITE) + critical_rel + '''
  <link rel="stylesheet" href="bandi.css">

''' + schema_blocks + "</head>\n<body>"

def breadcrumb_schema(items):
    return '''  <script type="application/ld+json">
  %s
  </script>
''' % json.dumps({"@context": "https://schema.org", "@type": "BreadcrumbList",
                  "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "item": u} for i, (n, u) in enumerate(items)]},
                 ensure_ascii=False, indent=2).replace("\n", "\n  ")

def webpage_schema(url, name, desc):
    return '''  <script type="application/ld+json">
  %s
  </script>
''' % json.dumps({"@context": "https://schema.org", "@type": "CollectionPage", "@id": url + "#webpage", "url": url,
                  "name": name, "description": desc, "inLanguage": "it", "dateModified": TODAY,
                  "isPartOf": {"@id": SITE + "/#business"},
                  "about": {"@id": SITE + "/enfip.html#organization"}}, ensure_ascii=False, indent=2).replace("\n", "\n  ")

SCRIPTS = '''
  <script src="../script.js"></script>
  <script src="bandi-data.js"></script>
  <script src="bandi.js"></script>
</body>
</html>
'''

def finish_footer(f):
    # sostituisce la coda script di enfip.html con la nostra
    return f[: f.index('  <script src="../script.js"></script>')]

footer_final = finish_footer(footer_rel)

# ---- INDEX -------------------------------------------------------------------
url = SITE + "/bandi/"
title = "Bandi e corsi in partenza — ENFIP Piemonte | Locandine per categoria"
desc = "Bandi e corsi in partenza di ENFIP Piemonte, divisi per categoria: agricoltura, FICP lingue e comunicazione, apprendisti, sicurezza sul lavoro, patentini fitosanitari, Fondo Conoscenza. Locandine, scadenze e contatti per iscriversi."
cards = []
for c in CATS:
    cards.append('''        <a href="%(slug)s.html" class="categoria-card fade-in">
          <div class="categoria-card-icon">%(icon)s</div>
          <h3>%(nome)s</h3>
          <p>%(breve)s</p>
          <div class="categoria-card-footer"><span class="badge-count" data-count-categoria="%(slug)s">&hellip;</span><span>Vedi i bandi %(arrow)s</span></div>
        </a>''' % dict(c, arrow=ARROW))
index_body = header_rel + '''  <!-- Page Hero -->
  <section class="page-hero">
    <div class="container">
      <div class="breadcrumb"><a href="../index.html">Home</a> <span>/</span> <a href="../enfip.html">ENFIP Piemonte</a> <span>/</span> <strong>Bandi</strong></div>
      <h1>Bandi e corsi in partenza</h1>
      <p class="page-hero-subtitle">Scegli la categoria che ti interessa per vedere le locandine dei bandi ENFIP Piemonte aperti e l'archivio di quelli conclusi</p>
    </div>
  </section>

  <main class="service-page">
    <div class="container">
      <div class="service-layout">
        <aside class="service-sidebar">
%(nav)s%(cta)s        </aside>
        <div class="service-content">
          <section class="content-section">
            <h2>Scegli una categoria</h2>
            <p>ENFIP Piemonte pubblica qui le locandine dei corsi e dei bandi in partenza. Seleziona una categoria: troverai i bandi aperti con scadenze e modalit&agrave; di iscrizione, e in fondo alla pagina l'archivio dei bandi conclusi.</p>
            <div class="categorie-grid">
%(cards)s
            </div>
          </section>
          <div class="content-cta fade-in">
            <h3>Non trovi il corso che cerchi?</h3>
            <p>Scrivi o chiama la segreteria: ti indichiamo le prossime edizioni e le possibilit&agrave; di finanziamento.</p>
            <div class="content-cta-actions">
              <a href="mailto:info@enfip.eu?subject=Richiesta%%20informazioni%%20corsi%%20ENFIP" class="btn-hero-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Scrivi a info@enfip.eu
              </a>
              <a href="tel:+39011799999" class="btn-hero-secondary">Chiama: 011 799999 (int. 1)</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

''' % dict(nav=sidebar_nav(None), cta=CONTACT_CTA, cards="\n".join(cards))
schemas = webpage_schema(url, "Bandi e corsi in partenza — ENFIP Piemonte", desc) + breadcrumb_schema([("Home", SITE + "/"), ("ENFIP Piemonte", SITE + "/enfip.html"), ("Bandi", url)])
html = head(title, desc, url, "Bandi e corsi ENFIP Piemonte", schemas) + index_body + footer_final + SCRIPTS
os.makedirs(os.path.join(BASE, "bandi", "locandine"), exist_ok=True)
open(os.path.join(BASE, "bandi", "index.html"), "w", encoding="utf-8").write(html)

# ---- CATEGORIE ---------------------------------------------------------------
for c in CATS:
    url = SITE + "/bandi/%s.html" % c["slug"]
    title = "%s — ENFIP Piemonte" % c["titolo_pagina"]
    desc = ("Locandine e scadenze dei bandi ENFIP Piemonte nella categoria %s. %s Contatti: 011 799999 int. 1, info@enfip.eu." % (c["nome"], c["breve"]))
    body = header_rel + '''  <!-- Page Hero -->
  <section class="page-hero">
    <div class="container">
      <div class="breadcrumb"><a href="../index.html">Home</a> <span>/</span> <a href="../enfip.html">ENFIP Piemonte</a> <span>/</span> <a href="index.html">Bandi</a> <span>/</span> <strong>%(nome)s</strong></div>
      <h1>Bandi %(nome)s</h1>
      <p class="page-hero-subtitle">%(breve)s</p>
    </div>
  </section>

  <main class="service-page">
    <div class="container">
      <div class="service-layout">
        <aside class="service-sidebar">
%(nav)s%(cta)s        </aside>
        <div class="service-content">
          <section class="content-section" id="bandiRoot" data-categoria="%(slug)s">
            <h2>Bandi aperti <span id="bandiApertiCount" style="color:var(--primary);font-size:20px;"></span></h2>
            <p>%(intro)s <a href="../%(anchor)s">Scopri di pi&ugrave; su questa area formativa</a>.</p>
            <div id="bandiAperti"></div>
          </section>
          <section class="content-section bandi-archivio fade-in" id="bandiArchivio">
            <h2>Bandi conclusi <span id="bandiChiusiCount" style="color:var(--text-muted);font-size:20px;"></span></h2>
            <p>Storico dei bandi %(nome)s gi&agrave; chiusi: le iscrizioni sono terminate, ma le locandine restano consultabili. Per conoscere le prossime edizioni contatta la segreteria.</p>
            <div id="bandiChiusi"></div>
          </section>
          <div class="content-cta fade-in">
            <h3>Vuoi iscriverti o avere informazioni?</h3>
            <p>Contatta la segreteria ENFIP Piemonte: ti inviamo la modulistica di iscrizione e i dettagli su date, sedi e finanziamenti.</p>
            <div class="content-cta-actions">
              <a href="mailto:info@enfip.eu?subject=Informazioni%%20bandi%%20%(nome_url)s" class="btn-hero-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Scrivi a info@enfip.eu
              </a>
              <a href="tel:+39011799999" class="btn-hero-secondary">Chiama: 011 799999 (int. 1)</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

''' % dict(c, nav=sidebar_nav(c["slug"]), cta=CONTACT_CTA, nome_url=quote(c["nome"]))
    schemas = webpage_schema(url, title, desc) + breadcrumb_schema([("Home", SITE + "/"), ("ENFIP Piemonte", SITE + "/enfip.html"), ("Bandi", SITE + "/bandi/"), (c["nome"], url)])
    html = head(title, desc, url, "Bandi %s — ENFIP Piemonte" % c["nome"], schemas) + body + LIGHTBOX + footer_final + SCRIPTS
    open(os.path.join(BASE, "bandi", "%s.html" % c["slug"]), "w", encoding="utf-8").write(html)

print("ok: index + %d categorie" % len(CATS))
