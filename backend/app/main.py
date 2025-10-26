from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from functools import lru_cache
import os, requests

# =====================================================
# INITIALIZE FASTAPI
# =====================================================
app = FastAPI(title="ApexNurse Webservice")

# =====================================================
# CONFIGURATION
# =====================================================
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment")

SUPABASE_REST_URL = f"{SUPABASE_URL}/rest/v1"
HEADERS = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
}

# =====================================================
# MIDDLEWARE
# =====================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins for frontend use
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# ROOT
# =====================================================
@app.get("/")
def root():
    return {"message": "✅ ApexNurse backend running successfully."}

# =====================================================
# FETCH PAPERS
# =====================================================
@app.get("/papers")
def list_papers():
    """List distinct paper names available in the Supabase questions table"""
    url = f"{SUPABASE_REST_URL}/questions?select=paper"
    res = requests.get(url, headers=HEADERS)

    if res.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch papers from Supabase")

    papers = sorted({row.get("paper") for row in res.json() if row.get("paper")})
    print(f"📘 Found {len(papers)} papers")
    return papers

# =====================================================
# FETCH SERIES FOR A GIVEN PAPER
# =====================================================
@app.get("/series")
def list_series(paper: str):
    """List unique series for a selected paper"""
    if not paper:
        raise HTTPException(status_code=400, detail="Missing paper name")

    paper = paper.strip()
    url = f"{SUPABASE_REST_URL}/questions?select=series&paper=ilike.%25{paper}%25"
    res = requests.get(url, headers=HEADERS)

    if res.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch series")

    series = sorted({row.get("series") for row in res.json() if row.get("series")})
    print(f"📗 Found {len(series)} series for paper '{paper}'")
    return series

# =====================================================
# FETCH QUESTIONS FOR PAPER + SERIES
# =====================================================
@app.get("/questions")
def get_questions(paper: str, series: str = ""):
    """
    Fetch all questions for a given paper and optional series.
    Uses ilike filters to handle case-insensitive matches.
    """
    if not paper:
        raise HTTPException(status_code=400, detail="Missing paper parameter")

    paper = paper.strip()
    series = series.strip()
    all_questions = []

    # Build flexible Supabase REST query
    base_url = f"{SUPABASE_REST_URL}/questions?select=*"

    if series:
        # support multiple series separated by ';'
        series_list = [s.strip() for s in series.split(";") if s.strip()]
        for s in series_list:
            query = f"{base_url}&paper=ilike.%25{paper}%25&series=ilike.%25{s}%25&limit=9999"
            res = requests.get(query, headers=HEADERS)
            if res.status_code == 200:
                data = res.json()
                if data:
                    all_questions.extend(data)
    else:
        query = f"{base_url}&paper=ilike.%25{paper}%25&limit=9999"
        res = requests.get(query, headers=HEADERS)
        if res.status_code == 200:
            all_questions.extend(res.json())

    if not all_questions:
        print(f"⚠️ No questions found for paper='{paper}', series='{series}'")
        # debug help
        try:
            sample = requests.get(
                f"{SUPABASE_REST_URL}/questions?select=paper,series,id&limit=5",
                headers=HEADERS,
            ).json()
            print("ℹ️ Example data in DB:", sample)
        except Exception as e:
            print("Debug fetch failed:", e)
        return []

    print(f"✅ Returning {len(all_questions)} questions for {paper} / {series}")
    return all_questions

# =====================================================
# CACHED QUESTIONS ENDPOINT (for performance)
# =====================================================
@lru_cache(maxsize=64)
def cached_fetch(paper, series):
    data = get_questions(paper, series)
    return tuple([tuple(q.items()) for q in data])  # convert for cache hashing

@app.get("/cached_questions")
def cached_questions(paper: str, series: str = ""):
    data = cached_fetch(paper, series)
    return [dict(d) for d in data]

# =====================================================
# SAVE USER PERFORMANCE
# =====================================================
@app.post("/performance")
def save_performance(payload: dict):
    """
    Save test result to Supabase 'performance' table
    Expected payload: { user_id, paper, series, score, total }
    """
    required = ["user_id", "paper", "series", "score", "total"]
    if not all(k in payload for k in required):
        raise HTTPException(status_code=400, detail="Missing required fields in payload")

    url = f"{SUPABASE_REST_URL}/performance"
    res = requests.post(url, headers=HEADERS, json=payload)

    if res.status_code not in (200, 201):
        raise HTTPException(status_code=res.status_code, detail=res.text)

    print(f"📊 Saved performance: {payload}")
    return {"status": "ok"}

# =====================================================
# HEALTH CHECK
# =====================================================
@app.get("/health")
def health():
    return {"status": "ok"}
