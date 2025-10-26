from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from functools import lru_cache
import os, requests

app = FastAPI(title="ApexNurse Webservice")

# =====================================
# CONFIGURATION
# =====================================
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")

SUPABASE_REST_URL = f"{SUPABASE_URL}/rest/v1"
HEADERS = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
}

# =====================================
# MIDDLEWARE (CORS FIX)
# =====================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # ✅ Allow frontend access from anywhere
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================
# BASIC ROUTE
# =====================================
@app.get("/")
def root():
    return {"message": "✅ ApexNurse backend running successfully."}


# =====================================
# FETCH PAPERS
# =====================================
@app.get("/papers")
def list_papers():
    """List distinct papers in Supabase"""
    url = f"{SUPABASE_REST_URL}/questions?select=paper"
    res = requests.get(url, headers=HEADERS)
    if res.status_code != 200:
        raise HTTPException(status_code=500, detail=f"Failed to fetch papers: {res.text}")

    papers = sorted({q.get("paper") for q in res.json() if q.get("paper")})
    if not papers:
        raise HTTPException(status_code=404, detail="No papers found in database")
    return papers


# =====================================
# FETCH SERIES FOR PAPER
# =====================================
@app.get("/series")
def list_series(paper: str):
    """List distinct series for a paper"""
    if not paper:
        raise HTTPException(status_code=400, detail="Missing paper name")

    url = f"{SUPABASE_REST_URL}/questions?select=series&paper=ilike.%25{paper}%25"
    res = requests.get(url, headers=HEADERS)
    if res.status_code != 200:
        raise HTTPException(status_code=500, detail=f"Failed to fetch series: {res.text}")

    s = sorted({q.get("series") for q in res.json() if q.get("series")})
    return s


# =====================================
# MAIN QUESTION FETCH
# =====================================
@app.get("/questions")
def get_questions(paper: str, series: str = ""):
    """
    Fetch questions for one or multiple series within a paper.
    Allows partial matches (e.g. Paper1_quicktest_5, Paper1 revision series 10)
    """
    if not paper:
        raise HTTPException(status_code=400, detail="Missing paper parameter")

    paper = paper.strip()
    series_list = [s.strip() for s in series.split(";") if s.strip()]
    all_questions = []

    if not series_list:
        # No series filter: fetch all questions for the paper
        query = f"select=*&paper=ilike.%25{paper}%25&limit=9999"
        res = requests.get(f"{SUPABASE_REST_URL}/questions?{query}", headers=HEADERS)
        if res.status_code == 200:
            all_questions.extend(res.json())
    else:
        # Fetch for each series pattern
        for s in series_list:
            # Loosened search to catch both underscores and spaces
            s_pattern = s.replace("_", " ")
            query = f"select=*&paper=ilike.%25{paper}%25&series=ilike.%25{s_pattern}%25&limit=9999"
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
            print("⚠️ Error checking sample rows:", e)

    return all_questions


# =====================================
# CACHED VERSION (faster repeat load)
# =====================================
@lru_cache(maxsize=64)
def cached_fetch(paper, series):
    data = get_questions(paper, series)
    # Convert list to tuple for cache compatibility
    return tuple([tuple(q.items()) for q in data])


@app.get("/cached_questions")
def cached_questions(paper: str, series: str = ""):
    """Serve questions with caching"""
    data = cached_fetch(paper, series)
    return [dict(d) for d in data]


# =====================================
# SAVE PERFORMANCE
# =====================================
@app.post("/performance")
def save_performance(payload: dict):
    """
    Save user performance summary to Supabase
    Expected payload:
      {
        "user_id": "...",
        "paper": "...",
        "series": "...",
        "score": 80,
        "total": 100
      }
    """
    url = f"{SUPABASE_REST_URL}/performance"
    res = requests.post(url, headers=HEADERS, json=payload)

    if res.status_code not in (200, 201):
        raise HTTPException(status_code=res.status_code, detail=res.text)

    return {"status": "ok", "message": "Performance saved successfully."}


# =====================================
# FETCH PERFORMANCE HISTORY
# =====================================
@app.get("/performance")
def get_performance(user_id: str):
    """
    Fetch past performance for a specific user
    """
    if not user_id:
        raise HTTPException(status_code=400, detail="Missing user_id")

    url = f"{SUPABASE_REST_URL}/performance?user_id=eq.{user_id}&select=*"
    res = requests.get(url, headers=HEADERS)
    if res.status_code != 200:
        raise HTTPException(status_code=res.status_code, detail=res.text)

    return res.json()


# =====================================
# HEALTHCHECK
# =====================================
@app.get("/health")
def health():
    return {"status": "ok"}
