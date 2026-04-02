"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ChatBubble from "@/components/ChatBubble";

export default function Conversazioni() {
  const [messages, setMessages] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "titolare" | "cliente">("all");
  const [clienti, setClienti] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState("");

  useEffect(() => {
    supabase.from("clienti").select("id, nome").order("nome").then(({ data }) => setClienti(data || []));
  }, []);

  useEffect(() => {
    async function load() {
      let query = supabase.from("conversazioni").select("*, clienti(nome)").order("created_at", { ascending: true });
      if (filter !== "all") query = query.eq("interlocutore", filter);
      if (selectedClient) query = query.eq("cliente_id", selectedClient);
      const { data } = await query;
      setMessages(data || []);
    }
    load();
  }, [filter, selectedClient]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Conversazioni</h1>
      <div className="flex gap-3 mb-4">
        {(["all", "titolare", "cliente"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full ${filter === f ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {f === "all" ? "Tutti" : f === "titolare" ? "👤 Titolare" : "🏪 Clienti"}
          </button>
        ))}
        <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}
          className="px-3 py-1.5 text-xs border border-slate-200 rounded-full">
          <option value="">Tutti i clienti</option>
          {clienti.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <span className="text-xs text-slate-400 self-center">{messages.length} messaggi</span>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 max-h-[70vh] overflow-auto">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10">Nessuna conversazione trovata.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="mb-1">
              {m.interlocutore === "titolare" && m.direzione === "in" && (
                <p className="text-[10px] text-slate-400 mb-0.5 ml-1">👤 Titolare</p>
              )}
              {m.interlocutore === "cliente" && (
                <p className="text-[10px] text-slate-400 mb-0.5 ml-1">🏪 {(m as any).clienti?.nome || "Cliente"}</p>
              )}
              <ChatBubble direction={m.direzione} text={m.contenuto}
                time={new Date(m.created_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                type={m.tipo_messaggio} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
