"use client";
import { useState, useRef, useCallback, DragEvent, ChangeEvent } from "react";
import * as XLSX from "xlsx";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

/* ───────────────── CSV helpers ───────────────── */

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function detectSeparator(firstLine: string): string {
  return firstLine.includes(";") ? ";" : ",";
}

function parseCSVLine(line: string, sep: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === sep) {
        fields.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const clean = stripBom(text);
  const lines = clean.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length === 0) return { headers: [], rows: [] };
  const sep = detectSeparator(lines[0]);
  const headers = parseCSVLine(lines[0], sep).map((h) => h.toLowerCase().trim());
  const rows = lines.slice(1).map((line) => {
    const values = parseCSVLine(line, sep);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] ?? "";
    });
    return obj;
  });
  return { headers, rows };
}

function parseXLSX(buffer: ArrayBuffer): { headers: string[]; rows: Record<string, string>[] } {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
  if (json.length === 0) return { headers: [], rows: [] };
  const headers = Object.keys(json[0]).map((h) => h.toLowerCase().trim());
  const rows = json.map((row) => {
    const obj: Record<string, string> = {};
    Object.entries(row).forEach(([key, val]) => {
      obj[key.toLowerCase().trim()] = String(val ?? "");
    });
    return obj;
  });
  return { headers, rows };
}

function isXLSX(file: File): boolean {
  const ext = file.name.toLowerCase();
  return ext.endsWith(".xlsx") || ext.endsWith(".xls");
}

function convertDate(val: string): string {
  const m = val.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return val;
}

