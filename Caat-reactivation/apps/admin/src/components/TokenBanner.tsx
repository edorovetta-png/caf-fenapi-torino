"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TokenBanner() {
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    async function check() {
      const { data } = await supabase
        .from("config_sistema")
        .select("valore")
        .eq("chiave", "wa_token_status")
        .maybeSingle();

      if (data?.valore?.startsWith("expired")) {
        setExpired(true);
      }
    }

    check();

    // Realtime subscription
    const channel = supabase
      .channel("token-status")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "config_sistema", filter: "chiave=eq.wa_token_status" },
        (payload: any) => {
          const val = payload.new?.valore || "";
          setExpired(val.startsWith("expired"));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (!expired) return null;

  return (
    <div className="bg-red-600 text-white px-4 py-3 text-sm font-medium flex items-center gap-2">
      <span>&#9888;&#65039; Token WhatsApp scaduto — i messaggi non vengono inviati. Rigenera il token dal System User CAAT Bot.</span>
    </div>
  );
}
