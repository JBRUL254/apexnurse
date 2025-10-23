import os
import requests

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise RuntimeError('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')

HEADERS = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
    'Content-Type': 'application/json'
}

def rest_get(table, params=None, select='*'):
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    p = params or {}
    p['select'] = select
    r = requests.get(url, headers=HEADERS, params=p, timeout=10)
    r.raise_for_status()
    return r.json()

def rest_post(table, payload):
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    r = requests.post(url, headers=HEADERS, json=payload, params={'return': 'representation'}, timeout=10)
    r.raise_for_status()
    return r.json()
