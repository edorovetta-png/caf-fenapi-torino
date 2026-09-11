/* ============================================================================
   ENFIP Piemonte — Elenco bandi e locandine
   ----------------------------------------------------------------------------
   Per aggiungere un bando basta aggiungere un oggetto a questa lista.
   Le pagine bandi/<categoria>.html si aggiornano da sole.

   Campi:
   - id          : identificativo unico (es. "sicurezza-2026-10")
   - categoria   : una tra "agricoltura" | "ficp" | "apprendisti" | "sicurezza"
                   | "fitosanitari" | "fondo-conoscenza"
   - titolo      : titolo del corso/bando
   - descrizione : (opzionale) una o due righe di dettaglio
   - sede        : (opzionale) es. "Torino" o "Acqui Terme"
   - pubblicato  : data di pubblicazione, formato "AAAA-MM-GG"
   - scadenza    : (opzionale) termine iscrizioni, formato "AAAA-MM-GG".
                   Superata la scadenza il bando finisce da solo tra i conclusi.
   - periodo     : (opzionale) testo libero mostrato sulla scheda al posto di
                   "Pubblicato il", es. "dal 7 gennaio 2025 al 4 febbraio 2025".
                   Per i corsi già svolti: periodo + stato "chiuso".
   - locandina   : percorso immagine della locandina (jpg/png/webp), relativo
                   alla cartella bandi/ — es. "locandine/sicurezza-2026-10.jpg"
   - pdf         : (opzionale) percorso del PDF della locandina
   - stato       : "aperto" | "chiuso". Usa "chiuso" per archiviare a mano un
                   bando prima della scadenza (posti esauriti, corso partito).
   ========================================================================== */
