from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from functools import lru_cache
import os, requests

app = FastAPI(title="ApexNurse Webservice")

# ======================================================
# CONFIGURATION
# ======================================================
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")

SUPABASE_REST_URL = f"{SUPABASE_URL}/rest/v1"
HEADERS = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
}

# ======================================================
# CORS FIX (Render compatible)
# ======================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://apexnurse.onrender.com",
        "https://apexnurses.onrender.com",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*",  # fallback
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================================================
# BASIC ROUTE
# ======================================================
@app.get("/")
def root():
    return {"message": "✅ ApexNurse backend running successfully."}

# ======================================================
# FETCH PAPERS
# ======================================================
@app.get("/papers")
def list_papers():
    """Return all distinct papers in Supabase."""
    url = f"{SUPABASE_REST_URL}/questions?select=paper"
    res = requests.get(url, headers=HEADERS)
    if res.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch papers")

    papers = sorted({q.get("paper") for q in res.json() if q.get("paper")})
    return papers

# ======================================================
# FETCH SERIES FOR A PAPER
# ======================================================
@app.get("/series")
def list_series(paper: str):
    """Return all distinct series for a paper (flexible matching)."""
    if not paper:
        raise HTTPException(status_code=400, detail="Missing paper name")

    query = f"select=series&paper=ilike.%25{paper}%25"
    res = requests.get(f"{SUPABASE_REST_URL}/questions?{query}", headers=HEADERS)

    if res.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch series")

    data = res.json()
    s = sorted({q.get("series") for q in data if q.get("series")})
    return s

# ======================================================
# FETCH QUESTIONS (Flexible matching)
# ======================================================
@app.get("/questions")
def get_questions(paper: str, series: str = ""):
    """Return all questions for a given paper (and optional series)."""
    if not paper:
        raise HTTPException(status_code=400, detail="Missing paper parameter")

    paper = paper.strip()
    series_list = [s.strip() for s in series.split(";") if s.strip()]
    all_questions = []

    # If no series specified, fetch all for the paper
    if not series_list:
        query = f"select=*&paper=ilike.%25{paper}%25&limit=9999"
        res = requests.get(f"{SUPABASE_REST_URL}/questions?{query}", headers=HEADERS)
        if res.status_code == 200:
            all_questions.extend(res.json())
    else:
        for s in series_list:
            # Make flexible search
            query = (
                f"select=*&paper=ilike.%25{paper}%25&series=ilike.%25{s}%25&limit=9999"
            )
            res = requests.get(f"{SUPABASE_REST_URL}/questions?{query}", headers=HEADERS)
            if res.status_code == 200:
                data = res.json()
                if data:
                    all_questions.extend(data)

    if not all_questions:
        print(f"[WARN] No questions found for paper='{paper}', series='{series}'")
        try:
            sample = requests.get(
                f"{SUPABASE_REST_URL}/questions?select=paper,series,id&limit=5",
                headers=HEADERS,
            ).json()
            print("ℹ️ Example rows in DB:", sample)
        except Exception:
            pass

    return all_questions

# ======================================================
# CACHED FETCH
# ======================================================
@lru_cache(maxsize=64)
def cached_fetch(paper, series):
    data = get_questions(paper, series)
    return tuple([tuple(q.items()) for q in data])

@app.get("/cached_questions")
def cached_questions(paper: str, series: str = ""):
    """Serve cached questions."""
    data = cached_fetch(paper, series)
    return [dict(d) for d in data]

# ======================================================
# SAVE PERFORMANCE
# ======================================================
@app.post("/performance")
def save_performance(payload: dict):
    """
    Save user performance summary to Supabase.
    Expected payload:
    {
        "user_id": "123",
        "paper": "Paper1",
        "series": "Series 1",
        "score": 45,
        "total": 60
    }
    """
    if not payload.get("user_id"):
        raise HTTPException(status_code=400, detail="Missing user_id")

    url = f"{SUPABASE_REST_URL}/performance"
    res = requests.post(url, headers=HEADERS, json=payload)

    if res.status_code not in (200, 201):
        raise HTTPException(status_code=res.status_code, detail=res.text)

    return {"status": "ok", "message": "Performance saved successfully"}

# ======================================================
# GET PERFORMANCE HISTORY
# ======================================================
@app.get("/performance_history")
def performance_history(user_id: str):
    """Get performance records for a given user."""
    url = f"{SUPABASE_REST_URL}/performance?select=*&user_id=eq.{user_id}"
    res = requests.get(url, headers=HEADERS)

    if res.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch performance data")

    return res.json()

# ======================================================
# HEALTH CHECK
# ======================================================
@app.get("/health")
def health():
    return {"status": "ok"}
