"""
utils.py — Utility comuni per gli script di esecuzione
Livello 3: Esecuzione

Funzioni riutilizzabili per logging, gestione .env, file I/O e retry.
"""

import os
import json
import time
import logging
from pathlib import Path
from functools import wraps
from dotenv import load_dotenv

# ── Setup .env ──────────────────────────────────────────────────────────────
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / ".env")

# ── Logger standard ─────────────────────────────────────────────────────────
def get_logger(name: str) -> logging.Logger:
    """Restituisce un logger configurato con formato consistente."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    return logging.getLogger(name)


# ── Variabili d'ambiente ─────────────────────────────────────────────────────
def require_env(key: str) -> str:
    """
    Legge una variabile d'ambiente obbligatoria.
    Lancia un errore chiaro se mancante, invece di fallire silenziosamente.
    """
    value = os.getenv(key)
    if not value:
        raise EnvironmentError(
            f"Variabile d'ambiente '{key}' non trovata. "
            f"Aggiungila al file .env nella root del progetto."
        )
    return value


# ── File I/O ─────────────────────────────────────────────────────────────────
def read_json(path: str | Path) -> dict | list:
    """Legge un file JSON e restituisce il contenuto."""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def write_json(data: dict | list, path: str | Path, indent: int = 2) -> None:
    """Scrive dati in un file JSON, creando le directory se necessario."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=indent)


def ensure_tmp() -> Path:
    """Assicura che la directory .tmp/ esista e la restituisce."""
    tmp = ROOT_DIR / ".tmp"
    tmp.mkdir(exist_ok=True)
    return tmp


# ── Retry con backoff ────────────────────────────────────────────────────────
def retry(max_attempts: int = 3, delay_seconds: float = 2.0, backoff: float = 2.0):
    """
    Decorator per riprovare automaticamente una funzione in caso di eccezione.

    Args:
        max_attempts: numero massimo di tentativi
        delay_seconds: attesa iniziale tra tentativi (secondi)
        backoff: moltiplicatore del delay ad ogni tentativo
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            logger = get_logger(func.__name__)
            delay = delay_seconds
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts:
                        logger.error(f"Fallito dopo {max_attempts} tentativi: {e}")
                        raise
                    logger.warning(
                        f"Tentativo {attempt}/{max_attempts} fallito: {e}. "
                        f"Riprovo tra {delay:.1f}s..."
                    )
                    time.sleep(delay)
                    delay *= backoff
        return wrapper
    return decorator
