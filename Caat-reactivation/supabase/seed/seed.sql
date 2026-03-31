-- ══════════════════════════════════════════════════════════════════════════
-- CAAT REACTIVATION — Seed Data
-- Dati realistici per mercato alimentare all'ingrosso CAAT Torino
-- ══════════════════════════════════════════════════════════════════════════

-- ── CLIENTI (30) ────────────────────────────────────────────────────────
-- 18 dormienti (ultimo acquisto >60 giorni fa), 12 attivi
INSERT INTO clienti (id, nome, telefono, email, indirizzo, categoria, consenso_whatsapp) VALUES
-- DORMIENTI (ultimo acquisto 60-180 giorni fa)
('a0000001-0001-4000-a000-000000000001', 'Trattoria da Piero', '+39 347 112 3401', 'info@trattoriadapiero.it', 'Via Madama Cristina 45, Torino', 'trattoria', true),
('a0000001-0001-4000-a000-000000000002', 'Pizzeria Napoli Express', '+39 348 223 4502', 'napoliexpress@gmail.com', 'Corso Vittorio Emanuele 112, Torino', 'pizzeria', true),
('a0000001-0001-4000-a000-000000000003', 'Ristorante La Pergola', '+39 349 334 5603', 'lapergola@pec.it', 'Via Roma 78, Torino', 'ristorante', true),
('a0000001-0001-4000-a000-000000000004', 'Rosticceria Il Galletto', '+39 320 445 6704', NULL, 'Via Nizza 203, Torino', 'rosticceria', true),
('a0000001-0001-4000-a000-000000000005', 'Bar Caffè Torino', '+39 333 556 7805', 'barcaffetorino@gmail.com', 'Piazza Castello 12, Torino', 'bar', true),
('a0000001-0001-4000-a000-000000000006', 'Ristorante Il Cambio', '+39 347 667 8906', 'info@ilcambio.to', 'Piazza Carignano 2, Torino', 'ristorante', true),
('a0000001-0001-4000-a000-000000000007', 'Pizzeria La Verace', '+39 348 778 9007', NULL, 'Via Garibaldi 56, Torino', 'pizzeria', true),
('a0000001-0001-4000-a000-000000000008', 'Catering Piemonte Events', '+39 349 889 0108', 'info@piemonteevents.it', 'Corso Francia 180, Torino', 'catering', true),
('a0000001-0001-4000-a000-000000000009', 'Trattoria Monferrato', '+39 320 990 1209', 'monferrato.to@gmail.com', 'Via Po 34, Torino', 'trattoria', true),
('a0000001-0001-4000-a000-000000000010', 'Hotel Gran Mogol', '+39 333 101 2310', 'cucina@granmogol.it', 'Via Guarini 2, Torino', 'hotel', true),
('a0000001-0001-4000-a000-000000000011', 'Rosticceria Da Mario', '+39 347 212 3411', NULL, 'Corso Giulio Cesare 88, Torino', 'rosticceria', true),
('a0000001-0001-4000-a000-000000000012', 'Ristorante Solferino', '+39 348 323 4512', 'solferino@ristorante.it', 'Piazza Solferino 3, Torino', 'ristorante', true),
('a0000001-0001-4000-a000-000000000013', 'Pizzeria Bella Napoli', '+39 349 434 5613', 'bellanapoli.to@gmail.com', 'Via Cibrario 22, Torino', 'pizzeria', true),
('a0000001-0001-4000-a000-000000000014', 'Bar Pasticceria Delizia', '+39 320 545 6714', NULL, 'Corso Orbassano 155, Torino', 'bar', true),
('a0000001-0001-4000-a000-000000000015', 'Catering Gusto Italiano', '+39 333 656 7815', 'info@gustoitaliano.to', 'Via Cernaia 40, Torino', 'catering', true),
('a0000001-0001-4000-a000-000000000016', 'Rosticceria Sapori del Sud', '+39 347 767 8916', 'saporidelsud@gmail.com', 'Via Monginevro 67, Torino', 'rosticceria', true),
('a0000001-0001-4000-a000-000000000017', 'Trattoria dei Fratelli', '+39 348 878 9017', NULL, 'Corso Casale 90, Torino', 'trattoria', true),
('a0000001-0001-4000-a000-000000000018', 'Ristorante Aurora', '+39 349 989 0118', 'aurora.ristorante@gmail.com', 'Via Aurora 17, Torino', 'ristorante', true),
-- ATTIVI (acquisti recenti)
('a0000001-0001-4000-a000-000000000019', 'Pizzeria Da Gennaro', '+39 320 100 1219', 'gennaro@pizzeria.it', 'Via Berthollet 30, Torino', 'pizzeria', true),
('a0000001-0001-4000-a000-000000000020', 'Ristorante Vintage 1997', '+39 333 211 2320', 'info@vintage1997.it', 'Via Massena 15, Torino', 'ristorante', true),
('a0000001-0001-4000-a000-000000000021', 'Bar Sport Central', '+39 347 322 3421', NULL, 'Corso Re Umberto 44, Torino', 'bar', true),
('a0000001-0001-4000-a000-000000000022', 'Rosticceria La Brace', '+39 348 433 4522', 'labrace@gmail.com', 'Via Sacchi 18, Torino', 'rosticceria', true),
('a0000001-0001-4000-a000-000000000023', 'Hotel NH Torino Centro', '+39 349 544 5623', 'cucina@nhtorino.com', 'Corso Vittorio Emanuele 73, Torino', 'hotel', true),
('a0000001-0001-4000-a000-000000000024', 'Pizzeria Fratelli Ferrara', '+39 320 655 6724', 'ferrara.pizza@gmail.com', 'Via Mazzini 29, Torino', 'pizzeria', true),
('a0000001-0001-4000-a000-000000000025', 'Catering Elegance', '+39 333 766 7825', 'info@elegancecatering.to', 'Corso Peschiera 200, Torino', 'catering', true),
('a0000001-0001-4000-a000-000000000026', 'Ristorante Da Ciro', '+39 347 877 8926', NULL, 'Via Lagrange 8, Torino', 'ristorante', true),
('a0000001-0001-4000-a000-000000000027', 'Bar Caffetteria Mokà', '+39 348 988 9027', 'moka.bar@gmail.com', 'Piazza Vittorio Veneto 5, Torino', 'bar', true),
('a0000001-0001-4000-a000-000000000028', 'Ristorante Tre Galli', '+39 349 099 0128', 'info@tregalli.it', 'Via Sant''Agostino 25, Torino', 'ristorante', true),
('a0000001-0001-4000-a000-000000000029', 'Pizzeria Il Vesuvio', '+39 320 100 1229', 'vesuvio.to@gmail.com', 'Corso Siracusa 14, Torino', 'pizzeria', true),
('a0000001-0001-4000-a000-000000000030', 'Ristorante Porto Cervo', '+39 333 211 2330', 'portocervo@ristorante.it', 'Via della Rocca 10, Torino', 'ristorante', true);

