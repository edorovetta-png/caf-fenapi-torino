import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";
import { sendWhatsAppMessage } from "../_shared/whatsapp.ts";
import { transcribeAudio } from "../_shared/whisper.ts";

// ── Audio download ───────────────────────────────────────────────────

async function downloadWhatsAppAudio(audioUrl: string): Promise<ArrayBuffer> {
  if (!audioUrl.startsWith("wa-audio://")) {
    const resp = await fetch(audioUrl);
    return resp.arrayBuffer();
  }
  const mediaId = audioUrl.replace("wa-audio://", "");
  const accessToken = Deno.env.get("WA_ACCESS_TOKEN");
  if (!accessToken) throw new Error("Missing WA_ACCESS_TOKEN");

  // Step 1: get media URL from Meta
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

  // Step 2: download actual audio
  const audioResp = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!audioResp.ok) throw new Error(`Audio download failed: ${await audioResp.text()}`);
  return audioResp.arrayBuffer();
}

// ── Helpers ───────────────────────────────────────────────────────────

async function getOwnerPhone() {
  const { data } = await supabase.from("config_sistema").select("valore").eq("chiave", "telefono_titolare").single();
  return data?.valore || "+39 333 000 0000";
}

async function getSession() {
  const { data } = await supabase.from("owner_session").select("*").limit(1).maybeSingle();
  return data;
}

async function updateSession(updates: Record<string, any>) {
  await supabase.from("owner_session").update(updates).not("id", "is", null);
}

async function reply(msg: string) {
  const phone = await getOwnerPhone();
  return sendWhatsAppMessage(phone, msg, "titolare");
}

// Get the offer at the current index
async function getOfferAtIndex(session: any, index?: number) {
  const idx = index ?? session.indice_corrente;
  const ids: string[] = session.offerte_ids || [];
  if (idx < 0 || idx >= ids.length) return null;

  const { data } = await supabase
    .from("offerte_giornaliere")
    .select("*, clienti(id, nome, categoria, telefono)")
    .eq("id", ids[idx])
    .single();
  return data;
}

// Build card message
function buildCard(offer: any, index: number, total: number): string {
  const claude = offer.offerta_claude;
  const client = (offer as any).clienti;
  const prodotti = (claude.prodotti_suggeriti || [])
    .map((p: any) => `${p.nome} -${p.sconto_pct}%`)
    .join(", ");
  const novita = (claude.novita_suggerite || []);
  const novitaLine = novita.length > 0 ? "\n🆕 " + novita.map((n: any) => n.nome).join(", ") : "";
  const trasporto = claude.trasporto_gratuito ? "\n🚚 Trasporto gratuito" : "";

  return `[${index + 1}/${total}] — ${client.nome} (${offer.giorni_dormiente}gg dormiente)
${prodotti}${novitaLine}${trasporto}
Vuoi inviarlo, modificarlo, posticiparlo o cancellarlo definitivamente?`;
}

// Advance to next card or finish
async function advanceToNext(session: any) {
  const ids: string[] = session.offerte_ids || [];
  const nextIdx = session.indice_corrente + 1;

  if (nextIdx >= ids.length) {
    // All done — trigger send-approved
    await updateSession({ stato: "idle", indice_corrente: 0, offerte_ids: [], offerta_in_modifica: null });

    // Count results
    const today = new Date().toISOString().split("T")[0];
    const { count: approved } = await supabase.from("offerte_giornaliere")
      .select("id", { count: "exact", head: true }).eq("data_generazione", today).in("stato", ["approved", "modified"]);
    const { count: postponed } = await supabase.from("offerte_giornaliere")
      .select("id", { count: "exact", head: true }).eq("data_generazione", today).eq("stato", "postponed");
    const { count: excluded } = await supabase.from("offerte_giornaliere")
      .select("id", { count: "exact", head: true }).eq("data_generazione", today).eq("stato", "excluded");

    // Trigger send-approved
    const baseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    await fetch(`${baseUrl}/functions/v1/send-approved`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
    });

    await reply(`✅ Revisione completata!\n${approved || 0} inviati, ${postponed || 0} rimandati, ${excluded || 0} esclusi.`);
    return { action: "review_complete", approved, postponed, excluded };
  }

  // Send next card
  await updateSession({ indice_corrente: nextIdx, offerta_in_modifica: null, stato: "reviewing" });
  const nextOffer = await getOfferAtIndex({ ...session, indice_corrente: nextIdx });
  if (nextOffer) {
    await reply(buildCard(nextOffer, nextIdx, ids.length));
  }
  return { action: "next_card", index: nextIdx };
}

