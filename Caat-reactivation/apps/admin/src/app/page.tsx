"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import KpiCard from "@/components/KpiCard";

export default function Dashboard() {
  const [kpi, setKpi] = useState({ dormienti: 0, inviate: 0, tasso: "0%", riattivati: 0 });
  const [offerte, setOfferte] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data: clienti } = await supabase.from("clienti").select("id");
      let dormienti = 0;
      for (const c of clienti || []) {
        const { data: last } = await supabase
          .from("storico_acquisti").select("data_acquisto")
          .eq("cliente_id", c.id).order("data_acquisto", { ascending: false }).limit(1).maybeSingle();
        if (last) {
          const days = Math.floor((Date.now() - new Date(last.data_acquisto).getTime()) / 86400000);
          if (days > 60) dormienti++;
        }
      }
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
      const { count: inviate } = await supabase.from("offerte_giornaliere")
        .select("id", { count: "exact", head: true }).eq("stato", "sent").gte("data_generazione", weekAgo);

      const { data: sentOffers } = await supabase.from("offerte_giornaliere").select("cliente_id").eq("stato", "sent");
      let withResp = 0;
      for (const o of sentOffers || []) {
        const { count } = await supabase.from("conversazioni")
          .select("id", { count: "exact", head: true }).eq("cliente_id", o.cliente_id).eq("interlocutore", "cliente").eq("direzione", "in");
        if (count && count > 0) withResp++;
      }
      const tasso = sentOffers && sentOffers.length > 0 ? Math.round((withResp / sentOffers.length) * 100) + "%" : "0%";

      setKpi({ dormienti, inviate: inviate || 0, tasso, riattivati: 0 });

      const { data: recent } = await supabase.from("offerte_giornaliere")
        .select("id, data_generazione, stato, giorni_dormiente, clienti(nome)")
        .order("created_at", { ascending: false }).limit(10);
      setOfferte(recent || []);
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Clienti dormienti" value={kpi.dormienti} sub=">60 giorni senza acquisti" />
        <KpiCard label="Offerte inviate" value={kpi.inviate} sub="ultimi 7 giorni" />
        <KpiCard label="Tasso risposta" value={kpi.tasso} sub="clienti che hanno risposto" />
        <KpiCard label="Riattivati" value={kpi.riattivati} sub="questo mese" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100"><h2 className="font-semibold text-slate-700 text-sm">Ultime offerte</h2></div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr><th className="px-5 py-2 text-left">Cliente</th><th className="px-5 py-2 text-left">Data</th><th className="px-5 py-2 text-left">Dormienza</th><th className="px-5 py-2 text-left">Stato</th></tr>
          </thead>
          <tbody>
            {offerte.map((o) => (
              <tr key={o.id} className="border-t border-slate-50 hover:bg-slate-50">
                <td className="px-5 py-2.5 font-medium text-slate-800">{(o as any).clienti?.nome}</td>
                <td className="px-5 py-2.5 text-slate-500">{o.data_generazione}</td>
                <td className="px-5 py-2.5 text-slate-500">{o.giorni_dormiente}gg</td>
                <td className="px-5 py-2.5"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                  o.stato==="sent"?"bg-green-100 text-green-700":o.stato==="pending"?"bg-yellow-100 text-yellow-700":o.stato==="postponed"?"bg-orange-100 text-orange-700":"bg-slate-100 text-slate-600"
                }`}>{o.stato}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
