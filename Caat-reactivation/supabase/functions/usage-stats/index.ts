import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfWeek = new Date(now.getTime() - 7 * 86400000).toISOString();

    // 1. WhatsApp messages this month (outbound = cost)
    const { count: waOutMonth } = await supabase
      .from("conversazioni")
      .select("id", { count: "exact", head: true })
      .eq("direzione", "out")
      .gte("created_at", startOfMonth);

    // 2. WhatsApp messages this month (inbound = free)
    const { count: waInMonth } = await supabase
      .from("conversazioni")
      .select("id", { count: "exact", head: true })
      .eq("direzione", "in")
      .gte("created_at", startOfMonth);

    // 3. Offers generated this month (= Claude API calls for generation)
    const { count: offersMonth } = await supabase
      .from("offerte_giornaliere")
      .select("id", { count: "exact", head: true })
      .gte("data_generazione", startOfMonth.split("T")[0]);

    // 4. AI replies this month (= Claude API calls for replies)
    const { count: aiRepliesMonth } = await supabase
      .from("conversazioni")
      .select("id", { count: "exact", head: true })
      .eq("direzione", "out")
      .eq("interlocutore", "cliente")
      .gte("created_at", startOfMonth);

    // 5. Total clients and products
    const { count: totalClienti } = await supabase
      .from("clienti")
      .select("id", { count: "exact", head: true });

    const { count: totalProdotti } = await supabase
      .from("prodotti")
      .select("id", { count: "exact", head: true });

    const { count: totalStorico } = await supabase
      .from("storico_acquisti")
      .select("id", { count: "exact", head: true });

    // 6. Supabase DB size estimate (rows-based)
    const dbRows = (totalClienti || 0) + (totalProdotti || 0) + (totalStorico || 0);

    // Cost estimates
    const waTemplateMessages = offersMonth || 0; // template messages (first contact)
    const waFreeMessages = (waOutMonth || 0) - waTemplateMessages; // within 24h window
    const waTemplateCost = waTemplateMessages * 0.04; // ~€0.04 per template marketing (IT)
    const claudeOfferCost = (offersMonth || 0) * 0.004; // ~1500 tokens × $3/MTok (Sonnet)
    const claudeReplyCost = (aiRepliesMonth || 0) * 0.002; // ~800 tokens
    const totalCost = waTemplateCost + claudeOfferCost + claudeReplyCost;

    const result = {
      periodo: {
        mese: now.toLocaleString("it-IT", { month: "long", year: "numeric" }),
        da: startOfMonth.split("T")[0],
        a: now.toISOString().split("T")[0],
      },
      whatsapp: {
        messaggi_inviati: waOutMonth || 0,
        messaggi_ricevuti: waInMonth || 0,
        template_messages: waTemplateMessages,
        free_messages: Math.max(0, waFreeMessages),
        costo_stimato_eur: Math.round(waTemplateCost * 100) / 100,
      },
      claude_api: {
        offerte_generate: offersMonth || 0,
        risposte_ai: aiRepliesMonth || 0,
        costo_stimato_eur: Math.round((claudeOfferCost + claudeReplyCost) * 100) / 100,
      },
      database: {
        clienti: totalClienti || 0,
        prodotti: totalProdotti || 0,
        storico_acquisti: totalStorico || 0,
        righe_totali: dbRows,
        piano: dbRows < 50000 ? "Free (ampio margine)" : "Potrebbe servire Pro",
      },
      hosting: {
        supabase: "Free",
        vercel: "Free",
        costo_eur: 0,
      },
      totale_mese_eur: Math.round(totalCost * 100) / 100,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
