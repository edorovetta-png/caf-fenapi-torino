"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Regole() {
  const [regole, setRegole] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome_regola: "", descrizione: "", condizione: "{}", azione: "{}", priorita: 0 });

  async function load() {
    const { data } = await supabase.from("regole_commerciali").select("*").order("priorita");
    setRegole(data || []);
  }
  useEffect(() => { load(); }, []);

  async function toggleActive(id: string, attiva: boolean) {
    await supabase.from("regole_commerciali").update({ attiva: !attiva }).eq("id", id);
    load();
  }

  async function save() {
    let condizione, azione;
    try { condizione = JSON.parse(form.condizione); } catch { alert("JSON condizione non valido"); return; }
    try { azione = JSON.parse(form.azione); } catch { alert("JSON azione non valido"); return; }
    const payload = { ...form, condizione, azione };
    if (editing) {
      await supabase.from("regole_commerciali").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("regole_commerciali").insert(payload);
    }
    setEditing(null);
    setShowForm(false);
    setForm({ nome_regola: "", descrizione: "", condizione: "{}", azione: "{}", priorita: 0 });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Eliminare questa regola?")) return;
    await supabase.from("regole_commerciali").delete().eq("id", id);
    load();
  }

  function startEdit(r: any) {
    setEditing(r);
    setShowForm(true);
    setForm({ nome_regola: r.nome_regola, descrizione: r.descrizione || "", condizione: JSON.stringify(r.condizione, null, 2), azione: JSON.stringify(r.azione, null, 2), priorita: r.priorita });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Regole Commerciali</h1>
        <button onClick={() => { setEditing(null); setShowForm(true); setForm({ nome_regola: "", descrizione: "", condizione: "{}", azione: "{}", priorita: 0 }); }}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">+ Aggiungi regola</button>
      </div>

      {showForm ? (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-sm">
          <h2 className="font-semibold text-slate-700 mb-3">{editing ? "Modifica regola" : "Nuova regola"}</h2>
          <div className="grid grid-cols-2 gap-4">
            <input value={form.nome_regola} onChange={(e) => setForm({ ...form, nome_regola: e.target.value })} placeholder="Nome regola" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.priorita} onChange={(e) => setForm({ ...form, priorita: parseInt(e.target.value) || 0 })} type="number" placeholder="Priorità" className="px-3 py-2 border rounded-lg text-sm" />
            <textarea value={form.descrizione} onChange={(e) => setForm({ ...form, descrizione: e.target.value })} placeholder="Descrizione" className="px-3 py-2 border rounded-lg text-sm col-span-2" rows={2} />
            <textarea value={form.condizione} onChange={(e) => setForm({ ...form, condizione: e.target.value })} placeholder='{"condizione": "..."}' className="px-3 py-2 border rounded-lg text-sm font-mono text-xs" rows={3} />
            <textarea value={form.azione} onChange={(e) => setForm({ ...form, azione: e.target.value })} placeholder='{"azione": "..."}' className="px-3 py-2 border rounded-lg text-sm font-mono text-xs" rows={3} />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={save} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg">Salva</button>
            <button onClick={() => { setEditing(null); setShowForm(false); setForm({ nome_regola: "", descrizione: "", condizione: "{}", azione: "{}", priorita: 0 }); }} className="px-4 py-2 bg-slate-200 text-sm rounded-lg">Annulla</button>
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        {regole.map((r) => (
          <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
            <button onClick={() => toggleActive(r.id, r.attiva)}
              className={`w-12 h-6 rounded-full transition-colors relative ${r.attiva ? "bg-green-500" : "bg-slate-300"}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${r.attiva ? "left-6" : "left-0.5"}`} />
            </button>
            <div className="flex-1 cursor-pointer" onClick={() => startEdit(r)}>
              <p className="font-medium text-slate-800 text-sm">{r.nome_regola}</p>
              <p className="text-xs text-slate-500">{r.descrizione}</p>
            </div>
            <span className="text-xs text-slate-400">P{r.priorita}</span>
            <button onClick={() => remove(r.id)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