window.ENFIP_BANDI = [
  {
    id: "fitosanitari-rilascio-rinnovo",
    categoria: "fitosanitari",
    titolo: "Corsi rilascio e rinnovo patentini fitosanitari",
    descrizione: "Corso rilascio (base, 20 ore, nessun prerequisito) e corso rinnovo (aggiornamento, 30 ore, per chi ha un patentino in corso di validità): utilizzo sicuro dei prodotti fitosanitari, normative vigenti, modalità d'uso, sicurezza operatori, salvaguardia ambiente, monitoraggio avversità. In collaborazione con Agriforesta.",
    sede: "Acqui Terme",
    pubblicato: "2026-09-10",
    locandina: "locandine/fitosanitari-rilascio-rinnovo.jpg",
    stato: "aperto"
  },
  {
    id: "sicurezza-corsi-dlgs-81-2008",
    categoria: "sicurezza",
    titolo: "Corsi di sicurezza obbligatoria D.Lgs. 81/2008",
    descrizione: "Lavoratori e preposti (formazione generale e specifica, aggiornamenti periodici, DPI); RSPP e ASPP (moduli A, B, C, rischio alto/medio/basso); macchinari semoventi e attrezzature (movimento terra, sollevatori telescopici, carrelli elevatori, piattaforme di lavoro elevabili PLE).",
    sede: "Torino",
    pubblicato: "2026-09-10",
    locandina: "locandine/sicurezza-corsi-dlgs-81-2008.jpg",
    stato: "aperto"
  },
  {
    id: "apprendistato-formazione-base-trasversale",
    categoria: "apprendisti",
    titolo: "Apprendistato professionalizzante — formazione di base e trasversale",
    descrizione: "Totalmente finanziata. Modulo 1: sicurezza, organizzazione e qualità aziendale (40 ore). Modulo 2: comunicazione in lingua inglese nell'ambiente di lavoro (40 ore). Modulo 3: competenza chiave di cittadinanza, imparare ad imparare (40 ore, presso l'azienda).",
    sede: "Torino",
    pubblicato: "2026-09-10",
    locandina: "locandine/apprendistato-formazione-base-trasversale.jpg",
    pdf: "locandine/apprendistato-formazione-base-trasversale.pdf",
    stato: "aperto"
  },
  /* ---- Agricoltura — corsi CSR 2023-27 SRH03 già svolti (storico) ---- */
  {"id": "agricoltura-11-piverone", "categoria": "agricoltura", "titolo": "Riduzione dell’impatto della viticoltura", "descrizione": "Nell’ambito dell’agroecosistema vigneto. Corso finanziato nell’ambito del CSR 2023-27, Intervento SRH03 (Bando 1/2023): 18 ore, dal 13 marzo 2026 al 26 marzo 2026. Sede: Cantina della Serra - sala riunione - Str. Nuova n. 12 - Piverone (To).", "sede": "Piverone (TO)", "pubblicato": "2026-03-13", "periodo": "dal 13 marzo 2026 al 26 marzo 2026", "locandina": "locandine/agricoltura-11-piverone.jpg", "pdf": "locandine/agricoltura-11-piverone.pdf", "stato": "chiuso"},
  {"id": "agricoltura-07-lagnasco", "categoria": "agricoltura", "titolo": "Miglioramento della gestione suolo-pianta in frutticoltura", "descrizione": "Corso finanziato nell’ambito del CSR 2023-27, Intervento SRH03 (Bando 1/2023): 15 ore, dal 23 febbraio 2026 al 9 marzo 2026. Sede: Via Praetta, 2 - Lagnasco (CN).", "sede": "Lagnasco (CN)", "pubblicato": "2026-02-23", "periodo": "dal 23 febbraio 2026 al 9 marzo 2026", "locandina": "locandine/agricoltura-07-lagnasco.jpg", "pdf": "locandine/agricoltura-07-lagnasco.pdf", "stato": "chiuso"},
  {"id": "agricoltura-08-rocca-de-baldi", "categoria": "agricoltura", "titolo": "Innovazioni nei sistemi colturali cerealicoli", "descrizione": "Obiettivi del programma farm to fork e mantenimento della produttività della qualità e della redditività aziendale. Corso finanziato nell’ambito del CSR 2023-27, Intervento SRH03 (Bando 1/2023): 18 ore, dal 18 febbraio 2026 al 5 marzo 2026. Sede: Sala Associazioni Via Peirone n. 40 – Fraz. Crava; Rocca de Baldi ( Cn).", "sede": "Rocca de’ Baldi (CN)", "pubblicato": "2026-02-18", "periodo": "dal 18 febbraio 2026 al 5 marzo 2026", "locandina": "locandine/agricoltura-08-rocca-de-baldi.jpg", "pdf": "locandine/agricoltura-08-rocca-de-baldi.pdf", "stato": "chiuso"},
  {"id": "agricoltura-10-candiolo", "categoria": "agricoltura", "titolo": "Innovazioni nei sistemi colturali cerealicoli di qualità", "descrizione": "Obiettivi del programma farm to fork e mantenimento della produttività della qualità e della redditività aziendale. Corso finanziato nell’ambito del CSR 2023-27, Intervento SRH03 (Bando 1/2023): 18 ore, dal 11 febbraio 2026 al 20 febbraio 2026. Sede: Sala riunioni Fregola s.s del Sestriere n. 23 – Candiolo ( To).", "sede": "Candiolo (TO)", "pubblicato": "2026-02-11", "periodo": "dal 11 febbraio 2026 al 20 febbraio 2026", "locandina": "locandine/agricoltura-10-candiolo.jpg", "pdf": "locandine/agricoltura-10-candiolo.pdf", "stato": "chiuso"},
  {"id": "agricoltura-16-lagnasco", "categoria": "agricoltura", "titolo": "Ottimizzazione e miglioramento delle risorse energetiche", "descrizione": "Corso finanziato nell’ambito del CSR 2023-27, Intervento SRH03 (Bando 1/2023): 18 ore, dal 9 febbraio 2026 al 9 marzo 2026. Sede: Via Praetta, 2 - Lagnasco (CN).", "sede": "Lagnasco (CN)", "pubblicato": "2026-02-09", "periodo": "dal 9 febbraio 2026 al 9 marzo 2026", "locandina": "locandine/agricoltura-16-lagnasco.jpg", "pdf": "locandine/agricoltura-16-lagnasco.pdf", "stato": "chiuso"},
  {"id": "agricoltura-09-morozzo", "categoria": "agricoltura", "titolo": "Innovazioni nei sistemi colturali cerealicoli", "descrizione": "Obiettivi del programma farm to fork e mantenimento della produttività della qualità e della redditività aziendale. Corso finanziato nell’ambito del CSR 2023-27, Intervento SRH03 (Bando 1/2023): 24 ore, dal 6 febbraio 2026 al 5 marzo 2026. Sede: Sala comunale via Bongioanni n. 4 – Morozzo ( Cn).", "sede": "Morozzo (CN)", "pubblicato": "2026-02-06", "periodo": "dal 6 febbraio 2026 al 5 marzo 2026", "locandina": "locandine/agricoltura-09-morozzo.jpg", "pdf": "locandine/agricoltura-09-morozzo.pdf", "stato": "chiuso"},
  {"id": "agricoltura-03-alice-bel-colle", "categoria": "agricoltura", "titolo": "Sostenibilità agronomica ed ecologica dei vigneti", "descrizione": "Nell’ambito del cambiamento climatico. Corso finanziato nell’ambito del CSR 2023-27, Intervento SRH03 (Bando 1/2023): 21 ore, dal 14 gennaio 2026 al 16 febbraio 2026. Sede: sala biblioteca – piazza Guacchione 1 comune di Alice Bel Colle (Al).", "sede": "Alice Bel Colle (AL)", "pubblicato": "2026-01-14", "periodo": "dal 14 gennaio 2026 al 16 febbraio 2026", "locandina": "locandine/agricoltura-03-alice-bel-colle.jpg", "pdf": "locandine/agricoltura-03-alice-bel-colle.pdf", "stato": "chiuso"},
  {"id": "agricoltura-15-lagnasco", "categoria": "agricoltura", "titolo": "Gestione della risorsa idrica in frutticoltura", "descrizione": "Corso finanziato nell’ambito del CSR 2023-27, Intervento SRH03 (Bando 1/2023): 18 ore, dal 13 gennaio 2026 al 27 gennaio 2026. Sede: Via Praetta, 2 - Lagnasco (CN).", "sede": "Lagnasco (CN)", "pubblicato": "2026-01-13", "periodo": "dal 13 gennaio 2026 al 27 gennaio 2026", "locandina": "locandine/agricoltura-15-lagnasco.jpg", "pdf": "locandine/agricoltura-15-lagnasco.pdf", "stato": "chiuso"},
  {"id": "agricoltura-20-rocca-de-baldi", "categoria": "agricoltura", "titolo": "Gestione del benessere animale negli allevamenti", "descrizione": "Corso finanziato nell’ambito del CSR 2023-27, Intervento SRH03 (Bando 1/2023): 21 ore, dal 16 dicembre 2025 al 10 febbraio 2026. Sede: Sala Associazioni Via Peirone n. 40 – Fraz. Crava; Rocca de Baldi ( Cn).", "sede": "Rocca de’ Baldi (CN)", "pubblicato": "2025-12-16", "periodo": "dal 16 dicembre 2025 al 10 febbraio 2026", "locandina": "locandine/agricoltura-20-rocca-de-baldi.jpg", "pdf": "locandine/agricoltura-20-rocca-de-baldi.pdf", "stato": "chiuso"},
  {"id": "agricoltura-17-candiolo", "categoria": "agricoltura", "titolo": "Sistemi innovativi di gestione agronomica dell’azienda per una maggior sostenibilità economica e ambientale", "descrizione": "Gestione agronomica delle coltivazioni aziendali. Corso finanziato nell’ambito del CSR 2023-27, Intervento SRH03 (Bando 1/2023): 15 ore, dal 14 novembre 2025 al 25 febbraio 2026. Sede: Sala riunioni Fregola s.s del Sestriere n. 23 – Candiolo ( To).", "sede": "Candiolo (TO)", "pubblicato": "2025-11-14", "periodo": "dal 14 novembre 2025 al 25 febbraio 2026", "locandina": "locandine/agricoltura-17-candiolo.jpg", "pdf": "locandine/agricoltura-17-candiolo.pdf", "stato": "chiuso"},
  {"id": "agricoltura-18-agliano-terme", "categoria": "agricoltura", "titolo": "Gestione del suolo con i cambiamenti climatici nel contesto paesaggistico", "descrizione": "Nuove tecniche per mantenimento della fertilità e aumento della biodiversità all’interno dell’agroecosistema vigneto. Corso finanziato nell’ambito del CSR 2023-27, Intervento SRH03 (Bando 1/2023): 18 ore, dal 11 novembre 2025 al 26 novembre 2025. Sede: Cantina Sei Castelli - Reg. Salere n. 6 - Agliano Terme ( At.).", "sede": "Agliano Terme (AT)", "pubblicato": "2025-11-11", "periodo": "dal 11 novembre 2025 al 26 novembre 2025", "locandina": "locandine/agricoltura-18-agliano-terme.jpg", "pdf": "locandine/agricoltura-18-agliano-terme.pdf", "stato": "chiuso"},
  {"id": "agricoltura-13-alice-bel-colle", "categoria": "agricoltura", "titolo": "Gestione del suolo con i cambiamenti climatici", "descrizione": "Nuove tecniche per mantenimento della fertilità e aumento della biodiversità all’interno dell’agroecosistema vigneto. Corso finanziato nell’ambito del CSR 2023-27, Intervento SRH03 (Bando 1/2023): 18 ore, dal 10 novembre 2025 al 24 novembre 2025. Sede: sala biblioteca – piazza Guacchione 1 comune di Alice Bel Colle (Al).", "sede": "Alice Bel Colle (AL)", "pubblicato": "2025-11-10", "periodo": "dal 10 novembre 2025 al 24 novembre 2025", "locandina": "locandine/agricoltura-13-alice-bel-colle.jpg", "pdf": "locandine/agricoltura-13-alice-bel-colle.pdf", "stato": "chiuso"},
  {"id": "agricoltura-14-castelnuovo-don-bosco", "categoria": "agricoltura", "titolo": "Buone pratiche di gestione del suolo in viticoltura", "descrizione": "Aspetti per il miglioramento della fertilità e conservazione. Corso finanziato nell’ambito del CSR 2023-27, Intervento SRH03 (Bando 1/2023): 24 ore, dal 7 novembre 2025 al 28 novembre 2025. Sede: Sala riunioni Via S. Giovanni n. 6 - Castel nuovo Don Bosco (At).", "sede": "Castelnuovo Don Bosco (AT)", "pubblicato": "2025-11-07", "periodo": "dal 7 novembre 2025 al 28 novembre 2025", "locandina": "locandine/agricoltura-14-castelnuovo-don-bosco.jpg", "pdf": "locandine/agricoltura-14-castelnuovo-don-bosco.pdf", "stato": "chiuso"},
  {"id": "agricoltura-19-candiolo", "categoria": "agricoltura", "titolo": "Gestione del benessere animale bovino da latte", "descrizione": "Corso finanziato nell’ambito del CSR 2023-27, Intervento SRH03 (Bando 1/2023): 18 ore, dal 20 febbraio 2025 al 12 marzo 2025. Sede: Sala riunioni Fregola Strada statale Sestriere n. 23 - Candiolo (To).", "sede": "Candiolo (TO)", "pubblicato": "2025-02-20", "periodo": "dal 20 febbraio 2025 al 12 marzo 2025", "locandina": "locandine/agricoltura-19-candiolo.jpg", "pdf": "locandine/agricoltura-19-candiolo.pdf", "stato": "chiuso"},
  {"id": "agricoltura-21-rocca-de-baldi", "categoria": "agricoltura", "titolo": "Sostenibilità degli allevamenti zootecnici", "descrizione": "Corso finanziato nell’ambito del CSR 2023-27, Intervento SRH03 (Bando 1/2023): 15 ore, dal 14 febbraio 2025 al 4 marzo 2025. Sede: Sala Associazioni Via Peirone n. 40 – Fraz. Crava; Rocca de Baldi ( Cn).", "sede": "Rocca de’ Baldi (CN)", "pubblicato": "2025-02-14", "periodo": "dal 14 febbraio 2025 al 4 marzo 2025", "locandina": "locandine/agricoltura-21-rocca-de-baldi.jpg", "pdf": "locandine/agricoltura-21-rocca-de-baldi.pdf", "stato": "chiuso"},
  {"id": "agricoltura-06-lagnasco", "categoria": "agricoltura", "titolo": "Buone pratiche di gestione del suolo in frutticoltura", "descrizione": "Obiettivi del programma farm to fork e mantenimento della produttività della qualità e della redditività aziendale. Corso finanziato nell’ambito del CSR 2023-27, Intervento SRH03 (Bando 1/2023): 21 ore, dal 11 febbraio 2025 al 4 marzo 2025. Sede: Via Praetta n. 2 - Lagnasco ( Cn).", "sede": "Lagnasco (CN)", "pubblicato": "2025-02-11", "periodo": "dal 11 febbraio 2025 al 4 marzo 2025", "locandina": "locandine/agricoltura-06-lagnasco.jpg", "pdf": "locandine/agricoltura-06-lagnasco.pdf", "stato": "chiuso"},
  {"id": "agricoltura-04-castelnuovo-don-bosco", "categoria": "agricoltura", "titolo": "Sostenibilità agronomica ed ecologica dei vigneti", "descrizione": "Nell’ambito del cambiamento climatico. Corso finanziato nell’ambito del CSR 2023-27, Intervento SRH03 (Bando 1/2023): 27 ore, dal 10 febbraio 2025 al 10 luglio 2025. Sede: Cantina Terre dei Santi – via San Giovanni n. 6 – Castelnuovo D. Bosco (At).", "sede": "Castelnuovo Don Bosco (AT)", "pubblicato": "2025-02-10", "periodo": "dal 10 febbraio 2025 al 10 luglio 2025", "locandina": "locandine/agricoltura-04-castelnuovo-don-bosco.jpg", "pdf": "locandine/agricoltura-04-castelnuovo-don-bosco.pdf", "stato": "chiuso"},
  {"id": "agricoltura-12-piverone", "categoria": "agricoltura", "titolo": "Gestione del suolo con i cambiamenti climatici", "descrizione": "Nuove tecniche per mantenimento della fertilità e aumento della biodiversità all’interno dell’agroecosistema vigneto. Corso finanziato nell’ambito del CSR 2023-27, Intervento SRH03 (Bando 1/2023): 18 ore, dal 23 gennaio 2025 al 13 marzo 2025. Sede: Cantina della Serra - sala riunione - Str. Nuova n. 12 - Piverone (To).", "sede": "Piverone (TO)", "pubblicato": "2025-01-23", "periodo": "dal 23 gennaio 2025 al 13 marzo 2025", "locandina": "locandine/agricoltura-12-piverone.jpg", "pdf": "locandine/agricoltura-12-piverone.pdf", "stato": "chiuso"},
  {"id": "agricoltura-02-piverone", "categoria": "agricoltura", "titolo": "Sostenibilità agronomica ed ecologica dei vigneti", "descrizione": "Nell’ambito del cambiamento climatico. Corso finanziato nell’ambito del CSR 2023-27, Intervento SRH03 (Bando 1/2023): 21 ore, dal 16 gennaio 2025 al 4 luglio 2025. Sede: Cantina della Serra - sala riunione - Str. Nuova n. 12 - Piverone (To).", "sede": "Piverone (TO)", "pubblicato": "2025-01-16", "periodo": "dal 16 gennaio 2025 al 4 luglio 2025", "locandina": "locandine/agricoltura-02-piverone.jpg", "pdf": "locandine/agricoltura-02-piverone.pdf", "stato": "chiuso"},
  {"id": "agricoltura-05-castelnuovo-calcea", "categoria": "agricoltura", "titolo": "Viticoltura e cambiamenti climatici", "descrizione": "Nuove tecniche per mantenimento della sostenibilità e redditività aziendale. Corso finanziato nell’ambito del CSR 2023-27, Intervento SRH03 (Bando 1/2023): 21 ore, dal 8 gennaio 2025 al 12 febbraio 2025. Sede: Cantina Sei Castelli - reg Opessina n. 41 – Castel nuovo Calcea 14040 ( At.).", "sede": "Castelnuovo Calcea (AT)", "pubblicato": "2025-01-08", "periodo": "dal 8 gennaio 2025 al 12 febbraio 2025", "locandina": "locandine/agricoltura-05-castelnuovo-calcea.jpg", "pdf": "locandine/agricoltura-05-castelnuovo-calcea.pdf", "stato": "chiuso"},
  {"id": "agricoltura-01-lagnasco", "categoria": "agricoltura", "titolo": "Cambiamenti climatici in frutticoltura", "descrizione": "Obiettivi del programma farm to fork e mantenimento della produttività della qualità e della redditività aziendale. Corso finanziato nell’ambito del CSR 2023-27, Intervento SRH03 (Bando 1/2023): 30 ore, dal 7 gennaio 2025 al 4 febbraio 2025. Sede: Via Praetta n. 2 - Lagnasco ( Cn).", "sede": "Lagnasco (CN)", "pubblicato": "2025-01-07", "periodo": "dal 7 gennaio 2025 al 4 febbraio 2025", "locandina": "locandine/agricoltura-01-lagnasco.jpg", "pdf": "locandine/agricoltura-01-lagnasco.pdf", "stato": "chiuso"},
  {
    id: "ficp-buono-formazione-2023-2027",
    categoria: "ficp",
    titolo: "Corsi di formazione finanziati — Buono Formazione FICP 2023-2027",
    descrizione: "Comunicazione aziendale analogica relazionale (40 ore), tecniche di comunicazione analogica per relazionarsi, coinvolgere e vendere (40 ore), comunicazione efficace e marketing strategico (40 ore), lingua inglese dal principiante al post-intermedio (60 ore). Il 70% del costo è finanziato dalla Regione Piemonte tramite Buono Formazione; 100% per ISEE fino a 10.000 €.",
    sede: "Torino / Rivoli",
    pubblicato: "2026-09-10",
    locandina: "locandine/ficp-buono-formazione-2023-2027.jpg",
    pdf: "locandine/ficp-buono-formazione-2023-2027.pdf",
    stato: "aperto"
  },
  {
    id: "ficp-voucher-2019-2021",
    categoria: "ficp",
    titolo: "Corsi di formazione finanziati — Voucher FCI 2019-2021",
    descrizione: "Comunicazione aziendale analogica relazionale, comunicazione analogica per vendere, team building, comunicazione efficace e marketing strategico, tecniche di leadership. Avviso Città Metropolitana di Torino, voucher 70% (100% per ISEE fino a 10.000 €).",
    sede: "Torino / Rivoli / Moncalieri",
    pubblicato: "2019-11-01",
    locandina: "locandine/ficp-voucher-2019-2021.jpg",
    pdf: "locandine/ficp-voucher-2019-2021.pdf",
    stato: "chiuso"
  },
  /* Esempio (da cancellare quando si inseriscono i bandi reali):
  {
    id: "sicurezza-2026-10",
    categoria: "sicurezza",
    titolo: "Formazione lavoratori — rischio basso (aggiornamento quinquennale)",
    descrizione: "6 ore in videoconferenza sincrona. Attestato valido su tutto il territorio nazionale.",
    sede: "Torino / online",
    pubblicato: "2026-09-15",
    scadenza: "2026-10-10",
    locandina: "locandine/sicurezza-2026-10.jpg",
    pdf: "locandine/sicurezza-2026-10.pdf",
    stato: "aperto"
  },
  */
];
