import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

interface AiReply {
  message: string;
  escalate: boolean;
  escalationReason?: string;
  order_confirmed?: boolean;
  order_summary?: {
    items: Array<{ nome: string; quantita: number; prezzo_unitario: number; nota?: string }>;
    trasporto_gratuito: boolean;
    totale: number;
  };
}

serve(async (req) => {
  try {
    const { client, offer, history, message } = await req.json();
    console.log(`[AI-REPLY] Generating reply for ${client.nome}: "${message}"`);

    const { data: config } = await supabase
      .from("config_sistema").select("valore").eq("chiave", "mock_mode").single();

    const reply = generateMockReply(client, offer, history || [], message);
    return new Response(JSON.stringify(reply), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[AI-REPLY] Error:", err);
    return new Response(
      JSON.stringify({
        message: "Grazie per il messaggio! Ti ricontatteremo al più presto.",
        escalate: true,
        escalationReason: `Errore: ${(err as Error).message}`,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
});

// Check if the message is an order confirmation
function isOrderConfirmation(message: string, history: any[]): boolean {
  const lower = message.toLowerCase().trim();
  const confirmPhrases = [
    /^(s[iì]|ok|va bene|conferm[oa]|procediamo|proceed[io]|facci?amo|ordino|prendo tutto|ci sto|perfetto|d'accordo|daccordo)$/,
    /conferm[oa]\s*(l')?ordine/,
    /procediamo\s*(con)?\s*(l')?ordine/,
    /va bene.*ordin/,
    /s[iì].*conferm/,
    /s[iì].*procedi/,
    /ok.*procedi/,
    /^s[iì]$/,
  ];

  // Only trigger if there was a previous message asking for confirmation
  // (i.e. the system asked "Vuoi confermare l'ordine?")
  const lastSystemMsg = history.find((h: any) => h.direzione === "out");
  const systemAskedConfirm = lastSystemMsg?.contenuto?.includes("confermare l'ordine") ||
    lastSystemMsg?.contenuto?.includes("Vuoi confermare") ||
    lastSystemMsg?.contenuto?.includes("Posso procedere");

  if (!systemAskedConfirm) return false;

  return confirmPhrases.some((re) => re.test(lower));
}

function generateMockReply(
  client: any,
  offer: any,
  history: any[],
  message: string
): AiReply {
  const lower = message.toLowerCase();
  const nome = client.nome;

  // ORDER CONFIRMATION — check this first
  if (offer && isOrderConfirmation(message, history)) {
    const prodotti = offer.prodotti_suggeriti || [];
    const novita = offer.novita_suggerite || [];

    // Build order items from offer with default quantities
    const items = prodotti.map((p: any) => ({
      nome: p.nome,
      quantita: guessQuantity(p.nome),
      prezzo_unitario: p.prezzo_scontato,
    }));

    // Add novelties if present
    for (const n of novita) {
      items.push({
        nome: n.nome,
        quantita: guessQuantity(n.nome),
        prezzo_unitario: n.prezzo_listino,
        nota: "novità",
      });
    }

    const totale = Math.round(items.reduce((s: number, i: any) => s + i.quantita * i.prezzo_unitario, 0) * 100) / 100;

    return {
      message: `✅ Ordine ricevuto! Il tuo ordine è stato inoltrato. Ti confermeremo la consegna a breve.`,
      escalate: false,
      order_confirmed: true,
      order_summary: {
        items,
        trasporto_gratuito: offer.trasporto_gratuito || false,
        totale,
      },
    };
  }

  // INTERESTED — ask for confirmation
  if (
    lower.includes("interess") ||
    lower.includes("vorrei") ||
    lower.includes("ordino") ||
    lower.includes("prendo")
  ) {
    const prodottiList = offer?.prodotti_suggeriti
      ?.map((p: any) => `• ${p.nome} a €${p.prezzo_scontato}`)
      .join("\n") || "i prodotti in offerta";
    const novitaList = offer?.novita_suggerite
      ?.map((n: any) => `• ${n.nome} a €${n.prezzo_listino} (novità!)`)
      .join("\n") || "";

    return {
      message: `Ottimo ${nome}! 🎉 Ecco il riepilogo:\n\n${prodottiList}${novitaList ? "\n\n🆕 Novità:\n" + novitaList : ""}\n\n${offer?.trasporto_gratuito ? "🚚 Trasporto gratuito!\n\n" : ""}Vuoi confermare l'ordine? Posso procedere subito!`,
      escalate: false,
    };
  }

  // PRICE QUESTIONS
  if (lower.includes("prezzo") || lower.includes("quanto") || lower.includes("costa") || lower.includes("sconto")) {
    return {
      message: `Certo ${nome}! I prezzi scontati nell'offerta sono validi per 7 giorni. Se hai bisogno di info su altri prodotti, chiedi pure — altrimenti ti passo il titolare per un preventivo personalizzato.`,
      escalate: false,
    };
  }

  // COMPLAINT
  if (lower.includes("problema") || lower.includes("reclamo") || lower.includes("lament") || lower.includes("male") || lower.includes("deluso")) {
    return {
      message: `Mi dispiace ${nome}, capisco la tua preoccupazione. Ti metto subito in contatto con il titolare per risolvere la situazione.`,
      escalate: true,
      escalationReason: "Il cliente ha espresso un reclamo o insoddisfazione",
    };
  }

  // NOT INTERESTED
  if (lower.includes("no grazie") || lower.includes("non mi interessa") || lower.includes("non ora")) {
    return {
      message: `Capito ${nome}, nessun problema! L'offerta resta valida 7 giorni, se cambi idea siamo qui. A presto! 👋`,
      escalate: false,
    };
  }

  // GENERIC
  return {
    message: `Grazie per il messaggio ${nome}! Ho preso nota. Se hai domande sull'offerta o vuoi ordinare, scrivimi pure.`,
    escalate: lower.length > 50,
    escalationReason: lower.length > 50 ? "Messaggio complesso che potrebbe richiedere intervento diretto" : undefined,
  };
}

// Guess reasonable default quantities based on product name
function guessQuantity(nome: string): number {
  const n = nome.toLowerCase();
  if (n.includes("200g") || n.includes("250g") || n.includes("300g")) return 6;
  if (n.includes("500g") || n.includes("500ml")) return 4;
  if (n.includes("1kg") || n.includes("1.5kg") || n.includes("1l")) return 2;
  if (n.includes("5l") || n.includes("5kg") || n.includes("25kg")) return 1;
  if (n.includes("cassa") || n.includes("cartone")) return 1;
  return 2;
}
