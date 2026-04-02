"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import ChatBubble from "@/components/ChatBubble";

export default function Simulatore() {
  const [ownerMsgs, setOwnerMsgs] = useState<any[]>([]);
  const [clientMsgs, setClientMsgs] = useState<any[]>([]);
  const [ownerInput, setOwnerInput] = useState("");
  const [clientInput, setClientInput] = useState("");
  const [clienti, setClienti] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [ownerPhone, setOwnerPhone] = useState("+39 333 000 0000");
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [clientLoading, setClientLoading] = useState(false);
  const [triggerLoading, setTriggerLoading] = useState("");
  const ownerEndRef = useRef<HTMLDivElement>(null);
  const clientEndRef = useRef<HTMLDivElement>(null);
  const selectedClientRef = useRef<any>(null);

  // Keep ref in sync for use in realtime callback
  useEffect(() => { selectedClientRef.current = selectedClient; }, [selectedClient]);

  // Call edge function using supabase.functions.invoke (official SDK method)
  // This avoids all env var resolution issues since the client is already initialized
  async function callFunction(name: string, body?: any) {
    const { data, error } = await supabase.functions.invoke(name, {
      body: body || {},
    });
    if (error) {
      console.error(`Edge function ${name} error:`, error);
      throw error;
    }
    return data;
  }

  // Load clients + owner phone on mount
  useEffect(() => {
    supabase.from("clienti").select("id, nome, telefono, categoria").order("nome").then(({ data }) => setClienti(data || []));
    supabase.from("config_sistema").select("valore").eq("chiave", "telefono_titolare").single().then(({ data }) => {
      if (data) setOwnerPhone(data.valore);
    });
  }, []);

  // Load owner conversations from DB
  const loadOwnerMsgs = useCallback(async () => {
    const { data } = await supabase.from("conversazioni")
      .select("*").eq("interlocutore", "titolare").order("created_at", { ascending: true });
    setOwnerMsgs(data || []);
  }, []);

  // Load client conversations from DB
  const loadClientMsgs = useCallback(async (clientId: string) => {
    const { data } = await supabase.from("conversazioni")
      .select("*").eq("cliente_id", clientId).order("created_at", { ascending: true });
    setClientMsgs(data || []);
  }, []);

  // Initial load
  useEffect(() => { loadOwnerMsgs(); }, [loadOwnerMsgs]);
  useEffect(() => { if (selectedClient) loadClientMsgs(selectedClient.id); }, [selectedClient, loadClientMsgs]);

  // Realtime: listen for new messages and add them to the chat
  useEffect(() => {
    const channel = supabase.channel("sim-conv-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "conversazioni" }, (payload) => {
        const msg = payload.new as any;
        if (msg.interlocutore === "titolare") {
          setOwnerMsgs((prev) => {
            // Deduplicate by id
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
        const sc = selectedClientRef.current;
        if (sc && msg.cliente_id === sc.id) {
          setClientMsgs((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Auto scroll
  useEffect(() => { ownerEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [ownerMsgs]);
  useEffect(() => { clientEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [clientMsgs]);

  // Send owner message
  // FIX #3: Add the owner's message to the chat immediately as a local bubble
  // FIX #1: callFunction now reads env at call time
  async function sendOwner() {
    if (!ownerInput.trim() || ownerLoading) return;
    const text = ownerInput;
    setOwnerInput("");
    setOwnerLoading(true);

    // Immediately show the owner's message as an "in" bubble (right side)
    const tempMsg = {
      id: "temp-" + Date.now(),
      interlocutore: "titolare",
      direzione: "in",
      tipo_messaggio: "testo",
      contenuto: text,
      created_at: new Date().toISOString(),
    };
    setOwnerMsgs((prev) => [...prev, tempMsg]);

    try {
      await callFunction("whatsapp-webhook", { from: ownerPhone, type: "text", text });
    } catch (err) {
      console.error("Error calling webhook:", err);
    }

    // Reload to get the server responses (the temp msg will be deduped by realtime or replaced)
    setTimeout(() => { loadOwnerMsgs(); setOwnerLoading(false); }, 1500);
  }

  // Send client message — same pattern
  async function sendClient() {
    if (!clientInput.trim() || !selectedClient || clientLoading) return;
    const text = clientInput;
    setClientInput("");
    setClientLoading(true);

    const tempMsg = {
      id: "temp-" + Date.now(),
      interlocutore: "cliente",
      direzione: "in",
      tipo_messaggio: "testo",
      contenuto: text,
      created_at: new Date().toISOString(),
    };
    setClientMsgs((prev) => [...prev, tempMsg]);

    try {
      await callFunction("whatsapp-webhook", { from: selectedClient.telefono, type: "text", text });
    } catch (err) {
      console.error("Error calling webhook:", err);
    }

    setTimeout(() => { loadClientMsgs(selectedClient.id); setClientLoading(false); }, 1500);
  }

  // Trigger buttons
  async function triggerExtraction() {
    setTriggerLoading("extract");
    try {
      const res = await callFunction("extract-dormant");
      alert(`Estrazione completata: ${res.offers || 0} offerte generate`);
    } catch (err) {
      alert("Errore nell'estrazione: " + (err as Error).message);
    }
    setTriggerLoading("");
  }

  async function triggerNotify() {
    setTriggerLoading("notify");
    try {
      await callFunction("notify-owner");
    } catch (err) {
      alert("Errore nella notifica: " + (err as Error).message);
    }
    setTimeout(() => { loadOwnerMsgs(); setTriggerLoading(""); }, 1500);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Simulatore WhatsApp</h1>
      <div className="flex gap-4 mb-4">
        <button onClick={triggerExtraction} disabled={!!triggerLoading}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {triggerLoading === "extract" ? "⏳ Estrazione..." : "▶️ Trigger Estrazione"}
        </button>
        <button onClick={triggerNotify} disabled={!!triggerLoading}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          {triggerLoading === "notify" ? "⏳ Notifica..." : "▶️ Trigger Riepilogo"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4" style={{ height: "calc(100vh - 200px)" }}>
        {/* Owner Panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-slate-800 text-white text-sm font-semibold flex items-center gap-2">
            👤 Titolare <span className="text-xs text-slate-400 font-normal">{ownerPhone}</span>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-1">
            {ownerMsgs.map((m) => (
              <ChatBubble key={m.id}
                direction={m.direzione === "in" ? "out" : "in"}
                text={m.contenuto}
                time={new Date(m.created_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                type={m.tipo_messaggio} />
            ))}
            <div ref={ownerEndRef} />
          </div>
          <div className="p-3 border-t border-slate-100 flex gap-2">
            <input value={ownerInput} onChange={(e) => setOwnerInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendOwner()}
              placeholder="invia, posticipa, cancella, modifica: ..."
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={sendOwner} disabled={ownerLoading}
              className="px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 disabled:opacity-50">
              {ownerLoading ? "⏳" : "Invia"}
            </button>
          </div>
        </div>

        {/* Client Panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-green-700 text-white text-sm font-semibold flex items-center gap-2">
            🏪 Cliente
            <select value={selectedClient?.id || ""} onChange={(e) => {
              const c = clienti.find((cl) => cl.id === e.target.value);
              setSelectedClient(c || null);
              if (c) loadClientMsgs(c.id);
            }} className="ml-2 bg-green-800 text-white text-xs rounded px-2 py-1 border-0">
              <option value="">Seleziona cliente...</option>
              {clienti.map((c) => <option key={c.id} value={c.id}>{c.nome} ({c.categoria})</option>)}
            </select>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-1">
            {selectedClient ? (
              clientMsgs.length > 0 ? (
                clientMsgs.map((m) => (
                  <ChatBubble key={m.id}
                    direction={m.direzione === "in" ? "out" : "in"}
                    text={m.contenuto}
                    time={new Date(m.created_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                    type={m.tipo_messaggio} />
                ))
              ) : (
                <p className="text-sm text-slate-400 text-center mt-10">Nessun messaggio per questo cliente.</p>
              )
            ) : (
              <p className="text-sm text-slate-400 text-center mt-10">Seleziona un cliente dal dropdown.</p>
            )}
            <div ref={clientEndRef} />
          </div>
          <div className="p-3 border-t border-slate-100 flex gap-2">
            <input value={clientInput} onChange={(e) => setClientInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendClient()}
              placeholder={selectedClient ? "Scrivi come " + selectedClient.nome + "..." : "Seleziona un cliente"}
              disabled={!selectedClient}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50" />
            <button onClick={sendClient} disabled={!selectedClient || clientLoading}
              className="px-4 py-2 bg-green-700 text-white text-sm rounded-lg hover:bg-green-600 disabled:opacity-50">
              {clientLoading ? "⏳" : "Invia"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
