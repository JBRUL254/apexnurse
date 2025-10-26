from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os, requests
from functools import lru_cache

app = FastAPI(title="ApexNurse Webservice")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("❌ Missing SUPABASE environment variables")

SUPABASE_REST_URL = f"{SUPABASE_URL}/rest/v1"
HEADERS = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ok", "message": "✅ ApexNurse backend live"}

@app.get("/papers")
def get_papers():
    url = f"{SUPABASE_REST_URL}/questions?select=paper"
    r = requests.get(url, headers=HEADERS)
    papers = sorted({q["paper"] for q in r.json() if q.get("paper")})
    return papers

@app.get("/series")
def get_series(paper: str):
    url = f"{SUPABASE_REST_URL}/questions?select=series&paper=ilike.%25{paper}%25"
    r = requests.get(url, headers=HEADERS)
    series = sorted({q["series"] for q in r.json() if q.get("series")})
    return series

@app.get("/questions")
def get_questions(paper: str, series: str):
    """Fetch questions limited by type"""
    query = f"{SUPABASE_REST_URL}/questions?select=*&paper=ilike.%25{paper}%25&series=ilike.%25{series}%25"
    r = requests.get(query, headers=HEADERS)
    data = r.json()

    # auto-limit: quicktest = 60, others = 120
    limit = 60 if "quicktest" in series.lower() else 120
    data = data[:limit]

    return data

@app.post("/performance")
def save_performance(payload: dict):
    """Save test result"""
    url = f"{SUPABASE_REST_URL}/performance"
    r = requests.post(url, headers=HEADERS, json=payload)
    if r.status_code not in (200, 201):
        raise HTTPException(status_code=r.status_code, detail=r.text)
    return {"status": "saved"}

@app.get("/performance")
def get_performance(user_id: str):
    """Get all past user performance"""
    url = f"{SUPABASE_REST_URL}/performance?user_id=eq.{user_id}&select=*&order=created_at.desc"
    r = requests.get(url, headers=HEADERS)
    if r.status_code != 200:
        raise HTTPException(status_code=r.status_code, detail="Cannot fetch performance")
    return r.json()