-- ── PRODOTTI (50) ───────────────────────────────────────────────────────
INSERT INTO prodotti (id, nome, categoria, prezzo_listino, unita_misura, fornitore, disponibile, data_inserimento) VALUES
-- Latticini (10)
('b0000001-0001-4000-b000-000000000001', 'Mozzarella Fior di Latte 1kg', 'latticini', 7.50, 'kg', 'Caseificio Campano', true, NOW() - INTERVAL '90 days'),
('b0000001-0001-4000-b000-000000000002', 'Burrata Pugliese 200g', 'latticini', 4.20, 'pz', 'Caseificio Ferrante', true, NOW() - INTERVAL '120 days'),
('b0000001-0001-4000-b000-000000000003', 'Ricotta Fresca di Pecora 1.5kg', 'latticini', 6.80, 'kg', 'Latteria Sarda', true, NOW() - INTERVAL '60 days'),
('b0000001-0001-4000-b000-000000000004', 'Provolone Valpadana DOP 5kg', 'latticini', 11.50, 'kg', 'Consorzio Provolone', true, NOW() - INTERVAL '200 days'),
('b0000001-0001-4000-b000-000000000005', 'Scamorza Affumicata 300g', 'latticini', 3.80, 'pz', 'Caseificio Campano', true, NOW() - INTERVAL '150 days'),
('b0000001-0001-4000-b000-000000000006', 'Parmigiano Reggiano DOP 24 mesi 1kg', 'latticini', 18.90, 'kg', 'Consorzio Parmigiano', true, NOW() - INTERVAL '300 days'),
('b0000001-0001-4000-b000-000000000007', 'Stracciatella di Burrata 250g', 'latticini', 5.60, 'pz', 'Caseificio Ferrante', true, NOW() - INTERVAL '45 days'),
('b0000001-0001-4000-b000-000000000008', 'Gorgonzola DOP Dolce 1.5kg', 'latticini', 9.40, 'kg', 'Igor Gorgonzola', true, NOW() - INTERVAL '180 days'),
('b0000001-0001-4000-b000-000000000009', 'Mozzarella di Bufala DOP 250g', 'latticini', 5.90, 'pz', 'Caseificio Vannulo', true, NOW() - INTERVAL '30 days'),
('b0000001-0001-4000-b000-000000000010', 'Pecorino Romano DOP 1kg', 'latticini', 14.50, 'kg', 'Latteria Sarda', true, NOW() - INTERVAL '250 days'),
-- Conserve (6)
('b0000001-0001-4000-b000-000000000011', 'Pomodori San Marzano DOP 2.5kg', 'conserve', 4.50, 'latta', 'La Valle dei Pomodori', true, NOW() - INTERVAL '100 days'),
('b0000001-0001-4000-b000-000000000012', 'Passata di Pomodoro Rustica 680ml', 'conserve', 2.10, 'bottiglia', 'Mutti', true, NOW() - INTERVAL '200 days'),
('b0000001-0001-4000-b000-000000000013', 'Pelati Interi 2.5kg', 'conserve', 3.80, 'latta', 'La Valle dei Pomodori', true, NOW() - INTERVAL '150 days'),
('b0000001-0001-4000-b000-000000000014', 'Olive Taggiasche in Salamoia 1kg', 'conserve', 12.50, 'barattolo', 'Frantoio Ligure', true, NOW() - INTERVAL '90 days'),
('b0000001-0001-4000-b000-000000000015', 'Capperi di Pantelleria 500g', 'conserve', 8.90, 'barattolo', 'Ferrandes', true, NOW() - INTERVAL '120 days'),
('b0000001-0001-4000-b000-000000000016', 'Pomodorini Datterino 400g', 'conserve', 2.80, 'latta', 'Mutti', true, NOW() - INTERVAL '60 days'),
-- Olio (4)
('b0000001-0001-4000-b000-000000000017', 'Olio EVO Puglia 5L', 'olio', 28.00, 'latta', 'Frantoio Ferrante', true, NOW() - INTERVAL '180 days'),
('b0000001-0001-4000-b000-000000000018', 'Olio EVO Sicilia 5L', 'olio', 32.00, 'latta', 'Oleificio Ferrara', true, NOW() - INTERVAL '150 days'),
('b0000001-0001-4000-b000-000000000019', 'Olio EVO Toscana IGP 1L', 'olio', 12.50, 'bottiglia', 'Frantoio Franci', true, NOW() - INTERVAL '200 days'),
('b0000001-0001-4000-b000-000000000020', 'Olio di Semi di Girasole 5L', 'olio', 8.90, 'latta', 'Carapelli', true, NOW() - INTERVAL '100 days'),
-- Farine (5)
('b0000001-0001-4000-b000-000000000021', 'Farina Caputo Blu "00" 25kg', 'farine', 18.50, 'sacco', 'Molino Caputo', true, NOW() - INTERVAL '300 days'),
('b0000001-0001-4000-b000-000000000022', 'Farina Manitoba W400 25kg', 'farine', 22.00, 'sacco', 'Molino Grassi', true, NOW() - INTERVAL '200 days'),
('b0000001-0001-4000-b000-000000000023', 'Farina Integrale Macinata a Pietra 5kg', 'farine', 6.80, 'sacco', 'Mulino Marino', true, NOW() - INTERVAL '120 days'),
('b0000001-0001-4000-b000-000000000024', 'Semola Rimacinata di Grano Duro 25kg', 'farine', 16.00, 'sacco', 'De Cecco', true, NOW() - INTERVAL '180 days'),
('b0000001-0001-4000-b000-000000000025', 'Farina Caputo Rossa "00" Pizza 25kg', 'farine', 20.50, 'sacco', 'Molino Caputo', true, NOW() - INTERVAL '90 days'),
-- Salumi (7)
('b0000001-0001-4000-b000-000000000026', 'Prosciutto Crudo di Parma DOP 18 mesi (intero)', 'salumi', 145.00, 'pz', 'Consorzio Parma', true, NOW() - INTERVAL '60 days'),
('b0000001-0001-4000-b000-000000000027', 'Nduja di Spilinga 500g', 'salumi', 8.50, 'pz', 'Salumificio Madeo', true, NOW() - INTERVAL '90 days'),
('b0000001-0001-4000-b000-000000000028', 'Bresaola della Valtellina IGP 2kg', 'salumi', 38.00, 'kg', 'Rigamonti', true, NOW() - INTERVAL '120 days'),
('b0000001-0001-4000-b000-000000000029', 'Salame Felino IGP intero', 'salumi', 16.50, 'pz', 'Fereoli', true, NOW() - INTERVAL '200 days'),
('b0000001-0001-4000-b000-000000000030', 'Mortadella Bologna IGP 3kg', 'salumi', 21.00, 'pz', 'Fabbri', true, NOW() - INTERVAL '150 days'),
('b0000001-0001-4000-b000-000000000031', 'Pancetta Tesa Stagionata 2kg', 'salumi', 14.00, 'pz', 'Negrini', true, NOW() - INTERVAL '180 days'),
('b0000001-0001-4000-b000-000000000032', 'Guanciale Amatriciano 1.5kg', 'salumi', 12.80, 'pz', 'Negrini', true, NOW() - INTERVAL '100 days'),
-- Pasta (5)
('b0000001-0001-4000-b000-000000000033', 'Pasta di Gragnano Spaghetti 500g', 'pasta', 2.40, 'pz', 'Pastificio Di Martino', true, NOW() - INTERVAL '200 days'),
('b0000001-0001-4000-b000-000000000034', 'Pasta di Gragnano Rigatoni 500g', 'pasta', 2.40, 'pz', 'Pastificio Di Martino', true, NOW() - INTERVAL '200 days'),
('b0000001-0001-4000-b000-000000000035', 'Pasta Fresca Tagliatelle 1kg', 'pasta', 5.50, 'kg', 'Pastificio Jolly', true, NOW() - INTERVAL '30 days'),
('b0000001-0001-4000-b000-000000000036', 'Gnocchi di Patate Freschi 1kg', 'pasta', 4.20, 'kg', 'Pastificio Jolly', true, NOW() - INTERVAL '45 days'),
('b0000001-0001-4000-b000-000000000037', 'Penne Rigate Barilla 3kg', 'pasta', 5.80, 'pz', 'Barilla', true, NOW() - INTERVAL '150 days'),
-- Pesce (4)
('b0000001-0001-4000-b000-000000000038', 'Baccalà Dissalato 1kg', 'pesce', 16.50, 'kg', 'Gadi Fish', true, NOW() - INTERVAL '120 days'),
('b0000001-0001-4000-b000-000000000039', 'Tonno Yellowfin Trancio 1kg', 'pesce', 22.00, 'kg', 'Marr SpA', true, NOW() - INTERVAL '90 days'),
('b0000001-0001-4000-b000-000000000040', 'Gamberi Rossi di Mazara 1kg', 'pesce', 35.00, 'kg', 'Marr SpA', true, NOW() - INTERVAL '60 days'),
('b0000001-0001-4000-b000-000000000041', 'Calamari Puliti Surgelati 1kg', 'pesce', 12.80, 'kg', 'Pescanova', true, NOW() - INTERVAL '180 days'),
-- Bevande (5)
('b0000001-0001-4000-b000-000000000042', 'Acqua Minerale Naturale 6x1.5L', 'bevande', 2.40, 'confezione', 'Sant''Anna', true, NOW() - INTERVAL '300 days'),
('b0000001-0001-4000-b000-000000000043', 'Birra Artigianale IPA 33cl (cassa 24pz)', 'bevande', 36.00, 'cassa', 'Birrificio Baladin', true, NOW() - INTERVAL '120 days'),
('b0000001-0001-4000-b000-000000000044', 'Coca-Cola 33cl Lattina (cassa 24pz)', 'bevande', 14.40, 'cassa', 'Coca-Cola', true, NOW() - INTERVAL '200 days'),
('b0000001-0001-4000-b000-000000000045', 'Vino Barbera d''Asti DOCG 6x75cl', 'bevande', 28.00, 'cartone', 'Braida', true, NOW() - INTERVAL '90 days'),
('b0000001-0001-4000-b000-000000000046', 'Prosecco DOC Extra Dry 6x75cl', 'bevande', 32.00, 'cartone', 'Mionetto', true, NOW() - INTERVAL '60 days'),
-- NOVITÀ (4 prodotti con data_inserimento recente)
('b0000001-0001-4000-b000-000000000047', 'Burrata Affumicata 200g', 'latticini', 5.80, 'pz', 'Caseificio Ferrante', true, NOW() - INTERVAL '3 days'),
('b0000001-0001-4000-b000-000000000048', 'Tartufo Nero Estivo 50g', 'salumi', 28.00, 'pz', 'Tartufi Morra', true, NOW() - INTERVAL '5 days'),
('b0000001-0001-4000-b000-000000000049', 'Olio EVO Monocultivar Coratina 500ml', 'olio', 14.50, 'bottiglia', 'Frantoio Ferrante', true, NOW() - INTERVAL '2 days'),
('b0000001-0001-4000-b000-000000000050', 'Pasta Fresca Ravioli al Plin 500g', 'pasta', 9.80, 'pz', 'Pastificio Jolly', true, NOW() - INTERVAL '4 days');

