import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// --- Helpers ---

function parseBool(value: string | undefined | null): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return ["si", "sì", "yes", "1", "true"].includes(v);
}

function parseNumber(value: string | undefined | null): number | null {
  if (!value || value.trim() === "") return null;
  // Handle comma as decimal separator: "1.234,56" → "1234.56"
  let cleaned = value.trim();
  if (cleaned.includes(",")) {
    // If both dot and comma exist, dot is thousands separator
    if (cleaned.includes(".")) {
      cleaned = cleaned.replace(/\./g, "").replace(",", ".");
    } else {
      cleaned = cleaned.replace(",", ".");
    }
  }
  const n = Number(cleaned);
  return isNaN(n) ? null : n;
}

function normalizeTelefono(value: string | undefined | null): string | null {
  if (!value || value.trim() === "") return null;
  let tel = value.trim().replace(/\s+/g, "");
  if (tel.startsWith("+39")) return tel;
  if (tel.startsWith("0039")) return "+39" + tel.slice(4);
  if (tel.startsWith("39") && tel.length > 10) return "+" + tel;
  // Assume Italian number
  return "+39" + tel;
}

function parseDate(value: string | undefined | null): string | null {
  if (!value || value.trim() === "") return null;
  const v = value.trim();
  // DD/MM/YYYY → YYYY-MM-DD
  const ddmmyyyy = v.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (ddmmyyyy) {
    const [, dd, mm, yyyy] = ddmmyyyy;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  return null;
}

function nonEmpty(value: string | undefined | null): boolean {
  return value !== undefined && value !== null && value.trim() !== "";
}

// --- Import handlers ---

interface ImportResult {
  imported: number;
  updated: number;
  skipped: number;
  errors: { row: number; field: string; message: string }[];
}

async function importClienti(rows: Record<string, string>[]): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, updated: 0, skipped: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;

    const arcaId = row.arca_id?.trim();
    if (!arcaId) {
      result.errors.push({ row: rowNum, field: "arca_id", message: "arca_id mancante" });
      continue;
    }

    // Check if record exists
    const { data: existing } = await supabase
      .from("clienti")
      .select("id")
      .eq("arca_id", arcaId)
      .maybeSingle();

    // Build data object, only non-empty fields
    const data: Record<string, unknown> = {};
    if (nonEmpty(row.nome)) data.nome = row.nome!.trim();
    if (nonEmpty(row.telefono)) data.telefono = normalizeTelefono(row.telefono);
    if (nonEmpty(row.email)) data.email = row.email!.trim();
    if (nonEmpty(row.indirizzo)) data.indirizzo = row.indirizzo!.trim();
    if (nonEmpty(row.categoria)) data.categoria = row.categoria!.trim();
    if (nonEmpty(row.note)) data.note_titolare = row.note!.trim();
    if (nonEmpty(row.consenso_whatsapp)) data.consenso_whatsapp = parseBool(row.consenso_whatsapp);

    if (existing) {
      // Update only non-empty fields
      if (Object.keys(data).length === 0) {
        result.skipped++;
        continue;
      }
      const { error } = await supabase
        .from("clienti")
        .update(data)
        .eq("arca_id", arcaId);
      if (error) {
        result.errors.push({ row: rowNum, field: "*", message: error.message });
      } else {
        result.updated++;
      }
    } else {
      // Insert — nome and telefono are required
      data.arca_id = arcaId;
      if (!data.nome) {
        result.errors.push({ row: rowNum, field: "nome", message: "nome obbligatorio per nuovo cliente" });
        continue;
      }
      if (!data.telefono) {
        result.errors.push({ row: rowNum, field: "telefono", message: "telefono obbligatorio per nuovo cliente" });
        continue;
      }
      const { error } = await supabase.from("clienti").insert(data);
      if (error) {
        result.errors.push({ row: rowNum, field: "*", message: error.message });
      } else {
        result.imported++;
      }
    }
  }

  return result;
}

async function importProdotti(rows: Record<string, string>[]): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, updated: 0, skipped: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;

    const arcaArticoloId = row.arca_articolo_id?.trim();
    if (!arcaArticoloId) {
      result.errors.push({ row: rowNum, field: "arca_articolo_id", message: "arca_articolo_id mancante" });
      continue;
    }

    const { data: existing } = await supabase
      .from("prodotti")
      .select("id")
      .eq("arca_articolo_id", arcaArticoloId)
      .maybeSingle();

    const data: Record<string, unknown> = {};
    if (nonEmpty(row.nome)) data.nome = row.nome!.trim();
    if (nonEmpty(row.categoria)) data.categoria = row.categoria!.trim();
    if (nonEmpty(row.prezzo_listino)) {
      const prezzo = parseNumber(row.prezzo_listino);
      if (prezzo === null) {
        result.errors.push({ row: rowNum, field: "prezzo_listino", message: "prezzo_listino non valido" });
        continue;
      }
      data.prezzo_listino = prezzo;
    }
    if (nonEmpty(row.unita_misura)) data.unita_misura = row.unita_misura!.trim();
    if (nonEmpty(row.fornitore)) data.fornitore = row.fornitore!.trim();
    if (nonEmpty(row.disponibile)) data.disponibile = parseBool(row.disponibile);

    if (existing) {
      if (Object.keys(data).length === 0) {
        result.skipped++;
        continue;
      }
      const { error } = await supabase
        .from("prodotti")
        .update(data)
        .eq("arca_articolo_id", arcaArticoloId);
      if (error) {
        result.errors.push({ row: rowNum, field: "*", message: error.message });
      } else {
        result.updated++;
      }
    } else {
      data.arca_articolo_id = arcaArticoloId;
      if (!data.nome) {
        result.errors.push({ row: rowNum, field: "nome", message: "nome obbligatorio per nuovo prodotto" });
        continue;
      }
      const { error } = await supabase.from("prodotti").insert(data);
      if (error) {
        result.errors.push({ row: rowNum, field: "*", message: error.message });
      } else {
        result.imported++;
      }
    }
  }

  return result;
}

