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
                   Superata la scadenza il bando finisce da solo in "Archivio".
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
