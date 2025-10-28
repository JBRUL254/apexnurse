from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from functools import lru_cache
import os
import requests

app = FastAPI(title="ApexNurse Webservice")

# ======================================================
# 🔧 ENV CONFIG
# ======================================================
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("❌ Missing SUPABASE credentials")

SUPABASE_REST_URL = f"{SUPABASE_URL}/rest/v1"
HEADERS = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
}

# ======================================================
# 🌐 PERMANENT CORS FIX (WORKS ON RENDER)
# ======================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://apexnurse.onrender.com",
        "https://apexnurses.onrender.com",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================================================
# 🔹 ROOT
# ======================================================
@app.get("/")
def root():
    return {"message": "✅ ApexNurse backend online"}

# ======================================================
# 📄 PAPERS
# ======================================================
@app.get("/papers")
def list_papers():
    res = requests.get(f"{SUPABASE_REST_URL}/questions?select=paper", headers=HEADERS)
    if res.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch papers")
    papers = sorted({q.get("paper") for q in res.json() if q.get("paper")})
    return papers

# ======================================================
# 📚 SERIES
# ======================================================
@app.get("/series")
def list_series(paper: str):
    if not paper:
        raise HTTPException(status_code=400, detail="Missing paper name")
    res = requests.get(
        f"{SUPABASE_REST_URL}/questions?select=series&paper=ilike.%25{paper}%25",
        headers=HEADERS,
    )
    if res.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch series")
    s = sorted({q.get("series") for q in res.json() if q.get("series")})
    return s

# ======================================================
# ❓ QUESTIONS
# ======================================================
@app.get("/questions")
def get_questions(paper: str, series: str = ""):
    if not paper:
        raise HTTPException(status_code=400, detail="Missing paper parameter")

    all_questions = []
    if series:
        for s in [x.strip() for x in series.split(";") if x.strip()]:
            url = f"{SUPABASE_REST_URL}/questions?select=*&paper=ilike.%25{paper}%25&series=ilike.%25{s}%25"
            res = requests.get(url, headers=HEADERS)
            if res.status_code == 200:
                all_questions += res.json()
    else:
        res = requests.get(
            f"{SUPABASE_REST_URL}/questions?select=*&paper=ilike.%25{paper}%25",
            headers=HEADERS,
        )
        if res.status_code == 200:
            all_questions += res.json()

    return all_questions or []

# ======================================================
# ⚡ CACHED FETCH
# ======================================================
@lru_cache(maxsize=64)
def cached_fetch(paper, series):
    data = get_questions(paper, series)
    return tuple([tuple(q.items()) for q in data])

@app.get("/cached_questions")
def cached_questions(paper: str, series: str = ""):
    data = cached_fetch(paper, series)
    return [dict(d) for d in data]

# ======================================================
# 💾 PERFORMANCE SAVE
# ======================================================
@app.post("/performance")
def save_performance(payload: dict):
    url = f"{SUPABASE_REST_URL}/performance"
    res = requests.post(url, headers=HEADERS, json=payload)
    if res.status_code not in (200, 201):
        raise HTTPException(status_code=res.status_code, detail=res.text)
    return {"status": "ok"}

# ======================================================
# 🤖 DEEPSEEK INTEGRATION
# ======================================================
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
                    {"role": "system", "content": "You are a nursing tutor giving concise answers with short rationale."},
                    {"role": "user", "content": question},
                ],
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

        if "Rationale:" in answer_text:
            ans, rat = answer_text.split("Rationale:", 1)
            return {"answer": ans.strip(), "rationale": rat.strip()}

        return {"answer": answer_text, "rationale": ""}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DeepSeek request failed: {e}")

# ======================================================
# 💚 HEALTH
# ======================================================
@app.get("/health")
def health():
    return {"status": "ok"}
