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