// ── Command handlers ──────────────────────────────────────────────────

async function approveCurrentAndAdvance(session: any) {
  const offer = await getOfferAtIndex(session);
  if (!offer) return advanceToNext(session);

  await supabase.from("offerte_giornaliere").update({ stato: "approved" }).eq("id", (offer as any).id);
  const client = (offer as any).clienti;
  console.log(`✓ Approved: ${client.nome}`);

  return advanceToNext(session);
}

async function postponeCurrentAndAdvance(session: any, days: number = 14) {
  const offer = await getOfferAtIndex(session);
  if (!offer) return advanceToNext(session);

  const futureDate = new Date(Date.now() + days * 86400000).toISOString().split("T")[0];
  await supabase.from("offerte_giornaliere")
    .update({ stato: "postponed", data_rimando: futureDate }).eq("id", (offer as any).id);

  const client = (offer as any).clienti;
  await reply(`⏸️ ${client.nome} rimandato di ${days} giorni.`);

  return advanceToNext(session);
}

async function blacklistCurrent(session: any, confirmed: boolean) {
  const offer = await getOfferAtIndex(session);
  if (!offer) return advanceToNext(session);

  const client = (offer as any).clienti;

  if (!confirmed) {
    await reply(`⚠️ Vuoi escludere permanentemente ${client.nome}? Rispondi CONFERMO per procedere.`);
    return { action: "awaiting_blacklist_confirm" };
  }

  await supabase.from("blacklist").insert({ cliente_id: client.id, motivo: "Escluso dal titolare" });
  await supabase.from("offerte_giornaliere")
    .update({ stato: "excluded", motivo_esclusione: "Blacklist titolare" }).eq("id", (offer as any).id);
  await reply(`🚫 ${client.nome} escluso permanentemente.`);

  return advanceToNext(session);
}

async function startModifyCurrent(session: any, instructions: string) {
  const offer = await getOfferAtIndex(session);
  if (!offer) return advanceToNext(session);

  const client = (offer as any).clienti;
  const currentOffer = (offer as any).offerta_claude;

  // Mock Claude modification
  const modifiedOffer = {
    ...currentOffer,
    reasoning: `[MODIFICATA] Istruzione titolare: "${instructions}"`,
    messaggio_cliente: `Ciao ${client.nome}! 👋 ${instructions.includes("sconto") ? "Abbiamo uno sconto speciale extra per te!" : "Abbiamo un'offerta pensata dal titolare!"} Ti aspettiamo!`,
  };

  await supabase.from("offerte_giornaliere")
    .update({ offerta_finale: modifiedOffer }).eq("id", (offer as any).id);
  await updateSession({ stato: "modifying", offerta_in_modifica: (offer as any).id });

  const prodottiPreview = (modifiedOffer.prodotti_suggeriti || [])
    .map((p: any) => `${p.nome}: €${p.prezzo_scontato}`).join(", ");

  await reply(`✏️ Offerta modificata per ${client.nome}:\n${prodottiPreview}\n📱 "${modifiedOffer.messaggio_cliente}"\n\nConfermi? Rispondi SÌ o modifica ancora.`);

  return { action: "modify_preview", client: client.nome };
}

async function approveAllRemaining(session: any) {
  const ids: string[] = session.offerte_ids || [];
  const remaining = ids.slice(session.indice_corrente);

  // Approve current + all remaining pending
  for (const id of remaining) {
    await supabase.from("offerte_giornaliere")
      .update({ stato: "approved" })
      .eq("id", id)
      .eq("stato", "pending");
  }

  // Jump to end
  const fakeSession = { ...session, indice_corrente: ids.length - 1 };
  return advanceToNext(fakeSession);
}

// ── Main handler ──────────────────────────────────────────────────────

