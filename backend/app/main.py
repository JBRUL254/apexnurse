from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from functools import lru_cache
import os
import requests

# =====================================
# APP INITIALIZATION
# =====================================
app = FastAPI(title="ApexNurse Webservice")

# =====================================
# ENVIRONMENT CONFIGURATION
# =====================================
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

# =====================================
# CORS CONFIGURATION (Render-safe)
# =====================================
allowed_origins = [
    "https://apexnurse.onrender.com",
    "https://apexnurses.onrender.com",  # optional backup
    "http://localhost:5173",             # for local development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
    url = f"{SUPABASE_REST_URL}/questions?select=paper"
    res = requests.get(url, headers=HEADERS)
    if res.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch papers")
    papers = sorted({q.get("paper") for q in res.json() if q.get("paper")})
    return papers

# =====================================
# FETCH SERIES
# =====================================
@app.get("/series")
def list_series(paper: str):
    if not paper:
        raise HTTPException(status_code=400, detail="Missing paper name")
    url = f"{SUPABASE_REST_URL}/questions?select=series&paper=ilike.%25{paper}%25"
    res = requests.get(url, headers=HEADERS)
    if res.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch series")
    series_list = sorted({q.get("series") for q in res.json() if q.get("series")})
    return series_list

# =====================================
# FETCH QUESTIONS
# =====================================
@app.get("/questions")
def get_questions(paper: str, series: str = ""):
    if not paper:
        raise HTTPException(status_code=400, detail="Missing paper parameter")

    paper = paper.strip()
    series_list = [s.strip() for s in series.split(";") if s.strip()]
    all_questions = []

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
                all_questions.extend(res.json())

    return all_questions or []

# =====================================
# CACHED FETCH (PERFORMANCE BOOST)
# =====================================
@lru_cache(maxsize=64)
def cached_fetch(paper, series):
    data = get_questions(paper, series)
    return tuple([tuple(q.items()) for q in data])

@app.get("/cached_questions")
def cached_questions(paper: str, series: str = ""):
    data = cached_fetch(paper, series)
    return [dict(d) for d in data]

# =====================================
# SAVE PERFORMANCE
# =====================================
@app.post("/performance")
def save_performance(payload: dict):
    url = f"{SUPABASE_REST_URL}/performance"
    res = requests.post(url, headers=HEADERS, json=payload)
    if res.status_code not in (200, 201):
        raise HTTPException(status_code=res.status_code, detail=res.text)
    return {"status": "ok"}

# =====================================
# DEEPSEEK REASONER INTEGRATION
# =====================================
@app.get("/reasoner")
def reasoner(question: str):
    if not DEEPSEEK_API_KEY:
        raise HTTPException(status_code=500, detail="DeepSeek API key missing")

    try:
        response = requests.post(
            "https://api.deepseek.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "deepseek-reasoner",
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "You are a professional nursing tutor. "
                            "Answer accurately and include a short rationale."
                        ),
                    },
                    {"role": "user", "content": question},
                ],
                "temperature": 0.4,
            },
            timeout=25,
        )
        data = response.json()

        answer_text = (
            data.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
            .strip()
        )

        if not answer_text:
            return {"answer": "No response from DeepSeek.", "rationale": ""}

        # Split if rationale is included
        if "Rationale:" in answer_text:
            parts = answer_text.split("Rationale:")
            answer = parts[0].strip()
            rationale = parts[1].strip()
        else:
            answer, rationale = answer_text, ""

        # Return as CORS-safe JSON
        return JSONResponse(
            content={"answer": answer, "rationale": rationale},
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "*",
            },
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DeepSeek request failed: {str(e)}")

# =====================================
# HEALTH CHECK
# =====================================
@app.get("/health")
def health():
    return {"status": "ok"}
