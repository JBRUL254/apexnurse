from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from functools import lru_cache
import os, requests

app = FastAPI(title="ApexNurse Webservice")

# ==============================
# CONFIGURATION
# ==============================
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")

SUPABASE_REST_URL = f"{SUPABASE_URL}/rest/v1"
HEADERS = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
}

# ==============================
# MIDDLEWARE - FIXED CORS
# ==============================
origins = [
    "https://apexnurse.onrender.com",  # your Render frontend
    "http://localhost:5173",           # dev testing
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
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
    """List distinct papers in Supabase"""
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
def list_series(paper: str):
    """List distinct series for a given paper (supports quicktests & revisions)"""
    if not paper:
        raise HTTPException(status_code=400, detail="Missing paper name")

    # Flexible match (case insensitive, partial match)
    url = f"{SUPABASE_REST_URL}/questions?select=series&paper=ilike.%25{paper}%25"
    res = requests.get(url, headers=HEADERS)

    if res.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch series")

    series_raw = {q.get("series") for q in res.json() if q.get("series")}
    series_list = sorted(series_raw)

    # Organize into two folders (Series vs Quicktests)
    revision_series = [s for s in series_list if "revision" in s.lower()]
    quicktests = [s for s in series_list if "quicktest" in s.lower()]

    return {
        "revision_series": revision_series,
        "quicktests": quicktests
    }

# ==============================
# MAIN QUESTION FETCH
# ==============================
@app.get("/questions")
def get_questions(paper: str, series: str = Query(None)):
    """
    Fetch up to 120 questions for series, or 60 for quicktests.
    Handles flexible matching.
    """
    if not paper:
        raise HTTPException(status_code=400, detail="Missing paper parameter")

    paper = paper.strip()
    limit = 120
    all_questions = []

    # Support multiple series separated by ";"
    if series:
        series_list = [s.strip() for s in series.split(";") if s.strip()]
    else:
        series_list = []

    if not series_list:
        query = f"select=*&paper=ilike.%25{paper}%25&limit={limit}"
        res = requests.get(f"{SUPABASE_REST_URL}/questions?{query}", headers=HEADERS)
        if res.status_code == 200:
            all_questions.extend(res.json())
    else:
        for s in series_list:
            s_clean = s.replace(" ", "%")
            # Quicktests limited to 60 questions
            series_limit = 60 if "quicktest" in s.lower() else 120
            query = f"select=*&paper=ilike.%25{paper}%25&series=ilike.%25{s_clean}%25&limit={series_limit}"
            res = requests.get(f"{SUPABASE_REST_URL}/questions?{query}", headers=HEADERS)
            if res.status_code == 200:
                data = res.json()
                if data:
                    all_questions.extend(data)

    if not all_questions:
        print(f"[WARN] No questions found for '{paper}', '{series}'")
        try:
            sample = requests.get(
                f"{SUPABASE_REST_URL}/questions?select=paper,series,id&limit=10",
                headers=HEADERS
            ).json()
            print("ℹ️ Example rows in DB:", sample)
        except Exception:
            pass

    return all_questions

# ==============================
# CACHED VERSION (Optional)
# ==============================
@lru_cache(maxsize=64)
def cached_fetch(paper, series):
    data = get_questions(paper, series)
    return tuple([tuple(q.items()) for q in data])

@app.get("/cached_questions")
def cached_questions(paper: str, series: str = ""):
    """Serve questions with caching"""
    data = cached_fetch(paper, series)
    return [dict(d) for d in data]

# ==============================
# PERFORMANCE SAVE & HISTORY
# ==============================
@app.post("/performance")
def save_performance(payload: dict):
    """
    Save user performance summary to Supabase
    Expected: {user_id, paper, series, score, total}
    """
    if not payload.get("user_id"):
        raise HTTPException(status_code=400, detail="Missing user_id")

    url = f"{SUPABASE_REST_URL}/performance"
    res = requests.post(url, headers=HEADERS, json=payload)

    if res.status_code not in (200, 201):
        raise HTTPException(status_code=res.status_code, detail=res.text)

    return {"status": "ok"}

@app.get("/performance/history")
def get_history(user_id: str):
    """Get all saved performance results for a user"""
    url = f"{SUPABASE_REST_URL}/performance?select=*&user_id=eq.{user_id}&order=id.desc"
    res = requests.get(url, headers=HEADERS)

    if res.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch history")

    return res.json()

# ==============================
# HEALTHCHECK
# ==============================
@app.get("/health")
def health():
    return {"status": "ok"}