function downloadCSV(headers: string[], filename: string) {
  const blob = new Blob([headers.join(",") + "\n"], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ───────────────── Types ───────────────── */

type ImportReport = { importati: number; aggiornati: number; errori: number };
type ValidationResult = { valid: Record<string, string>[]; errors: { row: number; fields: string[] }[]; warnings?: { row: number; fields: string[] }[] };

const CATEGORIE_CLIENTI = ["ristorante", "pizzeria", "bar", "trattoria", "hotel", "catering", "rosticceria", "gastronomia", "altro"];

/* ───────────────── Arca Prodotti Mapper ───────────────── */

function mapArcaProdotti(rawHeaders: string[], rawRows: Record<string, string>[]): { headers: string[]; rows: Record<string, string>[] } {
  // Arca columns can come with various header names or positionally (A-Q)
  // We detect by known header patterns or fall back to positional mapping
  const hLower = rawHeaders.map((h) => h.toLowerCase().trim());

  // Try to find columns by header name first
  const colMap: Record<string, number> = {};

  // codart / arca_articolo_id → column C
  let idx = hLower.findIndex((h) => h === "codart" || h === "cod.art" || h === "codice" || h === "arca_articolo_id" || h === "cod art");
  if (idx >= 0) colMap.codart = idx;
  else if (rawHeaders.length >= 3) colMap.codart = 2; // column C

  // desc / nome → column D
  idx = hLower.findIndex((h) => h === "desc" || h === "descrizione" || h === "nome" || h === "description");
  if (idx >= 0) colMap.desc = idx;
  else if (rawHeaders.length >= 4) colMap.desc = 3;

  // FAMIGLIA / categoria → column F
  idx = hLower.findIndex((h) => h === "famiglia" || h === "categoria" || h === "family");
  if (idx >= 0) colMap.famiglia = idx;
  else if (rawHeaders.length >= 6) colMap.famiglia = 5;

  // UNITA DI MISURA → column H
  idx = hLower.findIndex((h) => h.includes("unita") || h.includes("misura") || h === "um" || h === "u.m.");
  if (idx >= 0) colMap.um = idx;
  else if (rawHeaders.length >= 8) colMap.um = 7;

  // PREZZO (listino) → column K (index 10)
  // Find the LAST column named "prezzo" or "PREZZO" (column K, not column I)
  const prezzoIndices = hLower.map((h, i) => (h === "prezzo" || h === "prezzo listino" || h === "prz.listino") ? i : -1).filter((i) => i >= 0);
  if (prezzoIndices.length > 0) colMap.prezzo = prezzoIndices[prezzoIndices.length - 1]; // last one = column K
  else if (rawHeaders.length >= 11) colMap.prezzo = 10;

  // Fornitore → column A
  idx = hLower.findIndex((h) => h === "fornitore" || h === "supplier" || h === "forn.");
  if (idx >= 0) colMap.fornitore = idx;
  else colMap.fornitore = 0;

  const mappedHeaders = ["arca_articolo_id", "nome", "categoria", "prezzo_listino", "unita_misura", "fornitore"];
  const mappedRows: Record<string, string>[] = [];

  for (const raw of rawRows) {
    const values = Object.values(raw);
    const codart = (values[colMap.codart] ?? "").trim();

    // Skip rows with empty codart
    if (!codart) continue;

    // Parse prezzo: remove €, convert comma to dot
    let prezzo = (values[colMap.prezzo] ?? "").trim();
    prezzo = prezzo.replace(/€/g, "").replace(/\s/g, "").trim();
    if (prezzo && prezzo.includes(",")) {
      prezzo = prezzo.replace(/\./g, "").replace(",", "."); // 1.234,56 → 1234.56
    }

    // Normalize unita_misura
    let um = (values[colMap.um] ?? "").trim().toLowerCase();
    if (um === "kg" || um === "kilo") um = "kg";
    else if (um === "pz" || um === "pezzo" || um === "pezzi" || um === "nr") um = "pz";
    else if (um === "lt" || um === "litro" || um === "litri" || um === "l") um = "lt";
    else if (um === "ct" || um === "cartone" || um === "cartoni") um = "cartone";

    mappedRows.push({
      arca_articolo_id: codart,
      nome: (values[colMap.desc] ?? "").trim(),
      categoria: (values[colMap.famiglia] ?? "").trim().toLowerCase(),
      prezzo_listino: prezzo,
      unita_misura: um,
      fornitore: (values[colMap.fornitore] ?? "").trim(),
    });
  }

  return { headers: mappedHeaders, rows: mappedRows };
}

/* ───────────────── Validators ───────────────── */

function validateClienti(rows: Record<string, string>[]): ValidationResult {
  const valid: Record<string, string>[] = [];
  const errors: { row: number; fields: string[] }[] = [];
  rows.forEach((r, i) => {
    const errs: string[] = [];
    if (!r.nome?.trim()) errs.push("nome");
    if (r.telefono && !r.telefono.startsWith("+39") && !r.telefono.startsWith("39") && !r.telefono.startsWith("3")) errs.push("telefono (formato)");
    if (r.categoria && !CATEGORIE_CLIENTI.includes(r.categoria.toLowerCase().trim())) errs.push("categoria");
    if (errs.length > 0) errors.push({ row: i + 2, fields: errs });
    else valid.push(r);
  });
  return { valid, errors };
}

function validateProdotti(rows: Record<string, string>[]): ValidationResult {
  const valid: Record<string, string>[] = [];
  const errors: { row: number; fields: string[] }[] = [];
  const warnings: { row: number; fields: string[] }[] = [];
  rows.forEach((r, i) => {
    const errs: string[] = [];
    const warns: string[] = [];
    if (!r.nome?.trim()) errs.push("nome");
    if (r.prezzo_listino && isNaN(Number(r.prezzo_listino.replace(",", ".")))) errs.push("prezzo_listino (formato)");
    if (!r.prezzo_listino?.trim()) warns.push("prezzo_listino mancante");
    if (errs.length > 0) errors.push({ row: i + 2, fields: errs });
    else valid.push(r);
    if (warns.length > 0) warnings.push({ row: i + 2, fields: warns });
  });
  return { valid, errors, warnings };
}

function validateStorico(rows: Record<string, string>[]): ValidationResult {
  const valid: Record<string, string>[] = [];
  const errors: { row: number; fields: string[] }[] = [];
  rows.forEach((r, i) => {
    const errs: string[] = [];
    if (!r.arca_id_cliente?.trim()) errs.push("arca_id_cliente");
    if (!r.arca_articolo_id_prodotto?.trim()) errs.push("arca_articolo_id_prodotto");
    if (!r.data_acquisto?.trim()) errs.push("data_acquisto");
    else {
      const d = convertDate(r.data_acquisto);
      if (isNaN(Date.parse(d))) errs.push("data_acquisto (formato)");
    }
    if (!r.quantita?.trim()) errs.push("quantita");
    if (!r.prezzo_unitario?.trim()) errs.push("prezzo_unitario");
    if (errs.length > 0) errors.push({ row: i + 2, fields: errs });
    else {
      valid.push({ ...r, data_acquisto: convertDate(r.data_acquisto) });
    }
  });
  return { valid, errors };
}

/* ───────────────── Components ───────────────── */

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-blue-800 text-sm mb-6">
      <span className="font-medium">ℹ</span> {children}
    </div>
  );
}

