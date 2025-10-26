from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from functools import lru_cache
import os, requests

app = FastAPI(title="ApexNurse Backend API")

# =========================================================
# CONFIGURATION
# =========================================================
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")

SUPABASE_REST_URL = f"{SUPABASE_URL}/rest/v1"
HEADERS = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
}

# =========================================================
# CORS MIDDLEWARE (✅ updated to include frontend)
# =========================================================
origins = [
    "https://apexnurse.onrender.com",
    "https://apexnurses.onrender.com",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# BASIC ROUTE
# =========================================================
@app.get("/")
def root():
    return {"message": "✅ ApexNurse backend running successfully."}

# =========================================================
# FETCH PAPERS
# =========================================================
@app.get("/papers")
def list_papers():
    """List distinct paper names available"""
    url = f"{SUPABASE_REST_URL}/questions?select=paper"
    res = requests.get(url, headers=HEADERS)

    if res.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch papers")

    data = res.json()
    papers = sorted({(q.get("paper") or "").strip() for q in data if q.get("paper")})
    if not papers:
        raise HTTPException(status_code=404, detail="No papers found")
    return papers

# =========================================================
# FETCH SERIES FOR PAPER
# =========================================================
@app.get("/series")
def list_series(paper: str):
    """List distinct series for a given paper (flexible search)"""
    if not paper:
        raise HTTPException(status_code=400, detail="Missing paper name")

    # Match papers like "Paper1 revision series 10" or "paper1_quicktest_19"
    url = f"{SUPABASE_REST_URL}/questions?select=series&paper=ilike.%25{paper}%25"
    res = requests.get(url, headers=HEADERS)

    if res.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch series")

    s = sorted({(q.get("series") or "").strip() for q in res.json() if q.get("series")})
    if not s:
        raise HTTPException(status_code=404, detail=f"No series found for {paper}")
    return s

# =========================================================
# FETCH QUESTIONS
# =========================================================
@app.get("/questions")
def get_questions(paper: str, series: str = ""):
    """Fetch questions for a paper or specific series — flexible search."""
    if not paper:
        raise HTTPException(status_code=400, detail="Missing paper parameter")

    paper = paper.strip()
    all_questions = []
    series_list = [s.strip() for s in series.split(";") if s.strip()]

    if not series_list:
        query = f"select=*&paper=ilike.%25{paper}%25&limit=9999"
        res = requests.get(f"{SUPABASE_REST_URL}/questions?{query}", headers=HEADERS)
        if res.status_code == 200:
            all_questions.extend(res.json())
    else:
        for s in series_list:
            query = f"select=*&paper=ilike.%25{paper}%25&series=ilike.%25{s}%25&limit=9999"
            res = requests.get(f"{SUPABASE_REST_URL}/questions?{query}", headers=HEADERS)
            if res.status_code == 200:
                data = res.json()
                if data:
                    all_questions.extend(data)

    if not all_questions:
        print(f"[WARN] No questions found for paper='{paper}', series='{series}'")
        try:
            sample = requests.get(
                f"{SUPABASE_REST_URL}/questions?select=paper,series,id&limit=10",
                headers=HEADERS,
            ).json()
            print("ℹ️ Example rows in DB:", sample)
        except Exception as e:
            print("⚠️ Sample fetch failed:", e)
        raise HTTPException(status_code=404, detail="No questions found")

    return all_questions

# =========================================================
# CACHED VERSION
# =========================================================
@lru_cache(maxsize=64)
def cached_fetch(paper, series):
    data = get_questions(paper, series)
    return tuple([tuple(q.items()) for q in data])

@app.get("/cached_questions")
def cached_questions(paper: str, series: str = ""):
    """Serve cached questions for better performance"""
    data = cached_fetch(paper, series)
    return [dict(d) for d in data]

# =========================================================
# PERFORMANCE TRACKING
# =========================================================
@app.post("/performance")
def save_performance(payload: dict):
    """
    Save user performance data to Supabase
    Expected: {user_id, paper, series, score, total}
    """
    url = f"{SUPABASE_REST_URL}/performance"
    res = requests.post(url, headers=HEADERS, json=payload)

    if res.status_code not in (200, 201):
        print("⚠️ Performance save failed:", res.text)
        raise HTTPException(status_code=res.status_code, detail=res.text)

    return {"status": "ok", "message": "Performance saved successfully"}

@app.get("/performance/{user_id}")
def get_user_performance(user_id: str):
    """Fetch all past performance records for a user"""
    url = f"{SUPABASE_REST_URL}/performance?user_id=eq.{user_id}&select=*"
    res = requests.get(url, headers=HEADERS)
    if res.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch performance")
    return sorted(res.json(), key=lambda x: x.get("id", 0), reverse=True)

# =========================================================
# HEALTH CHECK
# =========================================================
@app.get("/health")
def health():
    return {"status": "ok"}
