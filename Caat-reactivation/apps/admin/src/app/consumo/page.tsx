"use client";
import { useEffect, useState, useCallback } from "react";

interface UsageStats {
  periodo: { mese: string; da: string; a: string };
  whatsapp: {
    messaggi_inviati: number;
    messaggi_ricevuti: number;
    template_messages: number;
    free_messages: number;
    costo_stimato_eur: number;
  };
  claude_api: {
    offerte_generate: number;
    risposte_ai: number;
    costo_stimato_eur: number;
  };
  database: {
    clienti: number;
    prodotti: number;
    storico_acquisti: number;
    righe_totali: number;
    piano: string;
  };
  hosting: {
    supabase: string;
    vercel: string;
    costo_eur: number;
  };
  totale_mese_eur: number;
}

function costColor(total: number) {
  if (total > 30) return "text-red-600";
  if (total >= 10) return "text-amber-600";
  return "text-green-600";
}

export default function ConsumoPage() {
  const [data, setData] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/usage-stats`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error(`Errore ${res.status}`);
      const json: UsageStats = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message || "Errore nel caricamento");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Consumo e Costi</h1>
        <p className="text-sm text-slate-400">Caricamento...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Consumo e Costi</h1>
        <p className="text-sm text-red-500">{error || "Dati non disponibili"}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800"
        >
          Riprova
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Consumo e Costi</h1>
          <p className="text-sm text-slate-400 mt-1">
            Periodo: {data.periodo.mese} ({data.periodo.da} &mdash; {data.periodo.a})
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
        >
          Aggiorna
        </button>
      </div>

      {/* Total cost card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6 text-center">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
          Costo stimato mese corrente
        </p>
        <p className={`text-4xl font-bold mt-2 ${costColor(data.totale_mese_eur)}`}>
          &euro;{data.totale_mese_eur.toFixed(2)}
        </p>
      </div>

      {/* 2x2 detail grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* WhatsApp */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">
            WhatsApp
          </p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-2xl font-bold text-slate-900">{data.whatsapp.messaggi_inviati}</p>
              <p className="text-xs text-slate-400">Messaggi inviati</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{data.whatsapp.messaggi_ricevuti}</p>
              <p className="text-xs text-slate-400">Messaggi ricevuti</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{data.whatsapp.template_messages}</p>
              <p className="text-xs text-slate-400">Template messages</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{data.whatsapp.free_messages}</p>
              <p className="text-xs text-slate-400">Free messages</p>
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-700">
            Costo: &euro;{data.whatsapp.costo_stimato_eur.toFixed(2)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            I template costano ~&euro;0.04/msg. I messaggi nella finestra 24h sono gratuiti.
          </p>
        </div>

        {/* Claude API */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">
            Claude API
          </p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-2xl font-bold text-slate-900">{data.claude_api.offerte_generate}</p>
              <p className="text-xs text-slate-400">Offerte generate</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{data.claude_api.risposte_ai}</p>
              <p className="text-xs text-slate-400">Risposte AI</p>
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-700">
            Costo: &euro;{data.claude_api.costo_stimato_eur.toFixed(2)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Costo medio per offerta: ~&euro;0.004 (Sonnet). Risposte AI: ~&euro;0.002/msg.
          </p>
        </div>

        {/* Database */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">
            Database
          </p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-2xl font-bold text-slate-900">{data.database.clienti}</p>
              <p className="text-xs text-slate-400">Clienti</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{data.database.prodotti}</p>
              <p className="text-xs text-slate-400">Prodotti</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{data.database.storico_acquisti}</p>
              <p className="text-xs text-slate-400">Storico acquisti</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{data.database.righe_totali}</p>
              <p className="text-xs text-slate-400">Righe totali</p>
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-700">
            Piano: {data.database.piano}
          </p>
        </div>

        {/* Hosting */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">
            Hosting
          </p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-2xl font-bold text-slate-900">{data.hosting.supabase}</p>
              <p className="text-xs text-slate-400">Supabase</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{data.hosting.vercel}</p>
              <p className="text-xs text-slate-400">Vercel</p>
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-700">
            Costo: &euro;{data.hosting.costo_eur.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Cost reference table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <h2 className="font-semibold text-slate-700 text-sm">Stima costi a diverse scale</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="px-5 py-2 text-left">Scala</th>
              <th className="px-5 py-2 text-left">WhatsApp</th>
              <th className="px-5 py-2 text-left">Claude API</th>
              <th className="px-5 py-2 text-left">Totale</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-50">
              <td className="px-5 py-2.5 font-medium text-slate-800">50 clienti/mese</td>
              <td className="px-5 py-2.5 text-slate-500">~&euro;2</td>
              <td className="px-5 py-2.5 text-slate-500">~&euro;1</td>
              <td className="px-5 py-2.5 font-medium text-slate-800">~&euro;3</td>
            </tr>
            <tr className="border-t border-slate-50">
              <td className="px-5 py-2.5 font-medium text-slate-800">200 clienti/mese</td>
              <td className="px-5 py-2.5 text-slate-500">~&euro;8</td>
              <td className="px-5 py-2.5 text-slate-500">~&euro;3</td>
              <td className="px-5 py-2.5 font-medium text-slate-800">~&euro;11</td>
            </tr>
            <tr className="border-t border-slate-50">
              <td className="px-5 py-2.5 font-medium text-slate-800">500 clienti/mese</td>
              <td className="px-5 py-2.5 text-slate-500">~&euro;20</td>
              <td className="px-5 py-2.5 text-slate-500">~&euro;7</td>
              <td className="px-5 py-2.5 font-medium text-slate-800">~&euro;27</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
