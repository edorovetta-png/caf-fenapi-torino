"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const configFields = [
  { chiave: "ora_estrazione", label: "Ora estrazione dormienti", type: "text" },
  { chiave: "ora_notifica", label: "Ora notifica titolare", type: "text" },
  { chiave: "timeout_approvazione", label: "Timeout auto-approvazione", type: "text" },
  { chiave: "telefono_titolare", label: "Numero WhatsApp titolare", type: "text" },
  { chiave: "giorni_dormienza_soglia", label: "Soglia dormienza (giorni)", type: "number" },
  { chiave: "giorni_rimando_default", label: "Giorni rimando default", type: "number" },
  { chiave: "mock_mode", label: "Mock mode", type: "toggle" },
];

export default function Impostazioni() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from("config_sistema").select("*").then(({ data }) => {
      const map: Record<string, string> = {};
      (data || []).forEach((r: any) => { map[r.chiave] = r.valore; });
      setConfig(map);
    });
  }, []);

  async function saveField(chiave: string, valore: string) {
    await supabase.from("config_sistema").update({ valore }).eq("chiave", chiave);
    setConfig({ ...config, [chiave]: valore });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Impostazioni</h1>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {configFields.map((f) => (
          <div key={f.chiave} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-slate-800">{f.label}</p>
              <p className="text-xs text-slate-400">{f.chiave}</p>
            </div>
            {f.type === "toggle" ? (
              <button onClick={() => saveField(f.chiave, config[f.chiave] === "true" ? "false" : "true")}
                className={`w-12 h-6 rounded-full transition-colors relative ${config[f.chiave] === "true" ? "bg-green-500" : "bg-slate-300"}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${config[f.chiave] === "true" ? "left-6" : "left-0.5"}`} />
              </button>
            ) : (
              <input value={config[f.chiave] || ""} onChange={(e) => setConfig({ ...config, [f.chiave]: e.target.value })}
                onBlur={(e) => saveField(f.chiave, e.target.value)}
                type={f.type} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm w-48 text-right" />
            )}
          </div>
        ))}
      </div>
      {saved && <p className="text-green-600 text-sm mt-3">✓ Salvato</p>}
    </div>
  );
}
