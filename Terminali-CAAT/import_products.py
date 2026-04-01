"""
Magazzino QR — Script di importazione prodotti da Excel a Supabase
Esegui con: python3 import_products.py

Requisiti: pip install pandas openpyxl supabase
"""

import pandas as pd
import json
import uuid
import os
from supabase import create_client

# ============================================================
# CONFIGURAZIONE — modifica questi valori
# ============================================================
EXCEL_FILE = "Copia di bv (1).xlsx"  # percorso del file Excel

# Prende le credenziali dal .env.local se esiste, altrimenti metti qui
SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL", "https://qkqpfvidjtanhnhfixjg.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "INSERISCI_QUI_LA_TUA_SERVICE_KEY")
# ============================================================

def load_env_file():
    """Prova a leggere il .env.local per le credenziali Supabase"""
    for env_file in [".env.local", ".env"]:
        if os.path.exists(env_file):
            with open(env_file) as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        key, val = line.split("=", 1)
                        os.environ[key.strip()] = val.strip()
            print(f"✓ Credenziali caricate da {env_file}")
            return True
    return False

def main():
    load_env_file()
    
    url = os.environ.get("VITE_SUPABASE_URL", SUPABASE_URL)
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", SUPABASE_KEY)
    
    if "INSERISCI_QUI" in key:
        print("✗ Errore: inserisci la SUPABASE_ANON_KEY nello script o nel .env.local")
        return
    
    print(f"→ Connessione a Supabase: {url}")
    supabase = create_client(url, key)
    
    # --- Leggi Excel ---
    print(f"→ Lettura file: {EXCEL_FILE}")
    df = pd.read_excel(EXCEL_FILE)
    print(f"  Righe totali nel file: {len(df)}")
    
    # --- Pulizia dati ---
    # Rimuovi righe senza codice (righe vuote)
    df = df[df["Unnamed: 0"].notna()].copy()
    print(f"  Righe dopo rimozione vuote: {len(df)}")
    
    # Fix SKU duplicati: aggiungi -B al secondo
    dupes = df[df.duplicated("Unnamed: 0", keep="first")]
    for idx in dupes.index:
        df.at[idx, "Unnamed: 0"] = str(df.at[idx, "Unnamed: 0"]) + "-B"
    if len(dupes) > 0:
        print(f"  SKU duplicati rinominati: {len(dupes)}")
    
    # --- Prepara i record ---
    records = []
    for _, row in df.iterrows():
        sku = str(row["Unnamed: 0"]).strip()
        name = str(row["Unnamed: 1"]).strip() if pd.notna(row["Unnamed: 1"]) else sku
        
        # Categoria
        category = None
        if pd.notna(row.get("GRUPPO ")):
            category = str(row["GRUPPO "]).strip()
        
        # Unità di misura (normalizza)
        unit = "pz"
        if pd.notna(row.get("UNITà DI MISURA")):
            raw_unit = str(row["UNITà DI MISURA"]).strip().lower()
            unit = raw_unit if raw_unit in ["kg", "pz", "lt"] else "pz"
        
        # Prezzo (0 se mancante)
        price = 0.0
        if pd.notna(row.get("PREZZO")):
            try:
                price = float(row["PREZZO"])
            except (ValueError, TypeError):
                price = 0.0
        
        # IVA
        vat_rate = 22.0
        if pd.notna(row.get("IVA")):
            try:
                vat_rate = float(row["IVA"])
            except (ValueError, TypeError):
                vat_rate = 22.0

        # Attivo = inverso di OBSOLETO
        is_active = True
        if pd.notna(row.get("OBSOLETO")):
            is_active = not bool(row["OBSOLETO"])
        
        # Genera UUID
        product_id = str(uuid.uuid4())
        
        # QR data
        qr_data = json.dumps({
            "app": "magazzino-qr",
            "sku": sku,
            "id": product_id
        })
        
        records.append({
            "id": product_id,
            "sku": sku,
            "name": name,
            "category": category,
            "unit": unit,
            "price": price,
            "cost_price": None,
            "supplier": None,
            "description": None,
            "barcode_data": qr_data,
            "vat_rate": vat_rate,
            "is_active": is_active,
        })
    
    print(f"  Prodotti da caricare: {len(records)}")
    print(f"    - Attivi: {sum(1 for r in records if r['is_active'])}")
    print(f"    - Obsoleti: {sum(1 for r in records if not r['is_active'])}")
    print(f"    - Attivi senza prezzo: {sum(1 for r in records if r['is_active'] and r['price'] == 0.0)}")
    
    # --- Caricamento a batch ---
    BATCH_SIZE = 100
    success = 0
    errors = 0
    
    print(f"\n→ Caricamento in corso (batch da {BATCH_SIZE})...")
    
    for i in range(0, len(records), BATCH_SIZE):
        batch = records[i:i + BATCH_SIZE]
        try:
            result = supabase.table("products").upsert(
                batch,
                on_conflict="sku"
            ).execute()
            success += len(batch)
            pct = int((i + len(batch)) / len(records) * 100)
            print(f"  [{pct:3d}%] Caricati {success}/{len(records)}")
        except Exception as e:
            errors += len(batch)
            print(f"  ✗ Errore batch {i}-{i+len(batch)}: {e}")
    
    # --- Riepilogo ---
    print(f"\n{'='*50}")
    print(f"✓ IMPORTAZIONE COMPLETATA")
    print(f"  Successo: {success}")
    print(f"  Errori:   {errors}")
    print(f"  Totale:   {len(records)}")
    print(f"{'='*50}")

if __name__ == "__main__":
    main()