async function importStoricoAcquisti(rows: Record<string, string>[]): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, updated: 0, skipped: 0, errors: [] };

  // Pre-fetch lookup maps to avoid N+1 queries
  const { data: allClienti } = await supabase.from("clienti").select("id, arca_id");
  const { data: allProdotti } = await supabase.from("prodotti").select("id, arca_articolo_id");

  const clientiMap = new Map<string, string>();
  for (const c of allClienti || []) {
    if (c.arca_id) clientiMap.set(c.arca_id, c.id);
  }

  const prodottiMap = new Map<string, string>();
  for (const p of allProdotti || []) {
    if (p.arca_articolo_id) prodottiMap.set(p.arca_articolo_id, p.id);
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;

    // Lookup cliente
    const arcaIdCliente = row.arca_id_cliente?.trim();
    if (!arcaIdCliente) {
      result.errors.push({ row: rowNum, field: "arca_id_cliente", message: "arca_id_cliente mancante" });
      continue;
    }
    const clienteId = clientiMap.get(arcaIdCliente);
    if (!clienteId) {
      result.errors.push({ row: rowNum, field: "arca_id_cliente", message: `Cliente con arca_id "${arcaIdCliente}" non trovato` });
      continue;
    }

    // Lookup prodotto
    const arcaArticoloIdProdotto = row.arca_articolo_id_prodotto?.trim();
    if (!arcaArticoloIdProdotto) {
      result.errors.push({ row: rowNum, field: "arca_articolo_id_prodotto", message: "arca_articolo_id_prodotto mancante" });
      continue;
    }
    const prodottoId = prodottiMap.get(arcaArticoloIdProdotto);
    if (!prodottoId) {
      result.errors.push({ row: rowNum, field: "arca_articolo_id_prodotto", message: `Prodotto con arca_articolo_id "${arcaArticoloIdProdotto}" non trovato` });
      continue;
    }

    // Parse data_acquisto
    const dataAcquisto = parseDate(row.data_acquisto);
    if (!dataAcquisto) {
      result.errors.push({ row: rowNum, field: "data_acquisto", message: "data_acquisto mancante o formato non valido (atteso DD/MM/YYYY)" });
      continue;
    }

    // Parse numeric fields
    const quantita = parseNumber(row.quantita);
    if (quantita === null) {
      result.errors.push({ row: rowNum, field: "quantita", message: "quantita mancante o non valida" });
      continue;
    }

    const prezzoUnitario = parseNumber(row.prezzo_unitario);
    let importoTotale = parseNumber(row.importo_totale);

    // Calculate importo_totale if empty
    if (importoTotale === null && prezzoUnitario !== null) {
      importoTotale = Math.round(quantita * prezzoUnitario * 100) / 100;
    }

    // Deduplicate: skip if same combination already exists
    const { data: dup } = await supabase
      .from("storico_acquisti")
      .select("id")
      .eq("cliente_id", clienteId)
      .eq("prodotto_id", prodottoId)
      .eq("data_acquisto", dataAcquisto)
      .eq("quantita", quantita)
      .maybeSingle();

    if (dup) {
      result.skipped++;
      continue;
    }

    const record: Record<string, unknown> = {
      cliente_id: clienteId,
      prodotto_id: prodottoId,
      data_acquisto: dataAcquisto,
      quantita,
    };
    if (prezzoUnitario !== null) record.prezzo_unitario = prezzoUnitario;
    if (importoTotale !== null) record.importo_totale = importoTotale;

    const { error } = await supabase.from("storico_acquisti").insert(record);
    if (error) {
      result.errors.push({ row: rowNum, field: "*", message: error.message });
    } else {
      result.imported++;
    }
  }

  return result;
}

// --- Main handler ---

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Metodo non supportato" }, 405);
  }

  try {
    const { type, rows } = await req.json();

    if (!type || !rows || !Array.isArray(rows)) {
      return jsonResponse({ error: "Body deve contenere 'type' e 'rows' (array)" }, 400);
    }

    if (rows.length === 0) {
      return jsonResponse({ imported: 0, updated: 0, skipped: 0, errors: [] });
    }

    let result: ImportResult;

    switch (type) {
      case "clienti":
        result = await importClienti(rows);
        break;
      case "prodotti":
        result = await importProdotti(rows);
        break;
      case "storico_acquisti":
        result = await importStoricoAcquisti(rows);
        break;
      default:
        return jsonResponse({ error: `Tipo non supportato: "${type}". Valori ammessi: clienti, prodotti, storico_acquisti` }, 400);
    }

    return jsonResponse(result);
  } catch (err) {
    console.error("[import-csv] Error:", err);
    return jsonResponse({ error: err.message || "Errore interno" }, 500);
  }
});
