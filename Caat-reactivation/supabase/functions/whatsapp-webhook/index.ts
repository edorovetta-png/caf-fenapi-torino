import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

serve(async (req) => {
  // GET: Meta webhook verification (for future real WhatsApp)
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    const verifyToken = Deno.env.get("WA_VERIFY_TOKEN");
    console.log(`[WEBHOOK] GET verification — mode=${mode}, token=${token}, challenge=${challenge}, envToken=${verifyToken ? "set" : "NOT SET"}`);

    if (mode === "subscribe" && token && verifyToken && token === verifyToken) {
      return new Response(challenge!, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const body = await req.json();

    // Parse message — supports both simulator format and WhatsApp Cloud API format
    let message: { from: string; type: string; text?: string; audioUrl?: string };

    if (body.from && body.type) {
      // Simulator / direct format
      message = {
        from: body.from,
        type: body.type || "text",
        text: body.text || body.message,
        audioUrl: body.audioUrl || body.audio_url,
      };
    } else if (body.entry) {
      // WhatsApp Cloud API format
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0]?.value;

      // Handle status updates (delivered, read, sent) — acknowledge without processing
      if (change?.statuses && !change?.messages) {
        console.log(`[WEBHOOK] Status update: ${change.statuses.map((s: any) => s.status).join(", ")}`);
        return new Response(JSON.stringify({ status: "status_update_ack" }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      const msg = change?.messages?.[0];
      if (!msg) {
        console.log("[WEBHOOK] No message in payload — ignoring");
        return new Response(JSON.stringify({ status: "no message" }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      message = {
        from: msg.from,
        type: msg.type,
        text: msg.type === "text" ? msg.text?.body
            : msg.type === "button" ? msg.button?.text
            : msg.type === "interactive" ? (msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title)
            : undefined,
        audioUrl: msg.audio?.id ? `wa-audio://${msg.audio.id}` : undefined,
      };
    } else {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`[WEBHOOK] Message from ${message.from}: "${message.text}" (${message.type})`);

    // Determine sender
    const { data: ownerConfig } = await supabase
      .from("config_sistema")
      .select("valore")
      .eq("chiave", "telefono_titolare")
      .single();
    const ownerPhone = (ownerConfig?.valore || "").replace(/\s/g, "");
    const senderPhone = message.from.replace(/\s/g, "");

    // Route to appropriate handler via internal function call
    const baseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const targetFunction = senderPhone === ownerPhone
      ? "owner-interaction"
      : "client-interaction";

    console.log(`[WEBHOOK] Routing to ${targetFunction}`);

    const response = await fetch(`${baseUrl}/functions/v1/${targetFunction}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();

    return new Response(JSON.stringify({ routed_to: targetFunction, ...result }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[WEBHOOK] Error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