function SectionCard({ number, title, description, children }: { number: number; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
      <div className="flex items-center gap-3 mb-1">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">{number}</span>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>
      <p className="text-slate-500 text-sm mb-4 ml-10">{description}</p>
      <div className="ml-10">{children}</div>
    </div>
  );
}

function DragDropArea({ onFile }: { onFile: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        dragging ? "border-blue-400 bg-blue-50" : "border-slate-300 bg-slate-50 hover:bg-slate-100"
      }`}
    >
      <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleChange} />
      <p className="text-slate-500 text-sm">Trascina qui il file CSV o Excel oppure <span className="text-blue-600 font-medium">clicca per sfogliare</span></p>
    </div>
  );
}

function PreviewTable({ headers, rows, errorRows }: { headers: string[]; rows: Record<string, string>[]; errorRows: Set<number> }) {
  const preview = rows.slice(0, 5);
  return (
    <div className="overflow-x-auto mt-4 rounded-lg border border-slate-200">
      <table className="w-full text-xs">
        <thead className="bg-slate-50 text-slate-500 uppercase">
          <tr>
            <th className="px-3 py-2 text-left">#</th>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {preview.map((row, i) => (
            <tr key={i} className={`border-t border-slate-100 ${errorRows.has(i + 2) ? "bg-red-50" : ""}`}>
              <td className="px-3 py-2 text-slate-400">{i + 2}</td>
              {headers.map((h) => (
                <td key={h} className="px-3 py-2 text-slate-700">{row[h]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ───────────────── CSV Import Section ───────────────── */

function CSVImportSection({
  type,
  templateHeaders,
  templateFilename,
  validate,
  mapRows,
}: {
  type: string;
  templateHeaders: string[];
  templateFilename: string;
  validate: (rows: Record<string, string>[]) => ValidationResult;
  mapRows?: (headers: string[], rows: Record<string, string>[]) => { headers: string[]; rows: Record<string, string>[] };
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setReport(null);
      setError(null);
      setFileName(file.name);

      const processParsed = (parsed: { headers: string[]; rows: Record<string, string>[] }) => {
        const mapped = mapRows ? mapRows(parsed.headers, parsed.rows) : parsed;
        setHeaders(mapped.headers);
        setRows(mapped.rows);
        setValidation(validate(mapped.rows));
      };

      if (isXLSX(file)) {
        const reader = new FileReader();
        reader.onload = () => processParsed(parseXLSX(reader.result as ArrayBuffer));
        reader.readAsArrayBuffer(file);
      } else {
        const reader = new FileReader();
        reader.onload = () => processParsed(parseCSV(reader.result as string));
        reader.readAsText(file, "utf-8");
      }
    },
    [validate, mapRows]
  );

  const handleImport = async () => {
    if (!validation) return;
    setImporting(true);
    setError(null);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/import-csv`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, rows: validation.valid }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `Errore ${res.status}`);
      }
      const data = await res.json();
      setReport(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setImporting(false);
    }
  };

  const errorRowSet = new Set(validation?.errors.map((e) => e.row) ?? []);

  return (
    <div>
      <button
        onClick={() => downloadCSV(templateHeaders, templateFilename)}
        className="border border-slate-300 text-slate-600 rounded-lg px-4 py-2 hover:bg-slate-50 text-sm mb-4"
      >
        Scarica template CSV
      </button>

      <DragDropArea onFile={handleFile} />

      {fileName && (
        <p className="text-sm text-slate-500 mt-2">
          File: <span className="font-medium text-slate-700">{fileName}</span>
        </p>
      )}

      {validation && (
        <>
          <PreviewTable headers={headers} rows={rows} errorRows={errorRowSet} />
          <div className="flex items-center gap-4 mt-3">
            <span className="text-sm text-green-600 font-medium">{validation.valid.length} righe valide</span>
            {validation.errors.length > 0 && (
              <span className="text-sm text-red-600 font-medium">{validation.errors.length} righe con errori</span>
            )}
          </div>
          {validation.errors.length > 0 && (
            <div className="mt-2 text-xs text-red-600 space-y-1">
              {validation.errors.slice(0, 10).map((e, i) => (
                <p key={i}>
                  Riga {e.row}: {e.fields.join(", ")}
                </p>
              ))}
              {validation.errors.length > 10 && <p>...e altri {validation.errors.length - 10} errori</p>}
            </div>
          )}
          {validation.warnings && validation.warnings.length > 0 && (
            <div className="mt-2 text-xs text-amber-600 space-y-1">
              {validation.warnings.slice(0, 5).map((w, i) => (
                <p key={i}>
                  Riga {w.row}: {w.fields.join(", ")} — verrà usato il prezzo dallo storico acquisti
                </p>
              ))}
              {validation.warnings.length > 5 && <p>...e altri {validation.warnings.length - 5} avvisi</p>}
            </div>
          )}
          <button
            onClick={handleImport}
            disabled={importing || validation.valid.length === 0}
            className="mt-4 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {importing ? "Importazione in corso..." : "Importa"}
          </button>
          {importing && (
            <div className="mt-2 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: "70%" }} />
            </div>
          )}
        </>
      )}

      {report && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800">
          {report.importati} importati, {report.aggiornati} aggiornati, {report.errori} errori
        </div>
      )}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">{error}</div>
      )}
    </div>
  );
}

