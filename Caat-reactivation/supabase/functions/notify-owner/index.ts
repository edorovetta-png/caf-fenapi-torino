import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";
import { sendWhatsAppMessage } from "../_shared/whatsapp.ts";

// Build card message for a single offer
function buildCard(offer: any, index: number, total: number): string {
  const claude = offer.offerta_claude;
  const client = (offer as any).clienti;
  const prodotti = (claude.prodotti_suggeriti || [])
    .map((p: any) => `${p.nome} -${p.sconto_pct}%`)
    .join(", ");
  const novita = (claude.novita_suggerite || []);
  const novitaLine = novita.length > 0
    ? "\n🆕 " + novita.map((n: any) => n.nome).join(", ")
    : "";
  const trasporto = claude.trasporto_gratuito ? "\n🚚 Trasporto gratuito" : "";

  return `[${index + 1}/${total}] — ${client.nome} (${offer.giorni_dormiente}gg dormiente)
${prodotti}${novitaLine}${trasporto}
Vuoi inviarlo, modificarlo, posticiparlo o cancellarlo definitivamente?`;
}

export { buildCard };

serve(async (_req) => {
  try {
    console.log("=== NOTIFY-OWNER START ===");

    const today = new Date().toISOString().split("T")[0];
    const { data: pendingOffers, error } = await supabase
      .from("offerte_giornaliere")
      .select("id, giorni_dormiente, offerta_claude, messaggio_cliente, clienti(id, nome, categoria)")
      .eq("data_generazione", today)
      .eq("stato", "pending")
      .order("giorni_dormiente", { ascending: false });

    if (error) throw error;

    if (!pendingOffers || pendingOffers.length === 0) {
      console.log("No pending offers for today");
      return new Response(JSON.stringify({ message: "No offers to review" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const total = pendingOffers.length;
    const offerIds = pendingOffers.map((o: any) => o.id);
    console.log(`Found ${total} pending offers, starting card-by-card review`);

    // Save ordered list + set index to 0 in owner_session
    await supabase
      .from("owner_session")
      .update({
        stato: "reviewing",
        data_sessione: today,
        indice_corrente: 0,
        offerte_ids: offerIds,
        offerta_in_modifica: null,
      })
      .not("id", "is", null);

    // Get owner phone
    const { data: ownerConfig } = await supabase
      .from("config_sistema")
      .select("valore")
      .eq("chiave", "telefono_titolare")
      .single();
    const ownerPhone = ownerConfig?.valore || "+39 333 000 0000";

    // Send intro via template (opens 24h window when owner replies)
    const introMsg = `Oggi ci sono ${total} clienti da riattivare. Rispondi OK per vedere le schede.`;
    await sendWhatsAppMessage(
      ownerPhone,
      introMsg,
      "titolare",
      undefined,
      undefined,
      "notifica_titolare",
      [introMsg]
    );

    // First card will be sent when owner replies (via owner-interaction, within 24h window)
    const firstCard = buildCard(pendingOffers[0], 0, total);

    console.log("=== NOTIFY-OWNER COMPLETE — sent first card ===");

    return new Response(
      JSON.stringify({ offers_count: total, first_card_sent: true }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("NOTIFY-OWNER FATAL ERROR:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