-- ── NOVITA_PRODOTTI (4) ─────────────────────────────────────────────────
INSERT INTO novita_prodotti (prodotto_id, tipo, data_rilevamento) VALUES
('b0000001-0001-4000-b000-000000000047', 'nuovo', CURRENT_DATE - 3),
('b0000001-0001-4000-b000-000000000048', 'nuovo', CURRENT_DATE - 5),
('b0000001-0001-4000-b000-000000000049', 'nuovo', CURRENT_DATE - 2),
('b0000001-0001-4000-b000-000000000050', 'nuovo', CURRENT_DATE - 4);

-- ── REGOLE_COMMERCIALI (6) ──────────────────────────────────────────────
INSERT INTO regole_commerciali (nome_regola, descrizione, condizione, azione, priorita) VALUES
('sconto_base', 'Sconto standard per dormienti 60-90 giorni', '{"giorni_dormiente": "60-90"}', '{"sconto_max_pct": 10}', 1),
('sconto_aggressivo', 'Sconto maggiorato per dormienti oltre 90 giorni', '{"giorni_dormiente": ">90"}', '{"sconto_max_pct": 20}', 2),
('trasporto_gratis', 'Trasporto gratuito per ordini medi sopra 300 EUR', '{"media_ordine_eur": ">300"}', '{"trasporto_gratuito": true}', 3),
('novita_categoria', 'Suggerisci novità nella categoria abituale', '{"novita_in_categoria_abituale": true}', '{"includi_suggerimento": true}', 4),
('limite_prodotti', 'Max 4 prodotti per offerta', '{"sempre": true}', '{"max_prodotti": 4}', 5),
('validita', 'Ogni offerta è valida 7 giorni', '{"sempre": true}', '{"giorni_validita": 7}', 6);