/* ───────────────── Text Parse Section ───────────────── */

function TextParseSection({
  type,
  placeholder,
  saveLabel,
}: {
  type: string;
  placeholder: string;
  saveLabel: string;
}) {
  const [text, setText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<Record<string, string>[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParse = async () => {
    if (!text.trim()) return;
    setParsing(true);
    setError(null);
    setParsed(null);
    setSuccess(false);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/parse-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, action: "parse", text }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.items ? data.items : [data];
      setParsed(items);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setParsing(false);
    }
  };

  const handleFieldChange = (idx: number, key: string, value: string) => {
    setParsed((prev) => {
      if (!prev) return prev;
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: value };
      return copy;
    });
  };

  const handleSave = async () => {
    if (!parsed) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/parse-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, action: "save", data: parsed.length === 1 ? parsed[0] : parsed }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess(true);
      setParsed(null);
      setText("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
      />
      <button
        onClick={handleParse}
        disabled={parsing || !text.trim()}
        className="mt-2 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {parsing ? "Analisi in corso..." : "Analizza"}
      </button>

      {parsed && (
        <div className="mt-4 space-y-3">
          {parsed.map((item, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-4 grid grid-cols-2 gap-3">
              {Object.entries(item).map(([key, val]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-500 mb-1">{key}</label>
                  <input
                    value={val}
                    onChange={(e) => handleFieldChange(idx, key, e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          ))}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {saving ? "Salvataggio..." : saveLabel}
          </button>
        </div>
      )}

      {success && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-600">
          Salvato con successo!
        </div>
      )}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">{error}</div>
      )}
    </div>
  );
}

/* ───────────────── Arca Modal ───────────────── */

function ArcaModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Come esportare da Arca Evolution</h3>
        <div className="text-sm text-slate-600 space-y-3">
          <p><strong>Clienti:</strong> Vai su Anagrafiche &gt; Clienti &gt; Esporta. Seleziona i campi: codice, ragione sociale, telefono, email, indirizzo, categoria. Salva come CSV.</p>
          <p><strong>Prodotti:</strong> Vai su Magazzino &gt; Articoli &gt; Esporta. Seleziona: codice articolo, descrizione, categoria, prezzo listino, unita misura, fornitore. Salva come CSV.</p>
          <p><strong>Storico ordini:</strong> Vai su Vendite &gt; Documenti &gt; Esporta dettaglio righe. Filtra per il periodo desiderato. Salva come CSV.</p>
          <p className="text-slate-400 italic">Queste istruzioni sono indicative. Consulta la documentazione di Arca Evolution per il tuo caso specifico.</p>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full border border-slate-300 text-slate-600 rounded-lg px-4 py-2 hover:bg-slate-50 text-sm"
        >
          Chiudi
        </button>
      </div>
    </div>
  );
}

