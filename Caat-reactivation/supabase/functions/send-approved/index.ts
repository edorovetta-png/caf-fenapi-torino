import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";
import { sendWhatsAppMessage } from "../_shared/whatsapp.ts";

serve(async (_req) => {
  try {
    console.log("=== SEND-APPROVED START ===");

    const today = new Date().toISOString().split("T")[0];

    // 1. Get approved/modified offers for today
    const { data: approvedOffers, error } = await supabase
      .from("offerte_giornaliere")
      .select("id, offerta_claude, offerta_finale, messaggio_cliente, clienti(id, nome, telefono)")
      .eq("data_generazione", today)
      .in("stato", ["approved", "modified"]);

    if (error) throw error;

    if (!approvedOffers || approvedOffers.length === 0) {
      console.log("No approved offers to send");
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${approvedOffers.length} approved offers to send`);

    // 2. Send all messages in parallel
    const results = await Promise.all(
      approvedOffers.map(async (offer: any) => {
        // Use modified message if available, otherwise original
        const messaggio = offer.offerta_finale
          ? offer.offerta_finale.messaggio_cliente || offer.messaggio_cliente
          : offer.messaggio_cliente;

        const clienteId = (offer as any).clienti.id;
        const telefono = (offer as any).clienti.telefono;
        const nome = (offer as any).clienti.nome;

        try {
          const result = await sendWhatsAppMessage(
            telefono,
            messaggio,
            "cliente",
            clienteId,
            offer.id,
            "riattivazione_cliente",
            [nome, messaggio]
          );

          // Update offer status to 'sent'
          if (result.success) {
            await supabase
              .from("offerte_giornaliere")
              .update({ stato: "sent" })
              .eq("id", offer.id);
          }

          return { nome, success: result.success };
        } catch (err) {
          console.error(`Error sending to ${nome}:`, err);
          return { nome, success: false };
        }
      })
    );

    const sent = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    // 3. Count postponed and excluded
    const { count: postponed } = await supabase
      .from("offerte_giornaliere")
      .select("id", { count: "exact", head: true })
      .eq("data_generazione", today)
      .eq("stato", "postponed");

    const { count: excluded } = await supabase
      .from("offerte_giornaliere")
      .select("id", { count: "exact", head: true })
      .eq("data_generazione", today)
      .eq("stato", "excluded");

    // Note: summary message is sent by owner-interaction/advanceToNext, not here
    // to avoid duplicate messages to the owner

    const result = { sent, failed, postponed: postponed || 0, excluded: excluded || 0 };
    console.log("=== SEND-APPROVED COMPLETE ===", result);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("SEND-APPROVED FATAL ERROR:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
