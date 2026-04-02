import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";
import { generateOffer, OfferJSON } from "../_shared/claude.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("=== EXTRACT-DORMANT START ===");

    // 1. Get dormancy threshold from config
    const { data: thresholdConfig } = await supabase
      .from("config_sistema")
      .select("valore")
      .eq("chiave", "giorni_dormienza_soglia")
      .single();
    const soglia = parseInt(thresholdConfig?.valore || "60");

    // 2. Query dormant clients
    const { data: dormantClients, error: dormantError } = await supabase.rpc(
      "get_dormant_clients",
      { soglia_giorni: soglia }
    );

    // Fallback: direct query if RPC doesn't exist
    let clients = dormantClients;
    if (dormantError) {
      console.log("RPC not available, using direct query");
      const { data, error } = await supabase
        .from("clienti")
        .select("id, nome, categoria, telefono");
      if (error) throw error;

      // Filter dormant clients manually
      const clientsWithHistory = [];
      for (const c of data || []) {
        // Check blacklist
        const { data: bl } = await supabase
          .from("blacklist")
          .select("id")
          .eq("cliente_id", c.id)
          .maybeSingle();
        if (bl) continue;

        // Skip if already has a pending offer today (sent offers from past days are OK to re-target)
        const { data: recentOffer } = await supabase
          .from("offerte_giornaliere")
          .select("id")
          .eq("cliente_id", c.id)
          .eq("stato", "pending")
          .eq("data_generazione", new Date().toISOString().split("T")[0])
          .maybeSingle();
        if (recentOffer) continue;

        // Check consent
        if (!c.telefono) continue;

        // Get last purchase date
        const { data: lastPurchase } = await supabase
          .from("storico_acquisti")
          .select("data_acquisto")
          .eq("cliente_id", c.id)
          .order("data_acquisto", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!lastPurchase) continue;

        const lastDate = new Date(lastPurchase.data_acquisto);
        const today = new Date();
        const giorniDormiente = Math.floor(
          (today.getTime() - lastDate.getTime()) / 86400000
        );

        if (giorniDormiente <= soglia) continue;

        // Get average order total (by documento)
        const { data: orderAvg } = await supabase
          .from("storico_acquisti")
          .select("importo_totale")
          .eq("cliente_id", c.id);
        const mediaOrdine = orderAvg
          ? Math.round(
              (orderAvg.reduce((s, r) => s + Number(r.importo_totale), 0) /
                orderAvg.length) *
                100
            ) / 100
          : 0;

        clientsWithHistory.push({
          ...c,
          ultimo_acquisto: lastPurchase.data_acquisto,
          giorni_dormiente: giorniDormiente,
          media_ordine: mediaOrdine,
        });
      }

      clients = clientsWithHistory.sort(
        (a: any, b: any) => b.giorni_dormiente - a.giorni_dormiente
      );
    }

    if (!clients || clients.length === 0) {
      console.log("No dormant clients found");
      return new Response(JSON.stringify({ processed: 0, offers: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${clients.length} dormant clients`);

    // 3. Get weekly novelties
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000)
      .toISOString()
      .split("T")[0];
    const { data: novelties } = await supabase
      .from("novita_prodotti")
      .select("prodotto_id, tipo, prodotti(id, nome, categoria, prezzo_listino, unita_misura)")
      .gt("data_rilevamento", sevenDaysAgo)
      .eq("gia_proposto", false);

    const novitaList = (novelties || []).map((n: any) => ({
      id: n.prodotti.id,
      nome: n.prodotti.nome,
      categoria: n.prodotti.categoria,
      prezzo_listino: n.prodotti.prezzo_listino,
      unita_misura: n.prodotti.unita_misura,
      tipo: n.tipo,
    }));

    console.log(`Found ${novitaList.length} novelties this week`);

    // 4. Get commercial rules
    const { data: rules } = await supabase
      .from("regole_commerciali")
      .select("nome_regola, descrizione, condizione, azione")
      .eq("attiva", true)
      .order("priorita");

    // 5. Build system prompt
    const systemPrompt = `Sei un assistente commerciale per un'azienda alimentare all'ingrosso al CAAT di Torino.
Devi generare offerte personalizzate per riattivare clienti dormienti.

REGOLE COMMERCIALI DA RISPETTARE:
${(rules || []).map((r: any) => `- ${r.nome_regola}: ${r.descrizione}. Condizione: ${JSON.stringify(r.condizione)}. Azione: ${JSON.stringify(r.azione)}`).join("\n")}

FORMATO OUTPUT (JSON stretto, senza commenti):
{
  "prodotti_suggeriti": [
    {"nome": "...", "prezzo_listino": 0.00, "prezzo_scontato": 0.00, "sconto_pct": 0, "motivo": "..."}
  ],
  "novita_suggerite": [
    {"nome": "...", "prezzo_listino": 0.00, "motivo": "..."}
  ],
  "trasporto_gratuito": false,
  "validita_giorni": 7,
  "messaggio_cliente": "Messaggio WhatsApp cordiale e personalizzato per il cliente, massimo 300 caratteri. Usa il nome del locale. Menziona i prodotti in offerta. Tono amichevole ma professionale.",
  "reasoning": "Spiegazione breve del perché hai scelto questi prodotti e sconti."
}

IMPORTANTE:
- Max 4 prodotti suggeriti
- Sconti basati sui giorni di dormienza (60-90gg: max 10%, >90gg: max 20%)
- Se ci sono novità nella categoria abituale del cliente, suggeriscile
- Se la media ordine > 300€, offri trasporto gratuito
- Il messaggio al cliente deve essere in italiano, cordiale, e menzionare i prodotti specifici
- Rispondi SOLO con il JSON, nient'altro`;

    // 6. Skip clients that already have an offer today (allows re-calling to process remaining)
    const today = new Date().toISOString().split("T")[0];
    const { data: existingOffers } = await supabase
      .from("offerte_giornaliere")
      .select("cliente_id")
      .eq("data_generazione", today);
    const alreadyProcessed = new Set((existingOffers || []).map((o: any) => o.cliente_id));
    const toProcess = clients.filter((c: any) => !alreadyProcessed.has(c.id));

    console.log(`${clients.length} dormant total, ${alreadyProcessed.size} already processed, ${toProcess.length} remaining`);

    if (toProcess.length === 0) {
      return new Response(JSON.stringify({
        processed: 0, offers: 0, errors: 0, already_done: alreadyProcessed.size,
        timestamp: new Date().toISOString(),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 7. Prepare all user prompts first (fast DB queries)
    const clientPrompts: Array<{ client: any; userPrompt: string }> = [];
    for (const client of toProcess) {
      const { data: topProducts } = await supabase
        .from("storico_acquisti")
        .select("prodotto_id, prodotti(id, nome, categoria, prezzo_listino), quantita, prezzo_unitario, data_acquisto")
        .eq("cliente_id", client.id)
        .gte("data_acquisto", new Date(Date.now() - 365 * 86400000).toISOString().split("T")[0])
        .order("data_acquisto", { ascending: false });

      const productCounts: Record<string, any> = {};
      for (const row of topProducts || []) {
        const pid = row.prodotto_id;
        if (!productCounts[pid]) {
          productCounts[pid] = {
            id: (row as any).prodotti?.id, nome: (row as any).prodotti?.nome,
            categoria: (row as any).prodotti?.categoria, prezzo_listino: (row as any).prodotti?.prezzo_listino,
            n_acquisti: 0, totale_prezzo: 0,
          };
        }
        productCounts[pid].n_acquisti++;
        productCounts[pid].totale_prezzo += Number(row.prezzo_unitario);
      }

      const topProductsList = Object.values(productCounts)
        .filter((p: any) => p.nome)
        .map((p: any) => ({ ...p, prezzo_medio: Math.round((p.totale_prezzo / p.n_acquisti) * 100) / 100 }))
        .sort((a: any, b: any) => b.n_acquisti - a.n_acquisti)
        .slice(0, 5);

      const clientCategories = new Set(topProductsList.map((p: any) => p.categoria));
      const relevantNovelties = novitaList.filter((n: any) => clientCategories.has(n.categoria));

      const userPrompt = `CLIENTE DA RIATTIVARE:
- Nome: ${client.nome}
- Categoria attività: ${client.categoria}
- Giorni senza acquisti: ${client.giorni_dormiente}
- Media importo ordini: €${client.media_ordine}

PRODOTTI ABITUALI (top 5):
${topProductsList.map((p: any) => `- ${p.nome} (${p.categoria}): ${p.n_acquisti} acquisti, prezzo medio €${p.prezzo_medio}, listino €${p.prezzo_listino}`).join("\n")}

NOVITÀ DELLA SETTIMANA:
${relevantNovelties.length > 0 ? relevantNovelties.map((n: any) => `- ${n.nome} (${n.categoria}): €${n.prezzo_listino} — ${n.tipo}`).join("\n") : "Nessuna novità rilevante"}

Genera l'offerta personalizzata in formato JSON.`;

      clientPrompts.push({ client, userPrompt });
    }

    // 8. Process in parallel batches of 5
    const BATCH_SIZE = 5;
    let offersGenerated = 0;
    let errors = 0;

    for (let i = 0; i < clientPrompts.length; i += BATCH_SIZE) {
      const batch = clientPrompts.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.map(b => b.client.nome).join(", ")}`);

      const results = await Promise.allSettled(
        batch.map(async ({ client, userPrompt }) => {
          console.log(`  → ${client.nome} (${client.giorni_dormiente}gg)`);
          const offer: OfferJSON = await generateOffer(systemPrompt, userPrompt);

          const { error: insertError } = await supabase
            .from("offerte_giornaliere")
            .insert({
              cliente_id: client.id,
              data_generazione: today,
              giorni_dormiente: client.giorni_dormiente,
              offerta_claude: offer,
              messaggio_cliente: offer.messaggio_cliente,
              stato: "pending",
            });

          if (insertError) throw insertError;
          return { nome: client.nome, prodotti: offer.prodotti_suggeriti.length };
        })
      );

      for (const r of results) {
        if (r.status === "fulfilled") {
          offersGenerated++;
          console.log(`  ✓ ${r.value.nome}: ${r.value.prodotti} prodotti`);
        } else {
          errors++;
          console.error(`  ✗ Error:`, r.reason);
        }
      }
    }

    const result = {
      processed: toProcess.length,
      offers: offersGenerated,
      errors,
      already_done: alreadyProcessed.size,
      timestamp: new Date().toISOString(),
    };

    console.log("=== EXTRACT-DORMANT COMPLETE ===", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("EXTRACT-DORMANT FATAL ERROR:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
