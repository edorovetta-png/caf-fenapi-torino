"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Clienti() {
  const [clienti, setClienti] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [storico, setStorico] = useState<any[]>([]);
  const [offerte, setOfferte] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("clienti").select("*").order("nome");
      // Enrich with dormancy info
      const enriched = [];
      for (const c of data || []) {
        const { data: bl } = await supabase.from("blacklist").select("id").eq("cliente_id", c.id).maybeSingle();
        const { data: last } = await supabase.from("storico_acquisti").select("data_acquisto")
          .eq("cliente_id", c.id).order("data_acquisto", { ascending: false }).limit(1).maybeSingle();
        const days = last ? Math.floor((Date.now() - new Date(last.data_acquisto).getTime()) / 86400000) : null;
        enriched.push({ ...c, blacklisted: !!bl, giorni_dormiente: days, ultimo_acquisto: last?.data_acquisto });
      }
      setClienti(enriched);
    }
    load();
  }, []);

  async function selectClient(c: any) {
    setSelected(c);
    const { data: s } = await supabase.from("storico_acquisti")
      .select("*, prodotti(nome)").eq("cliente_id", c.id).order("data_acquisto", { ascending: false }).limit(20);
    setStorico(s || []);
    const { data: o } = await supabase.from("offerte_giornaliere")
      .select("*").eq("cliente_id", c.id).order("data_generazione", { ascending: false }).limit(10);
    setOfferte(o || []);
  }

  async function toggleBlacklist(c: any) {
    if (c.blacklisted) {
      await supabase.from("blacklist").delete().eq("cliente_id", c.id);
    } else {
      await supabase.from("blacklist").insert({ cliente_id: c.id, motivo: "Aggiunto da admin" });
    }
    // Refresh
    const updated = clienti.map((cl) => cl.id === c.id ? { ...cl, blacklisted: !c.blacklisted } : cl);
    setClienti(updated);
    if (selected?.id === c.id) setSelected({ ...selected, blacklisted: !c.blacklisted });
  }

  return (
    <div className="flex gap-4" style={{ height: "calc(100vh - 80px)" }}>
      {/* List */}
      <div className="w-96 bg-white rounded-xl border border-slate-200 shadow-sm overflow-auto">
        <div className="px-4 py-3 border-b border-slate-100 sticky top-0 bg-white">
          <h1 className="font-bold text-slate-900">Clienti ({clienti.length})</h1>
        </div>
        {clienti.map((c) => (
          <div key={c.id} onClick={() => selectClient(c)}
            className={`px-4 py-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 ${selected?.id === c.id ? "bg-blue-50" : ""}`}>
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm text-slate-800">{c.nome}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                c.blacklisted ? "bg-red-100 text-red-600" :
                c.giorni_dormiente && c.giorni_dormiente > 60 ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"
              }`}>{c.blacklisted ? "blacklist" : c.giorni_dormiente && c.giorni_dormiente > 60 ? `${c.giorni_dormiente}gg` : "attivo"}</span>
            </div>
            <p className="text-xs text-slate-400">{c.categoria} • {c.telefono}</p>
          </div>
        ))}
      </div>

      {/* Detail */}
      <div className="flex-1 overflow-auto">
        {selected ? (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-slate-900">{selected.nome}</h2>
                <button onClick={() => toggleBlacklist(selected)}
                  className={`text-xs px-3 py-1 rounded-full ${selected.blacklisted ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {selected.blacklisted ? "Rimuovi da blacklist" : "Aggiungi a blacklist"}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><p className="text-slate-400 text-xs">Categoria</p><p className="font-medium">{selected.categoria}</p></div>
                <div><p className="text-slate-400 text-xs">Telefono</p><p className="font-medium">{selected.telefono}</p></div>
                <div><p className="text-slate-400 text-xs">Ultimo acquisto</p><p className="font-medium">{selected.ultimo_acquisto || "N/A"}</p></div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-semibold text-slate-700 text-sm mb-3">Storico acquisti (ultimi 20)</h3>
              <table className="w-full text-xs">
                <thead className="text-slate-400"><tr><th className="text-left py-1">Data</th><th className="text-left">Prodotto</th><th className="text-right">Qtà</th><th className="text-right">Importo</th></tr></thead>
                <tbody>
                  {storico.map((s) => (
                    <tr key={s.id} className="border-t border-slate-50">
                      <td className="py-1.5">{s.data_acquisto}</td>
                      <td>{(s as any).prodotti?.nome}</td>
                      <td className="text-right">{s.quantita}</td>
                      <td className="text-right font-medium">€{s.importo_totale}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {offerte.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-semibold text-slate-700 text-sm mb-3">Offerte</h3>
                {offerte.map((o) => (
                  <div key={o.id} className="border-b border-slate-50 py-2 last:border-0">
                    <div className="flex justify-between text-xs">
                      <span>{o.data_generazione} • {o.giorni_dormiente}gg</span>
                      <span className={`px-2 py-0.5 rounded-full ${o.stato === "sent" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>{o.stato}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{o.messaggio_cliente}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">Seleziona un cliente dalla lista</div>
        )}
      </div>
    </div>
  );
}