/* ───────────────── Main Page ───────────────── */

export default function ImportPage() {
  const [arcaModal, setArcaModal] = useState(false);
  const [clientiTab, setClientiTab] = useState<"csv" | "manuale">("csv");

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Import Dati</h1>
      <p className="text-slate-500 text-sm mb-6">Importa clienti, prodotti e storico acquisti da Arca Evolution</p>

      <InfoBox>
        Puoi caricare qualsiasi sezione singolarmente. L&apos;ordine 1&rarr;2&rarr;3&rarr;4 è consigliato solo per il primo import completo.
      </InfoBox>

      <button
        onClick={() => setArcaModal(true)}
        className="border border-slate-300 text-slate-600 rounded-lg px-4 py-2 hover:bg-slate-50 text-sm mb-6"
      >
        Come esportare da Arca Evolution
      </button>

      <ArcaModal open={arcaModal} onClose={() => setArcaModal(false)} />

      {/* Section 1: Clienti */}
      <SectionCard number={1} title="Clienti" description="Carica il file CSV con i dati dei clienti esportati da Arca.">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setClientiTab("csv")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              clientiTab === "csv" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Carica CSV
          </button>
          <button
            onClick={() => setClientiTab("manuale")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              clientiTab === "manuale" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Aggiungi manualmente
          </button>
        </div>

        {clientiTab === "csv" ? (
          <CSVImportSection
            type="clienti"
            templateHeaders={["arca_id", "nome", "telefono", "email", "indirizzo", "categoria", "note", "consenso_whatsapp"]}
            templateFilename="template_clienti.csv"
            validate={validateClienti}
          />
        ) : (
          <TextParseSection
            type="cliente"
            placeholder="Es: Pizzeria Da Mario, via Roma 15 Torino, telefono 3471234567, pizzeria"
            saveLabel="Salva cliente"
          />
        )}
      </SectionCard>

      {/* Section 2: Prodotti */}
      <SectionCard number={2} title="Prodotti" description="Carica il file Excel o CSV dei prodotti esportato da Arca Evolution. Le colonne vengono mappate automaticamente.">
        <CSVImportSection
          type="prodotti"
          templateHeaders={["Fornitore", "", "codart", "desc", "IVA", "FAMIGLIA", "SOTTOFAMIGLIA", "UNITA DI MISURA", "prezzo", "cod.form", "PREZZO", "prz.min", "Q.tà1", "prz.c1", "N", "P", "OBSOLETO"]}
          templateFilename="template_prodotti_arca.csv"
          validate={validateProdotti}
          mapRows={mapArcaProdotti}
        />
      </SectionCard>

      {/* Section 3: Storico Acquisti */}
      <SectionCard number={3} title="Storico Acquisti" description="Carica lo storico ordini. Richiede che clienti e prodotti siano già stati importati.">
        <CSVImportSection
          type="storico"
          templateHeaders={["arca_id_cliente", "arca_articolo_id_prodotto", "data_acquisto", "quantita", "prezzo_unitario", "importo_totale"]}
          templateFilename="template_storico_acquisti.csv"
          validate={validateStorico}
        />
      </SectionCard>

      {/* Section 4: Novità Prodotti */}
      <SectionCard
        number={4}
        title="Novità Prodotti"
        description="Descrivi i nuovi prodotti o quelli tornati disponibili."
      >
        <TextParseSection
          type="novita"
          placeholder={"Es: Burrata affumicata 12\u20AC/kg, nuova\nAcciughe del Cantabrico 38\u20AC/kg, tornate disponibili"}
          saveLabel="Salva novità"
        />
      </SectionCard>
    </div>
  );
}