-- ── CONFIG_SISTEMA (7) ──────────────────────────────────────────────────
INSERT INTO config_sistema (chiave, valore, descrizione) VALUES
('ora_estrazione', '00:30', 'Ora in cui il cron job estrae i dormienti'),
('ora_notifica', '02:00', 'Ora in cui il titolare riceve il riepilogo'),
('timeout_approvazione', '04:00', 'Timeout per auto-approvazione offerte'),
('telefono_titolare', '+39 333 000 0000', 'Numero WhatsApp del titolare'),
('giorni_dormienza_soglia', '60', 'Giorni senza acquisti per considerare dormiente'),
('giorni_rimando_default', '14', 'Giorni di rimando di default'),
('mock_mode', 'true', 'Se true, non invia messaggi reali via WhatsApp');

-- ── OWNER_SESSION (1) ───────────────────────────────────────────────────
INSERT INTO owner_session (stato) VALUES ('idle');

-- ══════════════════════════════════════════════════════════════════════════
-- STORICO_ACQUISTI — ~700 righe con pattern realistici
-- ══════════════════════════════════════════════════════════════════════════
-- Genera storico per ogni cliente con pattern di acquisto realistici.
-- Ogni cliente ha 3-6 prodotti abituali con frequenze variabili.

-- Funzione helper per generare storico (usata in DO block)
DO $$
DECLARE
  v_cliente RECORD;
  v_prodotto_id UUID;
  v_prodotto_ids UUID[];
  v_prezzo NUMERIC;
  v_data DATE;
  v_data_stop DATE;
  v_qty NUMERIC;
  v_freq INTEGER;
  v_num_prodotti INTEGER;
  v_doc_counter INTEGER := 1000;
  v_cliente_idx INTEGER := 0;
  i INTEGER;
