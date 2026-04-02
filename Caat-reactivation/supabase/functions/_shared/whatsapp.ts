import { supabase } from "./supabase.ts";

interface SendResult {
  success: boolean;
  messageId: string;
}

export async function sendWhatsAppMessage(
  phone: string,
  message: string,
  interlocutore: "titolare" | "cliente" = "cliente",
  clienteId?: string,
  offertaId?: string,
  templateName?: string,
  templateParams?: string[]
): Promise<SendResult> {
  // Check mock mode from config_sistema
  const { data: config } = await supabase
    .from("config_sistema")
    .select("valore")
    .eq("chiave", "mock_mode")
    .single();

  const mockMode = config?.valore === "true";

  if (mockMode) {
    // MOCK: save to conversazioni table
    const fakeMessageId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const { error } = await supabase.from("conversazioni").insert({
      cliente_id: clienteId || null,
      interlocutore,
      direzione: "out",
      tipo_messaggio: "testo",
      contenuto: message,
      wa_message_id: fakeMessageId,
      offerta_id: offertaId || null,
    });

    if (error) {
      console.error("Error saving mock message:", error);
      return { success: false, messageId: "" };
    }

    console.log(`[MOCK] Message sent to ${phone} (${interlocutore}): ${message.substring(0, 80)}...`);
    return { success: true, messageId: fakeMessageId };
  }

  // REAL: WhatsApp Cloud API (Fase 5)
  const phoneNumberId = Deno.env.get('WA_PHONE_NUMBER_ID');
  const accessToken = Deno.env.get('WA_ACCESS_TOKEN');

  if (!phoneNumberId || !accessToken) {
    console.error("Missing WhatsApp credentials in Edge Secrets");
    return { success: false, messageId: "" };
  }

  // Check if token is already known to be expired
  const { data: tokenStatus } = await supabase
    .from("config_sistema")
    .select("valore")
    .eq("chiave", "wa_token_status")
    .maybeSingle();

  if (tokenStatus?.valore?.startsWith("expired")) {
    console.error("[WA TOKEN] Token già segnalato come scaduto. Skipping invio.");
    return { success: false, messageId: "" };
  }

  // Normalize phone to E.164 without '+' (Meta requirement)
  const normalizedPhone = phone.replace(/[\s\-\+]/g, "");

  // Costruisci il payload per Meta
  let payload: any;
  if (templateName) {
    payload = {
      messaging_product: "whatsapp",
      to: normalizedPhone,
      type: "template",
      template: {
        name: templateName,
        language: { code: templateName === "notifica_titolare" ? "en" : "it" },
        ...(templateParams && templateParams.length > 0
          ? {
              components: [
                {
                  type: "body",
                  parameters: templateParams.map((p) => ({ type: "text", text: p })),
                },
              ],
            }
          : {}),
      },
    };
  } else {
    payload = {
      messaging_product: "whatsapp",
      to: normalizedPhone,
      type: "text",
      text: { body: message },
    };
  }

  try {
    console.log(`[WA REAL] Sending to ${normalizedPhone}, payload:`, JSON.stringify(payload).substring(0, 500));

    const response = await fetch(
      `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(`[WA REAL] Meta API error (HTTP ${response.status}):`, JSON.stringify(data));

      // Detect expired/invalid token
      const errorCode = data?.error?.code;
      if (response.status === 401 || response.status === 403 || errorCode === 190) {
        console.error("[WA TOKEN] Token scaduto o invalidato. Rigenerare da System User CAAT Bot su business.facebook.com");
        await supabase.from("config_sistema").upsert(
          { chiave: "wa_token_status", valore: `expired|${new Date().toISOString()}`, descrizione: "Stato del token WhatsApp" },
          { onConflict: "chiave" }
        );
      }

      return { success: false, messageId: "" };
    }

    const messageId = data.messages?.[0]?.id || `wa_${Date.now()}`;

    // Salva sempre traccia nella tabella conversazioni
    await supabase.from("conversazioni").insert({
      cliente_id: clienteId || null,
      interlocutore,
      direzione: "out",
      tipo_messaggio: "testo",
      contenuto: message, // manteniamo il testo chiaro per i log/webapp
      wa_message_id: messageId,
      offerta_id: offertaId || null,
    });

    console.log(`[WA REAL] Sent message to ${phone}. ID: ${messageId}`);
    return { success: true, messageId };
  } catch (err) {
    console.error("Exception in sendWhatsAppMessage:", err);
    return { success: false, messageId: "" };
  }
}