serve(async (req) => {
  try {
    const message = await req.json();
    console.log("[OWNER] RAW message:", JSON.stringify(message));
    let text = message.text || message.message || "";

    // Transcribe audio
    if (message.type === "audio" && message.audioUrl) {
      const audioBuffer = await downloadWhatsAppAudio(message.audioUrl);
      text = await transcribeAudio(audioBuffer);
    } else if (message.type === "audio") {
      text = await transcribeAudio(new ArrayBuffer(0));
    }

    // Map WhatsApp message types to our DB values
    const tipoMap: Record<string, string> = { text: "testo", audio: "audio", image: "immagine" };
    const tipoMessaggio = tipoMap[message.type] || "testo";

    // Log incoming message from owner
    const { error: logError } = await supabase.from("conversazioni").insert({
      interlocutore: "titolare",
      direzione: "in",
      tipo_messaggio: tipoMessaggio,
      contenuto: text,
      trascrizione: message.type === "audio" ? text : null,
    });
    if (logError) console.error("[OWNER] Failed to log incoming message:", logError);

    const session = await getSession();
    const stato = session?.stato || "idle";
    const trimmed = text.trim();

    console.log(`[OWNER] "${trimmed}" | stato=${stato} | idx=${session?.indice_corrente}`);

    // ── Modifying state: waiting for confirm/re-edit
    if (stato === "modifying") {
      if (/^(SI|SÌ|S[IÌ]|CONFERMA|CONFERMO)$/i.test(trimmed)) {
        await supabase.from("offerte_giornaliere")
          .update({ stato: "modified" }).eq("id", session.offerta_in_modifica);
        await reply("✅ Modifica confermata.");
        return json(await advanceToNext(session));
      }
      if (/^ANNULLA$/i.test(trimmed)) {
        await updateSession({ stato: "reviewing", offerta_in_modifica: null });
        const offer = await getOfferAtIndex(session);
        if (offer) await reply(buildCard(offer, session.indice_corrente, (session.offerte_ids || []).length));
        return json({ action: "cancel_modify" });
      }
      // Re-edit with new instructions
      return json(await startModifyCurrent(session, trimmed));
    }

    // ── Awaiting blacklist confirmation
    if (/^CONFERMO$/i.test(trimmed)) {
      return json(await blacklistCurrent(session, true));
    }

    // ── Not reviewing? Check if there are pending offers to start reviewing
    if (stato !== "reviewing") {
      const today = new Date().toISOString().split("T")[0];
      const { data: pendingOffers } = await supabase
        .from("offerte_giornaliere")
        .select("id, giorni_dormiente, offerta_claude, messaggio_cliente, clienti(id, nome, categoria)")
        .eq("data_generazione", today)
        .eq("stato", "pending")
        .order("giorni_dormiente", { ascending: false });

      if (pendingOffers && pendingOffers.length > 0) {
        const offerIds = pendingOffers.map((o: any) => o.id);
        await updateSession({ stato: "reviewing", indice_corrente: 0, offerte_ids: offerIds, offerta_in_modifica: null });
        const firstCard = buildCard(pendingOffers[0], 0, pendingOffers.length);
        await reply(firstCard);
        return json({ action: "started_review", total: pendingOffers.length });
      }

      await reply("❓ Nessuna revisione attiva. Usa il simulatore per lanciare l'estrazione.");
      return json({ action: "idle" });
    }

    // ── Reviewing: parse commands for current card

    // "invia" / "ok" / "sì" → approve current
    if (/^(OK|INVIA|SI|SÌ|S[IÌ]|MANDA|VAI)$/i.test(trimmed)) {
      return json(await approveCurrentAndAdvance(session));
    }

    // "invia tutti" / "manda tutti" / "approva tutti" → bulk approve remaining
    if (/^(INVIA|MANDA|APPROVA)\s+(TUTTI|TUTTO|I RESTANTI)/i.test(trimmed)) {
      return json(await approveAllRemaining(session));
    }

    // "posticipa" / "rimanda" [gg]
    if (/^(POSTICIPA|RIMANDA|SALTA)/i.test(trimmed)) {
      const daysMatch = trimmed.match(/(\d+)\s*gg/i);
      const days = daysMatch ? parseInt(daysMatch[1]) : 14;
      return json(await postponeCurrentAndAdvance(session, days));
    }

    // "cancella" / "elimina" / "stop" → blacklist
    if (/^(CANCELLA|ELIMINA|STOP|BLOCCA)/i.test(trimmed)) {
      return json(await blacklistCurrent(session, false));
    }

    // "modifica: ..." or "mod: ..."
    const modMatch = trimmed.match(/^(?:MODIFICA|MOD)\s*[:\-]?\s*(.+)/i);
    if (modMatch) {
      return json(await startModifyCurrent(session, modMatch[1]));
    }

    // Free text that looks like modification instructions (contains verbs/instructions)
    // If in reviewing state and text is >10 chars, treat as modification
    if (trimmed.length > 10) {
      return json(await startModifyCurrent(session, trimmed));
    }

    await reply("❓ Non ho capito. Rispondi: invia, modifica: [istruzioni], posticipa, cancella, o invia tutti.");
    return json({ action: "unknown" });
  } catch (err) {
    console.error("[OWNER] Error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
});

function json(data: any) {
  return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
}
