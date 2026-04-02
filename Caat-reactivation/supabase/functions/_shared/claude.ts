export interface OfferJSON {
  prodotti_suggeriti: Array<{
    nome: string;
    prezzo_listino: number;
    prezzo_scontato: number;
    sconto_pct: number;
    motivo: string;
  }>;
  novita_suggerite?: Array<{
    nome: string;
    prezzo_listino: number;
    motivo: string;
  }>;
  trasporto_gratuito: boolean;
  validita_giorni: number;
  messaggio_cliente: string;
  reasoning: string;
}

import { supabase } from "./supabase.ts";

export async function generateOffer(
  systemPrompt: string,
  userPrompt: string
): Promise<OfferJSON> {
  // Use real Claude API if key is available, otherwise fall back to mock
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");

  if (!apiKey) {
    console.log("[CLAUDE] No API key — using mock");
    return generateMockOffer(userPrompt);
  }

  console.log("[CLAUDE] Using REAL Claude API");

  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Claude API ${response.status}: ${errorBody}`);
      }

      const data = await response.json();
      const text = data.content[0].text;

      // Parse JSON — Claude might wrap it in ```json blocks
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in Claude response");
      }

      return JSON.parse(jsonMatch[0]) as OfferJSON;
    } catch (err) {
      lastError = err as Error;
      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  throw lastError!;
}

function generateMockOffer(userPrompt: string): OfferJSON {
  // Extract client name and dormancy from the prompt
  const nomeMatch = userPrompt.match(/Nome: (.+)/);
  const giorniMatch = userPrompt.match(/Giorni senza acquisti: (\d+)/);
  const nome = nomeMatch?.[1] || "Cliente";
  const giorni = parseInt(giorniMatch?.[1] || "60");
  const scontoPct = giorni > 90 ? 15 : 8;

  // Extract products from the prompt
  const prodottiLines = userPrompt.match(/- (.+?) \((.+?)\): \d+ acquisti.+?listino €([\d.]+)/g) || [];
  const prodotti = prodottiLines.slice(0, 3).map((line) => {
    const m = line.match(/- (.+?) \(.+?\): \d+ acquisti.+?listino €([\d.]+)/);
    const nomeProd = m?.[1] || "Prodotto";
    const prezzo = parseFloat(m?.[2] || "10");
    return {
      nome: nomeProd,
      prezzo_listino: prezzo,
      prezzo_scontato: Math.round(prezzo * (1 - scontoPct / 100) * 100) / 100,
      sconto_pct: scontoPct,
      motivo: `Prodotto abituale — sconto riattivazione ${giorni}gg`,
    };
  });

  if (prodotti.length === 0) {
    prodotti.push({
      nome: "Mozzarella Fior di Latte 1kg",
      prezzo_listino: 7.50,
      prezzo_scontato: Math.round(7.50 * (1 - scontoPct / 100) * 100) / 100,
      sconto_pct: scontoPct,
      motivo: "Prodotto popolare — offerta di riattivazione",
    });
  }

  // Check for novelties in prompt
  const hasNovita = userPrompt.includes("NOVITÀ") && !userPrompt.includes("Nessuna novità");
  const novitaMatch = userPrompt.match(/- (.+?) \(.+?\): €([\d.]+) — nuovo/);
  const novita = hasNovita && novitaMatch
    ? [{
        nome: novitaMatch[1],
        prezzo_listino: parseFloat(novitaMatch[2]),
        motivo: "Novità della settimana nella tua categoria",
      }]
    : [];

  const prodottiNomi = prodotti.map((p) => p.nome).join(", ");

  console.log(`[MOCK CLAUDE] Generated offer for ${nome}: ${prodotti.length} products, ${scontoPct}% discount`);

  return {
    prodotti_suggeriti: prodotti,
    novita_suggerite: novita,
    trasporto_gratuito: giorni > 90,
    validita_giorni: 7,
    messaggio_cliente: `Ciao ${nome}! 👋 È da un po' che non ci vediamo. Abbiamo riservato per te ${prodottiNomi} con uno sconto speciale del ${scontoPct}%. ${novita.length > 0 ? "Prova anche le nostre novità! " : ""}Offerta valida 7 giorni. Ti aspettiamo!`,
    reasoning: `[MOCK] Cliente dormiente da ${giorni} giorni. Applicato sconto ${scontoPct}% sui ${prodotti.length} prodotti più acquistati. ${novita.length > 0 ? "Aggiunta novità nella categoria abituale." : "Nessuna novità rilevante."} ${giorni > 90 ? "Trasporto gratuito per incentivare il rientro." : ""}`,
  };
}