BEGIN
  FOR v_cliente IN SELECT id, categoria FROM clienti ORDER BY id LOOP
    v_cliente_idx := v_cliente_idx + 1;

    -- Dormienti (primi 18): storico si ferma 60-180 giorni fa
    -- Attivi (19-30): storico arriva fino a oggi
    IF v_cliente_idx <= 18 THEN
      v_data_stop := CURRENT_DATE - (60 + (v_cliente_idx * 7));
    ELSE
      v_data_stop := CURRENT_DATE;
    END IF;

    -- Numero di prodotti abituali (3-6)
    v_num_prodotti := 3 + (v_doc_counter % 4);

    -- Seleziona prodotti basati sulla categoria del cliente
    CASE v_cliente.categoria
      WHEN 'pizzeria' THEN
        v_prodotto_ids := ARRAY[
          'b0000001-0001-4000-b000-000000000001'::UUID, -- Mozzarella
          'b0000001-0001-4000-b000-000000000021'::UUID, -- Farina Caputo Blu
          'b0000001-0001-4000-b000-000000000025'::UUID, -- Farina Caputo Rossa
          'b0000001-0001-4000-b000-000000000011'::UUID, -- San Marzano
          'b0000001-0001-4000-b000-000000000017'::UUID, -- Olio EVO Puglia
          'b0000001-0001-4000-b000-000000000044'::UUID  -- Coca-Cola
        ];
      WHEN 'ristorante' THEN
        v_prodotto_ids := ARRAY[
          'b0000001-0001-4000-b000-000000000002'::UUID, -- Burrata
          'b0000001-0001-4000-b000-000000000006'::UUID, -- Parmigiano
          'b0000001-0001-4000-b000-000000000019'::UUID, -- Olio Toscana
          'b0000001-0001-4000-b000-000000000033'::UUID, -- Spaghetti Gragnano
          'b0000001-0001-4000-b000-000000000026'::UUID, -- Prosciutto Parma
          'b0000001-0001-4000-b000-000000000045'::UUID  -- Barbera
        ];
      WHEN 'trattoria' THEN
        v_prodotto_ids := ARRAY[
          'b0000001-0001-4000-b000-000000000003'::UUID, -- Ricotta
          'b0000001-0001-4000-b000-000000000012'::UUID, -- Passata
          'b0000001-0001-4000-b000-000000000032'::UUID, -- Guanciale
          'b0000001-0001-4000-b000-000000000034'::UUID, -- Rigatoni
          'b0000001-0001-4000-b000-000000000017'::UUID, -- Olio Puglia
          'b0000001-0001-4000-b000-000000000042'::UUID  -- Acqua
        ];
      WHEN 'rosticceria' THEN
        v_prodotto_ids := ARRAY[
          'b0000001-0001-4000-b000-000000000020'::UUID, -- Olio Girasole
          'b0000001-0001-4000-b000-000000000001'::UUID, -- Mozzarella
          'b0000001-0001-4000-b000-000000000037'::UUID, -- Penne Barilla
          'b0000001-0001-4000-b000-000000000041'::UUID, -- Calamari
          'b0000001-0001-4000-b000-000000000030'::UUID, -- Mortadella
          'b0000001-0001-4000-b000-000000000044'::UUID  -- Coca-Cola
        ];
      WHEN 'bar' THEN
        v_prodotto_ids := ARRAY[
          'b0000001-0001-4000-b000-000000000005'::UUID, -- Scamorza
          'b0000001-0001-4000-b000-000000000030'::UUID, -- Mortadella
          'b0000001-0001-4000-b000-000000000042'::UUID, -- Acqua
          'b0000001-0001-4000-b000-000000000044'::UUID, -- Coca-Cola
          'b0000001-0001-4000-b000-000000000043'::UUID, -- Birra
          'b0000001-0001-4000-b000-000000000046'::UUID  -- Prosecco
        ];
      WHEN 'catering' THEN
        v_prodotto_ids := ARRAY[
          'b0000001-0001-4000-b000-000000000002'::UUID, -- Burrata
          'b0000001-0001-4000-b000-000000000026'::UUID, -- Prosciutto
          'b0000001-0001-4000-b000-000000000028'::UUID, -- Bresaola
          'b0000001-0001-4000-b000-000000000009'::UUID, -- Bufala
          'b0000001-0001-4000-b000-000000000040'::UUID, -- Gamberi
          'b0000001-0001-4000-b000-000000000046'::UUID  -- Prosecco
        ];
      WHEN 'hotel' THEN
        v_prodotto_ids := ARRAY[
          'b0000001-0001-4000-b000-000000000006'::UUID, -- Parmigiano
          'b0000001-0001-4000-b000-000000000035'::UUID, -- Tagliatelle
          'b0000001-0001-4000-b000-000000000019'::UUID, -- Olio Toscana
          'b0000001-0001-4000-b000-000000000039'::UUID, -- Tonno
          'b0000001-0001-4000-b000-000000000045'::UUID, -- Barbera
          'b0000001-0001-4000-b000-000000000042'::UUID  -- Acqua
        ];
      ELSE
        v_prodotto_ids := ARRAY[
          'b0000001-0001-4000-b000-000000000001'::UUID,
          'b0000001-0001-4000-b000-000000000011'::UUID,
          'b0000001-0001-4000-b000-000000000017'::UUID,
          'b0000001-0001-4000-b000-000000000033'::UUID,
          'b0000001-0001-4000-b000-000000000042'::UUID,
          'b0000001-0001-4000-b000-000000000044'::UUID
        ];
    END CASE;

    -- Per ogni prodotto abituale, genera storico
    FOR i IN 1..LEAST(v_num_prodotti, array_length(v_prodotto_ids, 1)) LOOP
      v_prodotto_id := v_prodotto_ids[i];

      -- Frequenza: freschi ogni 5-7 giorni, secchi ogni 14-21 giorni
      SELECT prezzo_listino INTO v_prezzo FROM prodotti WHERE id = v_prodotto_id;
      IF v_prezzo IS NULL THEN v_prezzo := 10.00; END IF;

      IF i <= 2 THEN
        v_freq := 5 + (v_doc_counter % 3); -- 5-7 giorni (freschi)
      ELSIF i <= 4 THEN
        v_freq := 10 + (v_doc_counter % 5); -- 10-14 giorni
      ELSE
        v_freq := 21 + (v_doc_counter % 10); -- 21-30 giorni
      END IF;

      -- Genera righe da 12 mesi fa fino a data_stop
      v_data := CURRENT_DATE - 365;
      WHILE v_data <= v_data_stop LOOP
        -- Quantità con variazione ±20%
        v_qty := ROUND(((1 + (v_doc_counter % 5)) * (0.8 + (random() * 0.4)))::numeric, 1);

        INSERT INTO storico_acquisti (cliente_id, prodotto_id, data_acquisto, quantita, prezzo_unitario, importo_totale, numero_documento)
        VALUES (
          v_cliente.id,
          v_prodotto_id,
          v_data,
          v_qty,
          v_prezzo,
          ROUND(v_qty * v_prezzo, 2),
          'DOC-' || LPAD(v_doc_counter::text, 6, '0')
        );

        v_doc_counter := v_doc_counter + 1;
        v_data := v_data + v_freq;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
