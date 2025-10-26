from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from functools import lru_cache
import os, requests

app = FastAPI(title="ApexNurse Webservice")

# ==============================
# CONFIG
# ==============================
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")

SUPABASE_REST_URL = f"{SUPABASE_URL}/rest/v1"
HEADERS = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
}

# ==============================
# MIDDLEWARE
# ==============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# BASIC ROUTE
# ==============================
@app.get("/")
def root():
    return {"message": "✅ ApexNurse backend running successfully."}

# ==============================
# FETCH PAPERS
# ==============================
@app.get("/papers")
def list_papers():
    """Return all distinct papers."""
    url = f"{SUPABASE_REST_URL}/questions?select=paper"
    res = requests.get(url, headers=HEADERS)
    if res.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch papers")
    papers = sorted({q.get("paper") for q in res.json() if q.get("paper")})
    return papers

# ==============================
# FETCH SERIES FOR PAPER
# ==============================
@app.get("/series")
def list_series(paper: str, qtype: str = "series"):
    """
    Return all distinct series or quicktests for a paper.
    qtype: "series" or "quicktest"
    """
    if not paper:
        raise HTTPException(status_code=400, detail="Missing paper name")

    url = f"{SUPABASE_REST_URL}/questions?select=series,question&paper=ilike.%25{paper}%25"
    res = requests.get(url, headers=HEADERS)
    if res.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch series")

    all_series = {q.get("series") for q in res.json() if q.get("series")}
    if qtype == "quicktest":
        filtered = [s for s in all_series if "quicktest" in s.lower()]
    else:
        filtered = [s for s in all_series if "series" in s.lower()]

    return sorted(filtered)

# ==============================
# FETCH QUESTIONS (LIMITED)
# ==============================
@app.get("/questions")
def get_questions(paper: str, series: str = "", qtype: str = "series"):
    """
    Fetch up to 120 questions per series, or 60 for quicktests.
    """
    if not paper:
        raise HTTPException(status_code=400, detail="Missing paper")

    limit = 120 if qtype == "series" else 60
    all_questions = []

    if not series:
        raise HTTPException(status_code=400, detail="Missing series name")

    query = f"select=*&paper=ilike.%25{paper}%25&series=ilike.%25{series}%25&limit={limit}"
    res = requests.get(f"{SUPABASE_REST_URL}/questions?{query}", headers=HEADERS)
    if res.status_code == 200:
        all_questions.extend(res.json())
    else:
        raise HTTPException(status_code=500, detail=f"Failed to fetch questions for {series}")

    if not all_questions:
        raise HTTPException(status_code=404, detail="No questions found")

    return all_questions

# ==============================
# PERFORMANCE
# ==============================
@app.post("/performance")
def save_performance(payload: dict):
    """Save user performance summary."""
    url = f"{SUPABASE_REST_URL}/performance"
    res = requests.post(url, headers=HEADERS, json=payload)
    if res.status_code not in (200, 201):
        raise HTTPException(status_code=res.status_code, detail=res.text)
    return {"status": "ok"}

@app.get("/performance")
def get_performance(user_id: str):
    """Get user's performance history."""
    url = f"{SUPABASE_REST_URL}/performance?select=*&user_id=eq.{user_id}"
    res = requests.get(url, headers=HEADERS)
    if res.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to load performance")
    return res.json()

# ==============================
# HEALTHCHECK
# ==============================
@app.get("/health")
def health():
    return {"status": "ok"}
