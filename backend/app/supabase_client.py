import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")

BASE_URL = f"{SUPABASE_URL}/rest/v1"
HEADERS = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
}

def get_table(table: str, filters: str = ""):
    """GET data from a Supabase table."""
    url = f"{BASE_URL}/{table}?{filters}&select=*"
    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    return resp.json()

def insert_row(table: str, data: dict):
    """POST a single row to a Supabase table."""
    url = f"{BASE_URL}/{table}"
    resp = requests.post(url, headers=HEADERS, json=data, timeout=15)
    resp.raise_for_status()
    return resp.json()
