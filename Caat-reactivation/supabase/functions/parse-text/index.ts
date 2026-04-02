import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { supabase } from "../_shared/supabase.ts";

const SYSTEM_PROMPTS = {
  cliente:
    "Sei un parser di dati. L'utente ti dà una descrizione testuale di un cliente commerciale (ristorante, bar, pizzeria, ecc). Estrai i campi in formato JSON. Rispondi SOLO con il JSON, senza altro testo.\n\nCampi richiesti: nome, telefono, email, indirizzo, categoria, note_titolare.\n- categoria deve essere uno tra: ristorante, pizzeria, bar, trattoria, hotel, catering, rosticceria, gastronomia, altro\n- telefono: normalizza in formato +39XXXXXXXXXX se è un numero italiano",
  novita:
    "Sei un parser di dati. L'utente descrive uno o più prodotti nuovi o tornati disponibili per un'azienda alimentare all'ingrosso. Estrai i dati in formato JSON array. Per ogni prodotto estrai: nome, prezzo_listino (numerico), unita_misura (kg/pz/lt/cartone), tipo (nuovo o tornato_disponibile). Rispondi SOLO con il JSON array.",
};

async function callClaude(
  systemPrompt: string,
  text: string
): Promise<unknown> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: text }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Claude API ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const rawText = data.content[0].text;

  // Parse JSON — Claude might wrap it in ```json blocks
  const jsonMatch = rawText.match(/[\[{][\s\S]*[\]}]/);
  if (!jsonMatch) {
    throw new Error("No JSON found in Claude response");
  }

  return JSON.parse(jsonMatch[0]);
}

interface ClienteData {
  nome: string;
  telefono: string;
  email?: string;
  indirizzo?: string;
  categoria?: string;
  note_titolare?: string;
}

interface NovitaItem {
  nome: string;
  prezzo_listino: number;
  unita_misura?: string;
  tipo: "nuovo" | "tornato_disponibile";
}

async function saveCliente(data: ClienteData): Promise<number> {
  const { error } = await supabase.from("clienti").insert({
    nome: data.nome,
    telefono: data.telefono,
    email: data.email || null,
    indirizzo: data.indirizzo || null,
    categoria: data.categoria || null,
    note_titolare: data.note_titolare || null,
    consenso_whatsapp: false,
  });

  if (error) throw new Error(`DB insert clienti: ${error.message}`);
  return 1;
}

async function saveNovita(items: NovitaItem[]): Promise<number> {
  let saved = 0;

  for (const item of items) {
    // Try to find existing product by name
    const { data: existing } = await supabase
      .from("prodotti")
      .select("id")
      .ilike("nome", item.nome)
      .maybeSingle();

    let prodottoId: string;

    if (existing) {
      // Update existing product
      prodottoId = existing.id;
      await supabase
        .from("prodotti")
        .update({
          prezzo_listino: item.prezzo_listino,
          unita_misura: item.unita_misura || null,
          disponibile: true,
        })
        .eq("id", prodottoId);
    } else {
      // Insert new product
      const { data: newProd, error } = await supabase
        .from("prodotti")
        .insert({
          nome: item.nome,
          prezzo_listino: item.prezzo_listino,
          unita_misura: item.unita_misura || null,
          disponibile: true,
        })
        .select("id")
        .single();

      if (error) throw new Error(`DB insert prodotti: ${error.message}`);
      prodottoId = newProd.id;
    }

    // Insert into novita_prodotti
    const { error: novitaError } = await supabase
      .from("novita_prodotti")
      .insert({
        prodotto_id: prodottoId,
        tipo: item.tipo,
      });

    if (novitaError)
      throw new Error(`DB insert novita_prodotti: ${novitaError.message}`);

    saved++;
  }

  return saved;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { type, text, action, data } = await req.json();

    if (!type || !["cliente", "novita"].includes(type)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid type. Must be 'cliente' or 'novita'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── ACTION: PARSE ──────────────────────────────────────────────────
    if (action === "parse") {
      if (!text) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing 'text' field" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const systemPrompt = SYSTEM_PROMPTS[type as keyof typeof SYSTEM_PROMPTS];
      const parsed = await callClaude(systemPrompt, text);

      return new Response(
        JSON.stringify({ success: true, data: parsed }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── ACTION: SAVE ───────────────────────────────────────────────────
    if (action === "save") {
      if (!data) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing 'data' field" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      let saved: number;

      if (type === "cliente") {
        saved = await saveCliente(data as ClienteData);
      } else {
        saved = await saveNovita(data as NovitaItem[]);
      }

      return new Response(
        JSON.stringify({ success: true, saved }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Invalid action. Must be 'parse' or 'save'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[parse-text] Error:", err);
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
