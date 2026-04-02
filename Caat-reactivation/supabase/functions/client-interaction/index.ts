import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";
import { sendWhatsAppMessage } from "../_shared/whatsapp.ts";
import { transcribeAudio } from "../_shared/whisper.ts";

async function downloadWhatsAppAudio(audioUrl: string): Promise<ArrayBuffer> {
  if (!audioUrl.startsWith("wa-audio://")) {
    const resp = await fetch(audioUrl);
    return resp.arrayBuffer();
  }
  const mediaId = audioUrl.replace("wa-audio://", "");
  const accessToken = Deno.env.get("WA_ACCESS_TOKEN");
  if (!accessToken) throw new Error("Missing WA_ACCESS_TOKEN");

  const metaResp = await fetch(`https://graph.facebook.com/v22.0/${mediaId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!metaResp.ok) {
    if (metaResp.status === 401 || metaResp.status === 403) {
      console.error("[WA TOKEN] Token scaduto o invalidato. Rigenerare da System User CAAT Bot su business.facebook.com");
      await supabase.from("config_sistema").upsert(
        { chiave: "wa_token_status", valore: `expired|${new Date().toISOString()}`, descrizione: "Stato del token WhatsApp" },
        { onConflict: "chiave" }
      );
    }
    throw new Error(`Media URL fetch failed (HTTP ${metaResp.status}): ${await metaResp.text()}`);
  }
  const { url } = await metaResp.json();

  const audioResp = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!audioResp.ok) throw new Error(`Audio download failed: ${await audioResp.text()}`);
  return audioResp.arrayBuffer();
}

serve(async (req) => {
  try {
    const message = await req.json();
    console.log(`[CLIENT] Received from ${message.from}: "${message.text}" (${message.type})`);

    // Transcribe audio if needed
    let text = message.text || "";
    if (message.type === "audio" && message.audioUrl) {
      const audioBuffer = await downloadWhatsAppAudio(message.audioUrl);
      text = await transcribeAudio(audioBuffer);
    } else if (message.type === "audio") {
      text = await transcribeAudio(new ArrayBuffer(0));
    }

    // 1. Find client by phone
    const phone = message.from.replace(/\s/g, "");
    const { data: client } = await supabase
      .from("clienti")
      .select("id, nome, categoria, telefono")
      .in("telefono", [phone, message.from])
      .maybeSingle();

    if (!client) {
      console.log(`[CLIENT] Unknown number: ${message.from}`);
      return new Response(JSON.stringify({ status: "unknown_sender" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`[CLIENT] Identified: ${client.nome}`);

    // 2. Log message
    const tipoMap: Record<string, string> = { text: "testo", audio: "audio", image: "immagine" };
    await supabase.from("conversazioni").insert({
      cliente_id: client.id,
      interlocutore: "cliente",
      direzione: "in",
      tipo_messaggio: tipoMap[message.type] || "testo",
      contenuto: text,
      trascrizione: message.type === "audio" ? text : null,
    });

    // 3. Check STOP
    if (/^STOP$/i.test(text.trim())) {
      await supabase.from("blacklist").insert({
        cliente_id: client.id,
        motivo: "Richiesto dal cliente",
        escluso_da: "cliente",
      });
      await sendWhatsAppMessage(
        client.telefono,
        "Non riceverai più messaggi. Se cambi idea, contattaci direttamente.",
        "cliente",
        client.id
      );
      return new Response(JSON.stringify({ action: "client_stop", client: client.nome }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 4. Get active offer for this client
    const { data: offer } = await supabase
      .from("offerte_giornaliere")
      .select("*")
      .eq("cliente_id", client.id)
      .eq("stato", "sent")
      .order("data_generazione", { ascending: false })
      .limit(1)
      .maybeSingle();

    // 5. Get conversation history
    const { data: history } = await supabase
      .from("conversazioni")
      .select("direzione, contenuto, created_at")
      .eq("cliente_id", client.id)
      .order("created_at", { ascending: false })
      .limit(5);

    // 6. Call ai-reply function
    const baseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const aiResponse = await fetch(`${baseUrl}/functions/v1/ai-reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        client,
        offer: offer?.offerta_claude || null,
        history: history || [],
        message: text,
      }),
    });

    const reply = await aiResponse.json();

    // 7. Send reply to client
    await sendWhatsAppMessage(
      client.telefono,
      reply.message,
      "cliente",
      client.id,
      offer?.id
    );

    // 8. Handle order confirmation
    if (reply.order_confirmed && reply.order_summary && offer) {
      const summary = reply.order_summary;

      // Build owner notification
      const itemLines = summary.items
        .map((i: any) => `${i.nome} x${i.quantita} — €${i.prezzo_unitario}${i.nota ? ` (${i.nota})` : ""}`)
        .join("\n");
      const ownerMsg = `📦 NUOVO ORDINE — ${client.nome}\n${itemLines}\n${summary.trasporto_gratuito ? "🚚 Trasporto gratuito\n" : ""}💰 Totale stimato: €${summary.totale}\nInserisci l'ordine in Arca.`;

      // Get owner phone
      const { data: ownerConfig } = await supabase
        .from("config_sistema").select("valore").eq("chiave", "telefono_titolare").single();

      await sendWhatsAppMessage(
        ownerConfig?.valore || "+39 333 000 0000",
        ownerMsg,
        "titolare"
      );

      // Update offer status
      await supabase.from("offerte_giornaliere")
        .update({ stato: "order_confirmed", ordine_confermato: summary })
        .eq("id", offer.id);

      console.log(`[CLIENT] Order confirmed for ${client.nome}: €${summary.totale}`);

      return new Response(
        JSON.stringify({
          action: "order_confirmed",
          client: client.nome,
          totale: summary.totale,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 9. Check escalation
    if (reply.escalate) {
      const { data: ownerConfig } = await supabase
        .from("config_sistema").select("valore").eq("chiave", "telefono_titolare").single();

      await sendWhatsAppMessage(
        ownerConfig?.valore || "+39 333 000 0000",
        `⚡ ${client.nome} ha risposto e serve il tuo intervento:\n"${text}"\n\nMotivo: ${reply.escalationReason}`,
        "titolare"
      );
    }

    return new Response(
      JSON.stringify({
        action: "client_reply",
        client: client.nome,
        escalated: reply.escalate || false,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[CLIENT] Error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
