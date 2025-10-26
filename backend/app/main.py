from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from functools import lru_cache
import os, requests

app = FastAPI(title="ApexNurse Backend with DeepSeek Reasoner")

# ==============================
# CONFIGURATION
# ==============================
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")

SUPABASE_REST_URL = f"{SUPABASE_URL}/rest/v1"
HEADERS = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
}

# ==============================
# MIDDLEWARE (CORS FIX)
# ==============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# BASIC ROUTE
# ==============================
@app.get("/")
def root():
    return {"message": "✅ ApexNurse backend with DeepSeek is running."}


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
# FETCH SERIES
# ==============================
@app.get("/series")
def list_series(paper: str):
    """List distinct series for a paper"""
    if not paper:
        raise HTTPException(status_code=400, detail="Missing paper name")
    url = f"{SUPABASE_REST_URL}/questions?select=series&paper=ilike.%25{paper}%25"
    res = requests.get(url, headers=HEADERS)
    if res.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch series")
    s = sorted({q.get("series") for q in res.json() if q.get("series")})
    return s


# ==============================
# FETCH QUESTIONS
# ==============================
@app.get("/questions")
def get_questions(paper: str, series: str = ""):
    """
    Fetch questions by paper and optional series (case-insensitive, flexible match).
    """
    if not paper:
        raise HTTPException(status_code=400, detail="Missing paper parameter")

    paper = paper.strip()
    series = series.strip() if series else ""

    all_questions = []

    # Build flexible query (both paper and optional series)
    if series:
        query = (
            f"select=*&paper=ilike.%25{paper}%25&series=ilike.%25{series}%25&limit=9999"
        )
    else:
        query = f"select=*&paper=ilike.%25{paper}%25&limit=9999"

    url = f"{SUPABASE_REST_URL}/questions?{query}"
    res = requests.get(url, headers=HEADERS)

    # Handle response
    if res.status_code == 200:
        data = res.json()
        if data:
            all_questions.extend(data)
        else:
            print(f"[INFO] No questions matched paper='{paper}', series='{series}'")
    else:
        print(f"[ERROR] Supabase query failed: {res.status_code} {res.text}")
        raise HTTPException(status_code=res.status_code, detail=res.text)

    # Safety check
    if not all_questions:
        # Try a broader fallback (just list first few for debugging)
        fallback = requests.get(
            f"{SUPABASE_REST_URL}/questions?select=paper,series,id&limit=5",
            headers=HEADERS,
        )
        print("[DEBUG] Fallback sample:", fallback.json())
        return []

    print(f"[SUCCESS] Retrieved {len(all_questions)} questions.")
    return all_questions


# ==============================
# PERFORMANCE TRACKING
# ==============================
@app.post("/performance")
def save_performance(payload: dict):
    """Save user performance summary"""
    url = f"{SUPABASE_REST_URL}/performance"
    res = requests.post(url, headers=HEADERS, json=payload)
    if res.status_code not in (200, 201):
        raise HTTPException(status_code=res.status_code, detail=res.text)
    return {"status": "ok"}


# ==============================
# DEEPSEEK REASONER ENDPOINT
# ==============================
@app.get("/reasoner")
def deepseek_reasoner(question: str):
    """
    Calls DeepSeek Reasoner API to generate short answer and rationale.
    """
    if not DEEPSEEK_API_KEY:
        raise HTTPException(status_code=500, detail="Missing DEEPSEEK_API_KEY in environment.")

    url = "https://api.deepseek.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": "deepseek-reasoner",
        "messages": [
            {
                "role": "system",
                "content": "You are a medical reasoning assistant. Provide short, clear answers with a brief rationale."
            },
            {
                "role": "user",
                "content": question
            }
        ],
        "max_tokens": 300,
    }

    try:
        res = requests.post(url, headers=headers, json=payload, timeout=30)
        if res.status_code != 200:
            print("DeepSeek Error:", res.text)
            raise HTTPException(status_code=500, detail="Failed to reach DeepSeek API")

        data = res.json()
        answer = data["choices"][0]["message"]["content"]
        return {"question": question, "reasoning": answer}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error contacting DeepSeek: {e}")


# ==============================
# HEALTHCHECK
# ==============================
@app.get("/health")
def health():
    return {"status": "ok"}
