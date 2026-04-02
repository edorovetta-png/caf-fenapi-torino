import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

serve(async (_req) => {
  const accessToken = Deno.env.get("WA_ACCESS_TOKEN");

  if (!accessToken) {
    return new Response(
      JSON.stringify({ status: "missing", message: "WA_ACCESS_TOKEN not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v22.0/me?access_token=${accessToken}`
    );

    const data = await response.json();

    if (response.ok) {
      // Token valid — clear any expired status
      await supabase.from("config_sistema").upsert(
        { chiave: "wa_token_status", valore: `valid|${new Date().toISOString()}`, descrizione: "Stato del token WhatsApp" },
        { onConflict: "chiave" }
      );

      return new Response(
        JSON.stringify({ status: "valid", app: data.name || data.id, checked_at: new Date().toISOString() }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Token expired or invalid
    const errorCode = data?.error?.code;
    if (response.status === 401 || errorCode === 190) {
      console.error("[WA TOKEN] Token scaduto o invalidato. Rigenerare da System User CAAT Bot su business.facebook.com");
      await supabase.from("config_sistema").upsert(
        { chiave: "wa_token_status", valore: `expired|${new Date().toISOString()}`, descrizione: "Stato del token WhatsApp" },
        { onConflict: "chiave" }
      );

      return new Response(
        JSON.stringify({ status: "expired", error: data.error, checked_at: new Date().toISOString() }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Other error
    return new Response(
      JSON.stringify({ status: "error", http_status: response.status, error: data.error, checked_at: new Date().toISOString() }),
      { status: response.status, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[CHECK-TOKEN] Exception:", err);
    return new Response(
      JSON.stringify({ status: "error", message: (err as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
